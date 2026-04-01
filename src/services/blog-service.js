const {
  listPostsWithAuthor,
  listPostsWithAuthorQuery,
  listPostsWithAuthorAdvancedQuery,
  listPostsWithCommentStatsPage,
  listCommentsByPostId,
  createPost,
  createComment,
  getPostById,
  getPostWithAuthorById,
  updatePostById,
  deletePostById,
  updateCommentById,
  deleteCommentById,
} = require("../repos/blog-repo-sqlite");
const { findUserById } = require("../repos/user-repo-sqlite");
const { parseId, parsePositiveInt, normalizeSortOrder, normalizeStatsSortBy } = require("../app/http");
const {
  validatePostDetailParams,
  normalizePostSearchQuery,
  validateAdvancedPostSearchBody,
} = require("../app/request-validators");

// 文章列表服务：返回文章 + 作者信息。
async function listPosts(db) {
  try {
    const list = await listPostsWithAuthor(db);
    return { status: 200, payload: { message: "OK", data: list } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "读取文章列表失败", data: error.message } };
  }
}

// 文章搜索服务（query 场景）：
// - 参数来源：req.query
// - 支持：keyword/authorId/page/pageSize/sortBy/sortOrder
async function searchPosts(db, query) {
  // query 参数统一交给业务校验工具归一化。
  const queryOptions = normalizePostSearchQuery(query);

  try {
    const result = await listPostsWithAuthorQuery(db, queryOptions);
    return { status: 200, payload: { message: "OK", data: result } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "搜索文章失败", data: error.message } };
  }
}

// 文章高级搜索服务（body 场景）：
// - 参数来源：req.body
// - 适合数组条件、多字段组合过滤、时间区间过滤
// - 支持：keywords(author/title/content 模糊词数组)、authorIds、createdFrom/createdTo、分页与排序
async function searchPostsAdvanced(db, body) {
  // body 参数统一交给业务校验工具处理。
  const validationResult = validateAdvancedPostSearchBody(body);
  if (!validationResult.ok) {
    return validationResult.error;
  }

  // 已通过校验并标准化后的高级搜索条件。
  const queryOptions = validationResult.value;

  try {
    const result = await listPostsWithAuthorAdvancedQuery(db, queryOptions);
    return { status: 200, payload: { message: "OK", data: result } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "高级搜索文章失败", data: error.message } };
  }
}

// 文章详情服务：根据路径参数 id 查询“文章 + 作者信息”。
// 返回语义：
// - id 非法 -> 400
// - 文章不存在 -> 404
// - 查询成功 -> 200
async function getPostDetail(db, idValue) {
  // params 参数统一交给业务校验工具处理。
  const validationResult = validatePostDetailParams(idValue);
  if (!validationResult.ok) {
    return validationResult.error;
  }

  // 已通过校验的文章主键 id。
  const postId = validationResult.value.postId;

  try {
    const post = await getPostWithAuthorById(db, postId);
    if (!post) {
      return { status: 404, payload: { code: 1, message: "文章不存在" } };
    }
    return { status: 200, payload: { message: "OK", data: post } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "读取文章详情失败", data: error.message } };
  }
}

// 创建文章服务：
// - 校验 userId/title/content
// - 校验作者是否存在
// - 调用 repo 执行写入
async function createPostRecord(db, body) {
  // 作者用户 id，来自 body。
  const userId = parseId(body ? body.userId : null);
  // 文章标题，去除首尾空白。
  const title = body && typeof body.title === "string" ? body.title.trim() : "";
  // 文章正文，去除首尾空白。
  const content = body && typeof body.content === "string" ? body.content.trim() : "";

  if (!userId || !title || !content) {
    return { status: 400, payload: { code: 1, message: "缺少 userId/title/content 或参数格式不正确" } };
  }

  try {
    const user = await findUserById(db, userId);
    if (!user) {
      return { status: 404, payload: { code: 1, message: "作者用户不存在" } };
    }
    const post = await createPost(db, { userId, title, content });
    return { status: 201, payload: { message: "文章已创建", data: post } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "创建文章失败", data: error.message } };
  }
}

// 更新文章服务：支持 title/content 部分更新。
async function updatePostRecord(db, idValue, body) {
  // 路径参数 id，对应要更新的文章主键。
  const postId = parseId(idValue);
  if (!postId) {
    return { status: 400, payload: { code: 1, message: "文章 id 必须是正整数" } };
  }

  const title = body && typeof body.title === "string" ? body.title.trim() : undefined;
  const content = body && typeof body.content === "string" ? body.content.trim() : undefined;

  if (!title && !content) {
    return { status: 400, payload: { code: 1, message: "至少传入 title 或 content 其中一个字段" } };
  }

  try {
    const post = await updatePostById(db, postId, { title, content });
    if (!post) {
      return { status: 404, payload: { code: 1, message: "文章不存在" } };
    }
    return { status: 200, payload: { message: "文章已更新", data: post } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "更新文章失败", data: error.message } };
  }
}

