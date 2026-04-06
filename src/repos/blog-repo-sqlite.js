const { run, get, all } = require("../db/sqlite-db");

// 创建文章：写入作者、标题、内容和时间戳。
async function createPost(db, payload) {
  const now = new Date().toISOString();
  const result = await run(
    db,
    "INSERT INTO posts (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [payload.userId, payload.title, payload.content, now, now]
  );
  return getPostById(db, result.lastID);
}

// 创建评论：写入评论所属文章、评论作者、评论内容。
async function createComment(db, payload) {
  const now = new Date().toISOString();
  const result = await run(
    db,
    "INSERT INTO comments (post_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [payload.postId, payload.userId, payload.content, now, now]
  );
  return getCommentById(db, result.lastID);
}

async function getPostById(db, id) {
  return get(db, "SELECT id, user_id, title, content, created_at, updated_at FROM posts WHERE id = ?", [id]);
}

async function getCommentById(db, id) {
  return get(db, "SELECT id, post_id, user_id, content, created_at, updated_at FROM comments WHERE id = ?", [id]);
}

// 联表查询：按文章 id 查询详情，并附带作者信息。
// 设计原因：
// 1) 详情页通常需要“文章 + 作者”一起返回，避免前端再发一次用户查询。
// 2) 用参数占位符传 id，避免 SQL 注入风险。
async function getPostWithAuthorById(db, id) {
  return get(
    db,
    `SELECT
      p.id,
      p.user_id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,
      u.id AS author_id,
      u.name AS author_name,
      u.email AS author_email
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?`,
    [id]
  );
}

// 更新文章：支持部分更新 title/content。
async function updatePostById(db, id, payload) {
  const current = await getPostById(db, id);
  if (!current) {
    return null;
  }

  const nextTitle = payload.title ?? current.title;
  const nextContent = payload.content ?? current.content;
  const now = new Date().toISOString();

  await run(db, "UPDATE posts SET title = ?, content = ?, updated_at = ? WHERE id = ?", [nextTitle, nextContent, now, id]);
  return getPostById(db, id);
}

// 删除文章：删除成功返回 true，不存在返回 false。
// 注意：由于外键配置了 ON DELETE CASCADE，关联评论会自动删除。
async function deletePostById(db, id) {
  const current = await getPostById(db, id);
  if (!current) {
    return false;
  }
  await run(db, "DELETE FROM posts WHERE id = ?", [id]);
  return true;
}

// 更新评论：当前仅支持修改 content。
async function updateCommentById(db, id, payload) {
  const current = await getCommentById(db, id);
  if (!current) {
    return null;
  }

  const nextContent = payload.content ?? current.content;
  const now = new Date().toISOString();

  await run(db, "UPDATE comments SET content = ?, updated_at = ? WHERE id = ?", [nextContent, now, id]);
  return getCommentById(db, id);
}

// 删除评论：删除成功返回 true，不存在返回 false。
async function deleteCommentById(db, id) {
  const current = await getCommentById(db, id);
  if (!current) {
    return false;
  }
  await run(db, "DELETE FROM comments WHERE id = ?", [id]);
  return true;
}

// 联表查询：查文章列表并带上作者信息。
// 为什么这样写：
// 1) posts p 是主表，决定返回几行文章
// 2) JOIN users u 把作者昵称和邮箱拼到同一行里，减少前端二次查询
async function listPostsWithAuthor(db) {
  return all(
    db,
    `SELECT
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,
      u.id AS author_id,
      u.name AS author_name,
      u.email AS author_email
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.id DESC`
  );
}

