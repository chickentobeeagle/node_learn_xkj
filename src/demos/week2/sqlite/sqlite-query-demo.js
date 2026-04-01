const { openDatabase, initSchema, close } = require("../../../db/sqlite-db");
const { createUser, listUsersWithQuery } = require("../../../repos/user-repo-sqlite");

/**
 * Week2 查询演示：
 * 1) 预置几条测试数据
 * 2) 演示分页查询
 * 3) 演示关键字搜索
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);

  // 为了避免 email 冲突，这里使用时间戳作为后缀。
  const suffix = Date.now();
  await createUser(db, { name: "alice", email: `alice-${suffix}@demo.com` });
  await createUser(db, { name: "bob", email: `bob-${suffix}@demo.com` });
  await createUser(db, { name: "charlie", email: `charlie-${suffix}@demo.com` });

  const page1 = await listUsersWithQuery(db, { page: 1, pageSize: 2, keyword: "" });
  console.log("分页查询 page=1,pageSize=2:", page1);

  const page2 = await listUsersWithQuery(db, { page: 2, pageSize: 2, keyword: "" });
  console.log("分页查询 page=2,pageSize=2:", page2);

  const search = await listUsersWithQuery(db, { page: 1, pageSize: 10, keyword: "ali" });
  console.log("关键字查询 keyword=ali:", search);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite query demo 执行失败:", error);
  process.exit(1);
});