// 删除文章服务：删除成功后依赖外键级联删除评论。
async function deletePostRecord(db, idValue) {
  const postId = parseId(idValue);
  if (!postId) {
    return { status: 400, payload: { code: 1, message: "文章 id 必须是正整数" } };
  }

  try {
    const ok = await deletePostById(db, postId);
    if (!ok) {
      return { status: 404, payload: { code: 1, message: "文章不存在" } };
    }
    return { status: 200, payload: { message: "文章已删除", data: { id: postId } } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "删除文章失败", data: error.message } };
  }
}

// 查询文章评论服务：先校验文章存在，再查评论列表。
async function listPostComments(db, postIdValue) {
  const postId = parseId(postIdValue);
  if (!postId) {
    return { status: 400, payload: { code: 1, message: "文章 id 必须是正整数" } };
  }

  try {
    const post = await getPostById(db, postId);
    if (!post) {
      return { status: 404, payload: { code: 1, message: "文章不存在" } };
    }
    const comments = await listCommentsByPostId(db, postId);
    return { status: 200, payload: { message: "OK", data: comments } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "读取评论列表失败", data: error.message } };
  }
}

// 创建评论服务：
// - 校验 postId/userId/content
// - 校验目标文章和评论用户都存在
async function createCommentRecord(db, body) {
  // 被评论文章 id。
  const postId = parseId(body ? body.postId : null);
  // 评论用户 id。
  const userId = parseId(body ? body.userId : null);
  // 评论正文。
  const content = body && typeof body.content === "string" ? body.content.trim() : "";

  if (!postId || !userId || !content) {
    return { status: 400, payload: { code: 1, message: "缺少 postId/userId/content 或参数格式不正确" } };
  }

  try {
    const post = await getPostById(db, postId);
    if (!post) {
      return { status: 404, payload: { code: 1, message: "目标文章不存在" } };
    }

    const user = await findUserById(db, userId);
    if (!user) {
      return { status: 404, payload: { code: 1, message: "评论用户不存在" } };
    }

    const comment = await createComment(db, { postId, userId, content });
    return { status: 201, payload: { message: "评论已创建", data: comment } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "创建评论失败", data: error.message } };
  }
}

// 更新评论服务：当前只允许更新 content 字段。
async function updateCommentRecord(db, idValue, body) {
  const commentId = parseId(idValue);
  if (!commentId) {
    return { status: 400, payload: { code: 1, message: "评论 id 必须是正整数" } };
  }

  const content = body && typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return { status: 400, payload: { code: 1, message: "缺少 content 或参数格式不正确" } };
  }

  try {
    const comment = await updateCommentById(db, commentId, { content });
    if (!comment) {
      return { status: 404, payload: { code: 1, message: "评论不存在" } };
    }
    return { status: 200, payload: { message: "评论已更新", data: comment } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "更新评论失败", data: error.message } };
  }
}

// 删除评论服务：按评论 id 删除记录。
async function deleteCommentRecord(db, idValue) {
  const commentId = parseId(idValue);
  if (!commentId) {
    return { status: 400, payload: { code: 1, message: "评论 id 必须是正整数" } };
  }

  try {
    const ok = await deleteCommentById(db, commentId);
    if (!ok) {
      return { status: 404, payload: { code: 1, message: "评论不存在" } };
    }
    return { status: 200, payload: { message: "评论已删除", data: { id: commentId } } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "删除评论失败", data: error.message } };
  }
}

// 文章统计服务：
// - 解析分页/排序/最少评论数参数
// - 交给 repo 进行聚合分页查询
async function listPostStats(db, query) {
  // 统计列表页码。
  const page = parsePositiveInt(query.page, 1);
  // 统计列表每页条数。
  const pageSize = parsePositiveInt(query.pageSize, 10);
  // pageSize 上限保护。
  const safePageSize = Math.min(pageSize, 50);
  // 最少评论数筛选条件。
  const minComments = parsePositiveInt(query.minComments, 0);
  // 排序字段白名单：id/comment_count。
  const sortBy = normalizeStatsSortBy(query.sortBy);
  // 排序方向：ASC/DESC。
  const sortOrder = normalizeSortOrder(query.sortOrder);

  try {
    const result = await listPostsWithCommentStatsPage(db, {
      page,
      pageSize: safePageSize,
      minComments,
      sortBy,
      sortOrder,
    });
    return { status: 200, payload: { message: "OK", data: result } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "读取文章统计失败", data: error.message } };
  }
}

module.exports = {
  listPosts,
  searchPosts,
  searchPostsAdvanced,
  getPostDetail,
  createPostRecord,
  updatePostRecord,
  deletePostRecord,
  listPostComments,
  createCommentRecord,
  updateCommentRecord,
  deleteCommentRecord,
  listPostStats,
};
