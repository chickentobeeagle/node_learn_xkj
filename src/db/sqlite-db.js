const fs = require("fs/promises");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "app.db");

// 确保 data 目录存在，避免 SQLite 文件无法创建。
async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

// 打开 SQLite 连接；如果文件不存在会自动创建。
async function openDatabase() {
  await ensureDataDir();
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (error) => {
      if (error) {
        reject(error);
        return;
      }
      // 开启外键约束；SQLite 默认关闭，业务里必须显式打开。
      db.run("PRAGMA foreign_keys = ON", (pragmaError) => {
        if (pragmaError) {
          reject(pragmaError);
          return;
        }
        resolve(db);
      });
    });
  });
}

// Promise 化 db.run，返回 lastID/changes 方便上层使用。
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row || null);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows || []);
    });
  });
}

function close(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

// 初始化 users 表，email 唯一约束用于业务防重。
async function initSchema(db) {
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  );
}

// 初始化博客相关表：posts(文章) / comments(评论)。
// 设计说明：
// 1) posts.user_id 外键指向 users.id，表达“文章作者是谁”
// 2) comments.post_id 外键指向 posts.id，表达“评论属于哪篇文章”
// 3) comments.user_id 外键指向 users.id，表达“评论是谁发的”
// 4) ON DELETE CASCADE：删除上游记录时，下游关联记录自动清理
async function initBlogSchema(db) {
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );
}

module.exports = {
  dbPath,
  openDatabase,
  run,
  get,
  all,
  close,
  initSchema,
  initBlogSchema,
};
