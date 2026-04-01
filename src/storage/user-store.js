const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore the error
  }
}

// 从 users.json 读取用户，找不到文件就返回空数组。
async function readUsers() {
  await ensureDataDir();
  const content = await fs.readFile(usersFile, "utf8").catch(() => "[]");
  return JSON.parse(content);
}

// 以漂亮的 JSON 写回整个用户列表，方便手工查看。
async function writeUsers(users) {
  await ensureDataDir();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

// 往存储里追加一个用户。
async function addUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

module.exports = {
  readUsers,
  writeUsers,
  addUser,
  usersFile,
};
