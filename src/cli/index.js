const { readUsers, addUser } = require("../storage/user-store");

// 简单的命令行入口：没有参数就列出用户，加上参数就新增用户。
async function run() {
  const args = process.argv.slice(2);
  const shouldCreate = args.includes("--create");

  if (shouldCreate) {
    const nameIndex = args.indexOf("--name");
    const emailIndex = args.indexOf("--email");

    if (nameIndex === -1 || emailIndex === -1) {
      console.error("使用 --create 时需要同时传 --name 和 --email");
      process.exit(1);
    }

    const name = args[nameIndex + 1];
    const email = args[emailIndex + 1];

    if (!name || !email) {
      console.error("name 和 email 参数不能为空");
      process.exit(1);
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    await addUser(newUser);
    console.log("已添加用户：", newUser);
  }

  const users = await readUsers();
  console.log("当前用户数：", users.length);
  console.table(users, ["id", "name", "email", "createdAt"]);
}

run().catch((err) => {
  console.error("入口执行失败：", err);
  process.exit(1);
});