// 联表查询（带 query 参数）：支持关键词、作者过滤、分页和排序。
// 设计原因：
// 1) 列表筛选属于典型 query 场景，参数应来自 URL 查询串。
// 2) WHERE 条件用占位符，ORDER BY 用白名单，避免注入风险。
// 3) 列表与总数分两条 SQL，便于返回分页元信息。
async function listPostsWithAuthorQuery(db, options) {
  const page = options.page;
  const pageSize = options.pageSize;
  const keyword = (options.keyword || "").trim();
  const authorId = Number.isInteger(options.authorId) && options.authorId > 0 ? options.authorId : null;
  const sortBy = options.sortBy === "created_at" ? "created_at" : "id";
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
  const offset = (page - 1) * pageSize;

  const conditions = [];
  const params = [];

  if (keyword) {
    conditions.push("(p.title LIKE ? OR p.content LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (authorId) {
    conditions.push("p.user_id = ?");
    params.push(authorId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const list = await all(
    db,
    `SELECT
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,
      u.id AS author_id,
      u.name AS author_name,
      u.email AS author_email
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ${where}
    ORDER BY p.${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const totalRow = await get(
    db,
    `SELECT COUNT(*) AS total
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ${where}`,
    params
  );

  const total = totalRow ? totalRow.total : 0;
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 联表查询（高级 body 条件版）：
// - 适合过滤条件较多、数组条件较复杂的场景
// - 输入通常来自 POST body，而不是 URL query
async function listPostsWithAuthorAdvancedQuery(db, options) {
  const page = options.page;
  const pageSize = options.pageSize;
  const keywords = Array.isArray(options.keywords) ? options.keywords : [];
  const authorIds = Array.isArray(options.authorIds) ? options.authorIds : [];
  const createdFrom = options.createdFrom || "";
  const createdTo = options.createdTo || "";
  const sortBy = options.sortBy === "created_at" ? "created_at" : "id";
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
  const offset = (page - 1) * pageSize;

  const conditions = [];
  const params = [];

  if (keywords.length > 0) {
    const keywordConditions = keywords.map(() => "(p.title LIKE ? OR p.content LIKE ?)").join(" OR ");
    conditions.push(`(${keywordConditions})`);
    keywords.forEach((keyword) => {
      params.push(`%${keyword}%`, `%${keyword}%`);
    });
  }

  if (authorIds.length > 0) {
    const placeholders = authorIds.map(() => "?").join(", ");
    conditions.push(`p.user_id IN (${placeholders})`);
    params.push(...authorIds);
  }

  if (createdFrom) {
    conditions.push("p.created_at >= ?");
    params.push(createdFrom);
  }

  if (createdTo) {
    conditions.push("p.created_at <= ?");
    params.push(createdTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const list = await all(
    db,
    `SELECT
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,
      u.id AS author_id,
      u.name AS author_name,
      u.email AS author_email
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ${where}
    ORDER BY p.${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const totalRow = await get(
    db,
    `SELECT COUNT(*) AS total
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ${where}`,
    params
  );

  const total = totalRow ? totalRow.total : 0;
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 联表查询：查某篇文章的评论，并带上评论用户信息。
// 为什么这样写：
// 1) comments c 是主表，筛选条件在 c.post_id
// 2) JOIN users u 让每条评论直接带评论人信息
async function listCommentsByPostId(db, postId) {
  return all(
    db,
    `SELECT
      c.id,
      c.post_id,
      c.content,
      c.created_at,
      c.updated_at,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.id ASC`,
    [postId]
  );
}

// 聚合查询：返回文章列表并带评论数。
// 为什么要 LEFT JOIN：
// - 如果某篇文章还没有评论，LEFT JOIN 仍然保留这篇文章（评论字段为 NULL）。
// - 如果用普通 JOIN，没有评论的文章会被过滤掉，不符合列表展示场景。
//
// 为什么要 GROUP BY：
// - 一篇文章可能有多条评论，JOIN 后会变成多行。
// - 通过 GROUP BY 把“同一文章的多行评论”聚合回一行，再用 COUNT 统计条数。
async function listPostsWithCommentStats(db) {
  return all(
    db,
    `SELECT
      p.id,
      p.title,
      p.created_at,
      u.name AS author_name,
      COUNT(c.id) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON c.post_id = p.id
    GROUP BY p.id, p.title, p.created_at, u.name
    ORDER BY p.id DESC`
  );
}

// 进阶聚合查询：支持 HAVING 过滤和按评论数排序。
// 为什么用 HAVING：
// - WHERE 发生在聚合前，拿不到 COUNT(c.id) 这样的聚合结果。
// - HAVING 发生在 GROUP BY 之后，可以基于评论数做过滤。
//
// 为什么把排序字段限定为白名单：
// - ORDER BY 不能像 WHERE 一样用 ? 占位参数传字段名。
// - 所以必须先在代码里做白名单判断，避免 SQL 注入风险。
async function listPostsWithCommentStatsAdvanced(db, options) {
  const minComments = Number.isInteger(options.minComments) && options.minComments > 0 ? options.minComments : 0;
  // 默认按文章主键排序时显式写 p.id，避免多表聚合场景下出现列名歧义。
  const sortBy = options.sortBy === "comment_count" ? "comment_count" : "p.id";
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";

  const having = minComments > 0 ? "HAVING COUNT(c.id) >= ?" : "";
  const params = minComments > 0 ? [minComments] : [];

  return all(
    db,
    `SELECT
      p.id,
      p.title,
      p.created_at,
      u.name AS author_name,
      COUNT(c.id) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON c.post_id = p.id
    GROUP BY p.id, p.title, p.created_at, u.name
    ${having}
    ORDER BY ${sortBy} ${sortOrder}, p.id DESC`,
    params
  );
}

// 分页版聚合查询：给后台列表接口使用。
// 设计思路：
// 1) 先跑一条“主查询”拿当前页数据：GROUP BY + HAVING + ORDER BY + LIMIT/OFFSET
// 2) 再跑一条“计数查询”拿总条数：同样的 GROUP BY + HAVING，但外层再 COUNT(*)
// 为什么不能直接 COUNT(c.id) 当总数：
// - COUNT(c.id) 统计的是评论条数，不是文章条数。
// - 我们要的是“符合条件的文章有多少篇”，所以必须对分组后的结果再数一次。
async function listPostsWithCommentStatsPage(db, options) {
  const minComments = Number.isInteger(options.minComments) && options.minComments > 0 ? options.minComments : 0;
  // 默认按文章主键排序时显式写 p.id，避免多表聚合场景下出现列名歧义。
  const sortBy = options.sortBy === "comment_count" ? "comment_count" : "p.id";
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
  const page = Number.isInteger(options.page) && options.page > 0 ? options.page : 1;
  const pageSize = Number.isInteger(options.pageSize) && options.pageSize > 0 ? options.pageSize : 10;
  const offset = (page - 1) * pageSize;

  const having = minComments > 0 ? "HAVING COUNT(c.id) >= ?" : "";
  const params = minComments > 0 ? [minComments] : [];

  const list = await all(
    db,
    `SELECT
      p.id,
      p.title,
      p.created_at,
      u.name AS author_name,
      COUNT(c.id) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON c.post_id = p.id
    GROUP BY p.id, p.title, p.created_at, u.name
    ${having}
    ORDER BY ${sortBy} ${sortOrder}, p.id DESC
    LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const totalRow = await get(
    db,
    `SELECT COUNT(*) AS total
     FROM (
       SELECT p.id
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN comments c ON c.post_id = p.id
       GROUP BY p.id, p.title, p.created_at, u.name
       ${having}
     ) grouped_posts`,
    params
  );

  const total = totalRow ? totalRow.total : 0;

  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

module.exports = {
  createPost,
  createComment,
  getPostById,
  getPostWithAuthorById,
  getCommentById,
  updatePostById,
  deletePostById,
  updateCommentById,
  deleteCommentById,
  listPostsWithAuthor,
  listPostsWithAuthorQuery,
  listPostsWithAuthorAdvancedQuery,
  listCommentsByPostId,
  listPostsWithCommentStats,
  listPostsWithCommentStatsAdvanced,
  listPostsWithCommentStatsPage,
};
