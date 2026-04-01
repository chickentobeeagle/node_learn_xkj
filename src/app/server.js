const { openDatabase, initSchema, initBlogSchema, close, dbPath } = require("../db/sqlite-db");
const { createApp } = require("./create-app");

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
let db = null;

async function bootstrap() {
  db = await openDatabase();
  await initSchema(db);
  await initBlogSchema(db);

  const app = createApp({
    getDb: () => db,
    dbPath,
    allowedOrigin: "https://hoppscotch.io",
  });

  app.listen(port, "127.0.0.1", () => {
    console.log(`Express 服务在 http://127.0.0.1:${port} 上运行`);
    console.log(`SQLite 文件: ${dbPath}`);
  });
}

process.on("SIGINT", async () => {
  if (db) {
    await close(db);
  }
  process.exit(0);
});

bootstrap().catch((error) => {
  console.error("服务启动失败:", error);
  process.exit(1);
});
