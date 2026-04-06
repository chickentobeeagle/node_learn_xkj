const { parseId, parsePositiveInt, normalizeSortBy, normalizeSortOrder, normalizeStatsSortBy } = require("./http");
const { badRequest } = require("./service-results");

// 校验文章详情接口的 params 参数。
// - idValue: 路径参数中的文章 id
// - 返回值：成功时返回标准化后的 postId，失败时返回 400 错误对象
function validatePostDetailParams(idValue) {
  // 文章主键 id，要求是正整数。
  const postId = parseId(idValue);
  if (!postId) {
    return { ok: false, error: badRequest("文章 id 必须是正整数") };
  }

  return { ok: true, value: { postId } };
}

// 归一化文章搜索接口的 query 参数。
// - query: Express 的 req.query
// - 返回值：repo 可直接消费的分页/筛选/排序参数对象
function normalizePostSearchQuery(query) {
  // query 源对象，未传时回退为空对象，避免读取属性时报错。
  const sourceQuery = query || {};
  // 页码参数，非法时回退到第 1 页。
  const page = parsePositiveInt(sourceQuery.page, 1);
  // 每页条数参数，非法时回退到 10。
  const pageSize = parsePositiveInt(sourceQuery.pageSize, 10);
  // 单页上限保护，避免一次拉取过多数据。
  const safePageSize = Math.min(pageSize, 50);
  // 关键字参数，统一转成字符串并去除首尾空白。
  const keyword = typeof sourceQuery.keyword === "string" ? sourceQuery.keyword.trim() : "";
  // 作者 id，非法时视为“不按作者过滤”。
  const authorId = parsePositiveInt(sourceQuery.authorId, null);
  // 排序字段白名单。
  const sortBy = normalizeSortBy(sourceQuery.sortBy);
  // 排序方向白名单。
  const sortOrder = normalizeSortOrder(sourceQuery.sortOrder);

  return {
    page,
    pageSize: safePageSize,
    keyword,
    authorId,
    sortBy,
    sortOrder,
  };
}

// 归一化用户列表接口的 query 参数。
// - query: Express 的 req.query
// - 返回值：用户 repo 可直接消费的分页/筛选/排序参数对象
function normalizeUserListQuery(query) {
  // query 源对象，未传时回退为空对象，避免读取属性时报错。
  const sourceQuery = query || {};
  // 页码参数，非法时回退到第 1 页。
  const page = parsePositiveInt(sourceQuery.page, 1);
  // 每页条数参数，非法时回退到 10。
  const pageSize = parsePositiveInt(sourceQuery.pageSize, 10);
  // 单页上限保护，避免一次查太多用户。
  const safePageSize = Math.min(pageSize, 50);
  // 关键字参数，统一去除首尾空白。
  const keyword = typeof sourceQuery.keyword === "string" ? sourceQuery.keyword.trim() : "";
  // 排序字段白名单。
  const sortBy = normalizeSortBy(sourceQuery.sortBy);
  // 排序方向白名单。
  const sortOrder = normalizeSortOrder(sourceQuery.sortOrder);
  // 创建时间区间筛选参数，统一去除首尾空白。
  const createdFrom = typeof sourceQuery.createdFrom === "string" ? sourceQuery.createdFrom.trim() : "";
  const createdTo = typeof sourceQuery.createdTo === "string" ? sourceQuery.createdTo.trim() : "";

  return {
    page,
    pageSize: safePageSize,
    keyword,
    sortBy,
    sortOrder,
    createdFrom,
    createdTo,
  };
}

// 归一化文章统计接口的 query 参数。
// - query: Express 的 req.query
// - 返回值：聚合统计 repo 可直接消费的分页/筛选/排序参数对象
function normalizePostStatsQuery(query) {
  // query 源对象，未传时回退为空对象。
  const sourceQuery = query || {};
  // 页码参数，非法时回退到第 1 页。
  const page = parsePositiveInt(sourceQuery.page, 1);
  // 每页条数参数，非法时回退到 10。
  const pageSize = parsePositiveInt(sourceQuery.pageSize, 10);
  // 单页上限保护。
  const safePageSize = Math.min(pageSize, 50);
  // 最少评论数参数，非法时回退到 0，表示不过滤。
  const minComments = parsePositiveInt(sourceQuery.minComments, 0);
  // 统计排序字段白名单：id/comment_count。
  const sortBy = normalizeStatsSortBy(sourceQuery.sortBy);
  // 排序方向白名单。
  const sortOrder = normalizeSortOrder(sourceQuery.sortOrder);

  return {
    page,
    pageSize: safePageSize,
    minComments,
    sortBy,
    sortOrder,
  };
}

// 校验并归一化文章高级搜索的 body 参数。
// - body: Express 的 req.body
// - 返回值：成功时返回标准化后的查询对象，失败时返回 400 错误对象
function validateAdvancedPostSearchBody(body) {
  // body 源对象，未传时回退为空对象，避免访问属性时报错。
  const sourceBody = body || {};
  // 关键词数组：去空格、过滤空串，保证 repo 只拿到有效模糊词。
  const keywords = Array.isArray(sourceBody.keywords)
    ? sourceBody.keywords
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : [];
  // 作者 id 数组：只保留正整数，并去重。
  const authorIds = Array.isArray(sourceBody.authorIds)
    ? [...new Set(sourceBody.authorIds.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))]
    : [];
  // 创建时间起始值，空值回退为空字符串。
  const createdFrom = typeof sourceBody.createdFrom === "string" ? sourceBody.createdFrom.trim() : "";
  // 创建时间结束值，空值回退为空字符串。
  const createdTo = typeof sourceBody.createdTo === "string" ? sourceBody.createdTo.trim() : "";

  if (keywords.length === 0 && authorIds.length === 0 && !createdFrom && !createdTo) {
    return {
      ok: false,
      error: badRequest("高级搜索至少需要一个过滤条件（keywords/authorIds/createdFrom/createdTo）"),
    };
  }

  // 页码参数，非法时回退到第 1 页。
  const page = parsePositiveInt(sourceBody.page, 1);
  // 每页条数参数，非法时回退到 10。
  const pageSize = parsePositiveInt(sourceBody.pageSize, 10);
  // 单页上限保护，避免大分页。
  const safePageSize = Math.min(pageSize, 50);
  // 排序字段白名单。
  const sortBy = normalizeSortBy(sourceBody.sortBy);
  // 排序方向白名单。
  const sortOrder = normalizeSortOrder(sourceBody.sortOrder);

  return {
    ok: true,
    value: {
      keywords,
      authorIds,
      createdFrom,
      createdTo,
      page,
      pageSize: safePageSize,
      sortBy,
      sortOrder,
    },
  };
}

module.exports = {
  validatePostDetailParams,
  normalizePostSearchQuery,
  normalizeUserListQuery,
  normalizePostStatsQuery,
  validateAdvancedPostSearchBody,
};
