const express = require("express");
const { sendJSON } = require("../app/http");
const {
  listPosts,
  searchPosts,
  searchPostsAdvanced,
  getPostDetail,
  createPostRecord,
  updatePostRecord,
  deletePostRecord,
  listPostComments,
  listPostStats,
} = require("../services/blog-service");

// 文章路由工厂：
// - 统一挂载在 /posts 前缀下
// - 评论列表子路由 /:id/comments 也放在这里，保持“从文章进入评论”的学习路径
function createPostsRouter(getDb) {
  // 文章域独立 Router，避免所有接口挤在一个文件中。
  const router = express.Router();

  // GET /posts：查询文章列表（含作者信息）。
  router.get("/", async (req, res) => {
    const result = await listPosts(getDb());
    sendJSON(res, result.status, result.payload);
  });

  // GET /posts/stats：查询文章评论统计（分页/筛选/排序）。
  router.get("/stats", async (req, res) => {
    const result = await listPostStats(getDb(), req.query || {});
    sendJSON(res, result.status, result.payload);
  });

  // GET /posts/search：文章搜索列表（query 参数）。
  // 参数示例：
  // - keyword=sql
  // - page=1&pageSize=5
  // - sortBy=created_at&sortOrder=DESC
  // - authorId=1
  router.get("/search", async (req, res) => {
    const result = await searchPosts(getDb(), req.query || {});
    sendJSON(res, result.status, result.payload);
  });

  // POST /posts/search-advanced：文章高级搜索（body 参数）。
  // 适用场景：
  // - 过滤条件较多
  // - 含数组条件（如 authorIds、keywords）
  // - URL query 过长不便维护
  router.post("/search-advanced", async (req, res) => {
    const result = await searchPostsAdvanced(getDb(), req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // GET /posts/:id：查询单篇文章详情（含作者信息）。
  // 说明：
  // - :id 来自路径参数 params
  // - 本接口专注“资源定位”，不走 query/body
  router.get("/:id", async (req, res) => {
    const result = await getPostDetail(getDb(), req.params.id);
    sendJSON(res, result.status, result.payload);
  });

  // POST /posts：创建文章。
  router.post("/", async (req, res) => {
    const result = await createPostRecord(getDb(), req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // PUT /posts/:id：更新文章（title/content 部分更新）。
  router.put("/:id", async (req, res) => {
    const result = await updatePostRecord(getDb(), req.params.id, req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // DELETE /posts/:id：删除文章（评论会由外键级联删除）。
  router.delete("/:id", async (req, res) => {
    const result = await deletePostRecord(getDb(), req.params.id);
    sendJSON(res, result.status, result.payload);
  });

  // GET /posts/:id/comments：查询某篇文章下的评论列表。
  router.get("/:id/comments", async (req, res) => {
    const result = await listPostComments(getDb(), req.params.id);
    sendJSON(res, result.status, result.payload);
  });

  return router;
}

module.exports = { createPostsRouter };
