const express = require("express");
const { sendJSON } = require("../app/http");
const { createCommentRecord, updateCommentRecord, deleteCommentRecord } = require("../services/blog-service");

// 评论路由工厂：
// - 统一挂载在 /comments 前缀下
// - 只放评论本身的写操作（创建/更新/删除）
function createCommentsRouter(getDb) {
  // 评论域独立 Router，便于后续继续扩展评论相关接口。
  const router = express.Router();

  // POST /comments：创建评论。
  router.post("/", async (req, res) => {
    const result = await createCommentRecord(getDb(), req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // PUT /comments/:id：更新评论内容。
  router.put("/:id", async (req, res) => {
    const result = await updateCommentRecord(getDb(), req.params.id, req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // DELETE /comments/:id：删除评论。
  router.delete("/:id", async (req, res) => {
    const result = await deleteCommentRecord(getDb(), req.params.id);
    sendJSON(res, result.status, result.payload);
  });

  return router;
}

module.exports = { createCommentsRouter };
