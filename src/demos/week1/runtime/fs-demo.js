const { readUsers, addUser } = require("../../../storage/user-store");

// 演示脚本：读取 -> 添加 -> 再读取。
async function main() {
  console.log("当前 users.json 内容（初始）:");
  const before = await readUsers();
  console.log(before);

  const newUser = {
    id: Date.now(),
    name: "示例用户",
    email: "example@example.com",
    createdAt: new Date().toISOString(),
  };

  await addUser(newUser);
  console.log("新增用户后：");
  console.log(await readUsers());
}

main().catch((err) => {
  console.error("fs-demo 发生错误：", err);
  process.exit(1);
});
