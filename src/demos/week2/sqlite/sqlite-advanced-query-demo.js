const { openDatabase, initSchema, close } = require("../../../db/sqlite-db");
const { createUser, listUsersWithQuery } = require("../../../repos/user-repo-sqlite");

/**
 * Week2 进阶查询演示
 * 目标：把“分页 + 关键字 + 排序 + 时间范围”一次走通。
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);

  const suffix = Date.now();

  // 预置几条测试数据，名字和邮箱带不同关键词，方便后续过滤观察。
  await createUser(db, { name: "alex", email: `alex-${suffix}@demo.com` });
  await createUser(db, { name: "alice", email: `alice-${suffix}@demo.com` });
  await createUser(db, { name: "bob", email: `bob-${suffix}@demo.com` });

  console.log("\n[场景1] 基础分页 page=1,pageSize=2");
  const q1 = await listUsersWithQuery(db, {
    page: 1,
    pageSize: 2,
    keyword: "",
    sortBy: "id",
    sortOrder: "DESC",
    createdFrom: "",
    createdTo: "",
  });
  console.log(q1);

  console.log("\n[场景2] 关键字搜索 keyword=ali");
  const q2 = await listUsersWithQuery(db, {
    page: 1,
    pageSize: 10,
    keyword: "ali",
    sortBy: "id",
    sortOrder: "DESC",
    createdFrom: "",
    createdTo: "",
  });
  console.log(q2);

  console.log("\n[场景3] 按创建时间升序 sortBy=created_at, sortOrder=ASC");
  const q3 = await listUsersWithQuery(db, {
    page: 1,
    pageSize: 10,
    keyword: "",
    sortBy: "created_at",
    sortOrder: "ASC",
    createdFrom: "",
    createdTo: "",
  });
  console.log(q3);

  // 取当前时间作为 createdTo，模拟“只看某个时间前创建的数据”。
  const createdTo = new Date().toISOString();
  console.log(`\n[场景4] 时间范围过滤 createdTo=${createdTo}`);
  const q4 = await listUsersWithQuery(db, {
    page: 1,
    pageSize: 10,
    keyword: "",
    sortBy: "id",
    sortOrder: "DESC",
    createdFrom: "",
    createdTo,
  });
  console.log(q4);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite advanced query demo 执行失败:", error);
  process.exit(1);
});
