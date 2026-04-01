const express = require("express");
const { sendJSON } = require("../app/http");
const {
  listUsers,
  getUserById,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
} = require("../services/users-service");

// 用户路由工厂：
// - getDb: 由上层注入的函数，调用后返回当前数据库连接
// 设计目标：路由层只做“接收请求 + 调用 service + 返回响应”。
function createUsersRouter(getDb) {
  // 用户域独立 Router，最终挂载到 /users 前缀下。
  const router = express.Router();

  // GET /users：分页、搜索、排序查询用户列表。
  router.get("/", async (req, res) => {
    const result = await listUsers(getDb(), req.query || {});
    sendJSON(res, result.status, result.payload);
  });

  // GET /users/:id：根据路径参数 id 查询用户详情。
  router.get("/:id", async (req, res) => {
    const result = await getUserById(getDb(), req.params.id);
    sendJSON(res, result.status, result.payload);
  });

  // POST /users：创建用户，参数在 JSON body 中。
  router.post("/", async (req, res) => {
    const result = await createUserRecord(getDb(), req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // PUT /users/:id：根据路径参数 id 更新用户，支持部分更新。
  router.put("/:id", async (req, res) => {
    const result = await updateUserRecord(getDb(), req.params.id, req.body || {});
    sendJSON(res, result.status, result.payload);
  });

  // DELETE /users/:id：根据路径参数 id 删除用户。
  router.delete("/:id", async (req, res) => {
    const result = await deleteUserRecord(getDb(), req.params.id);
    sendJSON(res, result.status, result.payload);
  });

  return router;
}

module.exports = { createUsersRouter };
