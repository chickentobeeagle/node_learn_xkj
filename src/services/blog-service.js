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
const { parseId } = require("../app/http");
const {
  validatePostDetailParams,
  normalizePostSearchQuery,
  normalizePostStatsQuery,
  validateAdvancedPostSearchBody,
} = require("../app/request-validators");
const { ok, created, badRequest, notFound, internalError } = require("../app/service-results");

// 文章列表服务：返回文章 + 作者信息。
async function listPosts(db) {
  try {
    const list = await listPostsWithAuthor(db);
    return ok(list);
  } catch (error) {
    return internalError("读取文章列表失败", error);
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
    return ok(result);
  } catch (error) {
    return internalError("搜索文章失败", error);
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
    return ok(result);
  } catch (error) {
    return internalError("高级搜索文章失败", error);
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
      return notFound("文章不存在");
    }
    return ok(post);
  } catch (error) {
    return internalError("读取文章详情失败", error);
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
    return badRequest("缺少 userId/title/content 或参数格式不正确");
  }

  try {
    const user = await findUserById(db, userId);
    if (!user) {
      return notFound("作者用户不存在");
    }
    const post = await createPost(db, { userId, title, content });
    return created(post, "文章已创建");
  } catch (error) {
    return internalError("创建文章失败", error);
  }
}

// 更新文章服务：支持 title/content 部分更新。
async function updatePostRecord(db, idValue, body) {
  // 路径参数 id，对应要更新的文章主键。
  const postId = parseId(idValue);
  if (!postId) {
    return badRequest("文章 id 必须是正整数");
  }

  const title = body && typeof body.title === "string" ? body.title.trim() : undefined;
  const content = body && typeof body.content === "string" ? body.content.trim() : undefined;

  if (!title && !content) {
    return badRequest("至少传入 title 或 content 其中一个字段");
  }

  try {
    const post = await updatePostById(db, postId, { title, content });
    if (!post) {
      return notFound("文章不存在");
    }
    return ok(post, "文章已更新");
  } catch (error) {
    return internalError("更新文章失败", error);
  }
}

// 删除文章服务：删除成功后依赖外键级联删除评论。
async function deletePostRecord(db, idValue) {
  const postId = parseId(idValue);
  if (!postId) {
    return badRequest("文章 id 必须是正整数");
  }

  try {
    const okToDelete = await deletePostById(db, postId);
    if (!okToDelete) {
      return notFound("文章不存在");
    }
    return ok({ id: postId }, "文章已删除");
  } catch (error) {
    return internalError("删除文章失败", error);
  }
}

// 查询文章评论服务：先校验文章存在，再查评论列表。
async function listPostComments(db, postIdValue) {
  const postId = parseId(postIdValue);
  if (!postId) {
    return badRequest("文章 id 必须是正整数");
  }

  try {
    const post = await getPostById(db, postId);
    if (!post) {
      return notFound("文章不存在");
    }
    const comments = await listCommentsByPostId(db, postId);
    return ok(comments);
  } catch (error) {
    return internalError("读取评论列表失败", error);
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
    return badRequest("缺少 postId/userId/content 或参数格式不正确");
  }

  try {
    const post = await getPostById(db, postId);
    if (!post) {
      return notFound("目标文章不存在");
    }

    const user = await findUserById(db, userId);
    if (!user) {
      return notFound("评论用户不存在");
    }

    const comment = await createComment(db, { postId, userId, content });
    return created(comment, "评论已创建");
  } catch (error) {
    return internalError("创建评论失败", error);
  }
}

// 更新评论服务：当前只允许更新 content 字段。
async function updateCommentRecord(db, idValue, body) {
  const commentId = parseId(idValue);
  if (!commentId) {
    return badRequest("评论 id 必须是正整数");
  }

  const content = body && typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return badRequest("缺少 content 或参数格式不正确");
  }

  try {
    const comment = await updateCommentById(db, commentId, { content });
    if (!comment) {
      return notFound("评论不存在");
    }
    return ok(comment, "评论已更新");
  } catch (error) {
    return internalError("更新评论失败", error);
  }
}

// 删除评论服务：按评论 id 删除记录。
async function deleteCommentRecord(db, idValue) {
  const commentId = parseId(idValue);
  if (!commentId) {
    return badRequest("评论 id 必须是正整数");
  }

  try {
    const okToDelete = await deleteCommentById(db, commentId);
    if (!okToDelete) {
      return notFound("评论不存在");
    }
    return ok({ id: commentId }, "评论已删除");
  } catch (error) {
    return internalError("删除评论失败", error);
  }
}

// 文章统计服务：
// - 解析分页/排序/最少评论数参数
// - 交给 repo 进行聚合分页查询
async function listPostStats(db, query) {
  // query 参数统一交给业务校验工具归一化。
  const queryOptions = normalizePostStatsQuery(query);

  try {
    const result = await listPostsWithCommentStatsPage(db, queryOptions);
    return ok(result);
  } catch (error) {
    return internalError("读取文章统计失败", error);
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
