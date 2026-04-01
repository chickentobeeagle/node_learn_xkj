const path = require("path");
const fs = require("fs/promises");
const { readUsers } = require("../../../storage/user-store");

/**
 * Day7 复盘脚本
 * 目标：
 * 1) 快速回忆本周高频模块在业务中的作用
 * 2) 通过可执行输出，检查“理解”和“可操作”是否一致
 */
async function runReview() {
  // process：确认当前命令执行目录，帮助定位配置和数据文件。
  console.log("1) process.cwd():", process.cwd());

  // __dirname + path：确认当前文件目录，拼接出 data/users.json 的绝对路径。
  const usersFile = path.join(process.cwd(), "data", "users.json");
  console.log("2) users.json 绝对路径:", usersFile);

  // fs：读取原始文件内容，检查文件层是否存在数据。
  const raw = await fs.readFile(usersFile, "utf8").catch(() => "[]");
  console.log("3) users.json 原始内容长度:", raw.length);

  // 业务封装层：通过 user-store 读取结构化用户数组。
  const users = await readUsers();
  console.log("4) 当前用户数量:", users.length);

  // 输出一行“业务复盘结论”，帮助你口头复述这周成果。
  console.log(
    "5) 复盘结论: 已具备从本地 JSON 存储 -> HTTP/Express 接口 -> 统一响应格式的最小后端能力。"
  );
}

runReview().catch((error) => {
  console.error("Day7 复盘脚本运行失败:", error);
  process.exit(1);
});
