const express = require("express");
const { sendJSON } = require("./http");
const { createUsersRouter } = require("../routes/users-routes");
const { createPostsRouter } = require("../routes/posts-routes");
const { createCommentsRouter } = require("../routes/comments-routes");

// 创建 Express 应用实例，并集中注册中间件、健康检查和业务路由。
// options:
// - getDb: 返回当前数据库连接的函数，供路由层按需获取连接
// - dbPath: 数据库文件路径，用于 health 接口展示
// - allowedOrigin: 允许跨域来源，默认 hoppscotch
function createApp(options) {
  // 应用主实例，负责承载所有中间件和路由。
  const app = express();
  // 允许跨域来源，默认给在线接口调试工具使用。
  const allowedOrigin = options.allowedOrigin || "https://hoppscotch.io";
  // 提供给各路由模块使用的 DB getter，避免直接共享可变全局变量。
  const getDb = options.getDb;
  // 用于健康检查响应，帮助确认当前连接的是哪个 SQLite 文件。
  const dbPath = options.dbPath;

  // JSON 请求体解析中间件，必须在业务路由前注册。
  app.use(express.json());
  // 简单 CORS 中间件：允许前端跨域访问并处理预检请求 OPTIONS。
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/health", (req, res) => {
    sendJSON(res, 200, { message: "OK", data: { service: "express-server", dbPath } });
  });

  // 路由前缀分发：
  // app.use("/users", usersRouter) + usersRouter.get("/") => GET /users
  // app.use("/users", usersRouter) + usersRouter.get("/:id") => GET /users/:id
  app.use("/users", createUsersRouter(getDb));
  app.use("/posts", createPostsRouter(getDb));
  app.use("/comments", createCommentsRouter(getDb));

  // 兜底 404：任何未命中的接口统一返回协议结构。
  app.use((req, res) => {
    sendJSON(res, 404, { code: 1, message: "接口不存在" });
  });

  return app;
}

module.exports = { createApp };
