const { run, get, all } = require("../db/sqlite-db");

// 查询全部用户，按 id 倒序便于看到最新创建的数据。
async function listUsers(db) {
  return all(db, "SELECT id, name, email, created_at, updated_at FROM users ORDER BY id DESC");
}

// 分页 + 关键字查询（按 name/email 模糊匹配）。
// 说明：
// 1) 这类列表接口最终都会落到 "WHERE + ORDER BY + LIMIT/OFFSET" 这套 SQL 模板。
// 2) WHERE 条件使用参数占位符，防止 SQL 注入。
// 3) 查询列表和查询总数要拆成两条 SQL：一条拿当前页数据，一条拿总条数。
async function listUsersWithQuery(db, options) {
  const page = options.page;
  const pageSize = options.pageSize;
  const keyword = (options.keyword || "").trim();
  const createdFrom = (options.createdFrom || "").trim();
  const createdTo = (options.createdTo || "").trim();
  const sortBy = options.sortBy === "created_at" ? "created_at" : "id";
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
  const offset = (page - 1) * pageSize;

  const conditions = [];
  const params = [];

  if (keyword) {
    // 关键字搜索：同一个关键词同时匹配 name 和 email。
    conditions.push("(name LIKE ? OR email LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (createdFrom) {
    // created_at >= 起始时间
    conditions.push("created_at >= ?");
    params.push(createdFrom);
  }

  if (createdTo) {
    // created_at <= 结束时间
    conditions.push("created_at <= ?");
    params.push(createdTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await all(
    db,
    `SELECT id, name, email, created_at, updated_at
     FROM users
     ${where}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT ? OFFSET ?`,
    // 参数顺序必须和 SQL 中问号出现顺序严格一致：
    // 先 WHERE 参数，再 LIMIT，再 OFFSET。
    [...params, pageSize, offset]
  );

  const countRow = await get(
    db,
    `SELECT COUNT(*) AS total
     FROM users
     ${where}`,
    // 统计总数不需要 LIMIT/OFFSET，只传 WHERE 参数。
    params
  );

  return {
    list: rows,
    total: countRow ? countRow.total : 0,
    page,
    pageSize,
    totalPages: Math.ceil((countRow ? countRow.total : 0) / pageSize),
  };
}

async function findUserById(db, id) {
  return get(db, "SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?", [id]);
}

async function findUserByEmail(db, email) {
  return get(db, "SELECT id, name, email, created_at, updated_at FROM users WHERE email = ?", [email]);
}

async function createUser(db, payload) {
  const now = new Date().toISOString();
  const result = await run(
    db,
    "INSERT INTO users (name, email, created_at, updated_at) VALUES (?, ?, ?, ?)",
    [payload.name, payload.email, now, now]
  );
  return findUserById(db, result.lastID);
}

async function updateUserById(db, id, payload) {
  const current = await findUserById(db, id);
  if (!current) {
    return null;
  }

  const nextName = payload.name ?? current.name;
  const nextEmail = payload.email ?? current.email;
  const now = new Date().toISOString();

  await run(
    db,
    "UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?",
    [nextName, nextEmail, now, id]
  );
  return findUserById(db, id);
}

async function deleteUserById(db, id) {
  const current = await findUserById(db, id);
  if (!current) {
    return false;
  }
  await run(db, "DELETE FROM users WHERE id = ?", [id]);
  return true;
}

module.exports = {
  listUsers,
  listUsersWithQuery,
  findUserById,
  findUserByEmail,
  createUser,
  updateUserById,
  deleteUserById,
};
