const { openDatabase, initSchema, close } = require("../../../db/sqlite-db");
const {
  listUsers,
  createUser,
  findUserByEmail,
  updateUserById,
  deleteUserById,
} = require("../../../repos/user-repo-sqlite");

/**
 * Week 2 SQLite 快速演示：
 * 1) 建表
 * 2) 创建用户
 * 3) 查询用户
 * 4) 更新用户
 * 5) 删除用户
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);

  const uniqueEmail = `week2-${Date.now()}@demo.com`;

  // 创建
  const created = await createUser(db, {
    name: "week2-demo-user",
    email: uniqueEmail,
  });
  console.log("创建结果:", created);

  // 查询（按 email）
  const found = await findUserByEmail(db, uniqueEmail);
  console.log("查询结果:", found);

  // 更新
  const updated = await updateUserById(db, created.id, {
    name: "week2-demo-user-updated",
  });
  console.log("更新结果:", updated);

  // 列表
  const users = await listUsers(db);
  console.log("当前用户总数:", users.length);

  // 删除（演示完成后清理本次插入的数据）
  const deleted = await deleteUserById(db, created.id);
  console.log("删除结果:", deleted);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite demo 执行失败:", error);
  process.exit(1);
});
