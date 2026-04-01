const {
  listUsersWithQuery,
  findUserById,
  findUserByEmail,
  createUser,
  updateUserById,
  deleteUserById,
} = require("../repos/user-repo-sqlite");
const { parseId, parsePositiveInt, normalizeSortBy, normalizeSortOrder } = require("../app/http");

// 用户列表查询服务：
// - 负责把 query 参数转成安全的查询选项
// - 负责兜底默认值和 pageSize 上限
// - SQL 执行交给 repo 层
async function listUsers(db, query) {
  // 页码参数，非法时回退到 1。
  const page = parsePositiveInt(query.page, 1);
  // 每页条数参数，非法时回退到 10。
  const pageSize = parsePositiveInt(query.pageSize, 10);
  // 限制最大条数，防止大分页拖慢接口。
  const safePageSize = Math.min(pageSize, 50);
  // 关键字筛选（用于 name/email 模糊匹配）。
  const keyword = typeof query.keyword === "string" ? query.keyword : "";
  // 排序字段白名单。
  const sortBy = normalizeSortBy(query.sortBy);
  // 排序方向标准化（ASC/DESC）。
  const sortOrder = normalizeSortOrder(query.sortOrder);
  // 创建时间区间筛选参数。
  const createdFrom = typeof query.createdFrom === "string" ? query.createdFrom : "";
  const createdTo = typeof query.createdTo === "string" ? query.createdTo : "";

  try {
    const result = await listUsersWithQuery(db, {
      page,
      pageSize: safePageSize,
      keyword,
      sortBy,
      sortOrder,
      createdFrom,
      createdTo,
    });
    return { status: 200, payload: { message: "OK", data: result } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "读取用户列表失败", data: error.message } };
  }
}

// 用户详情服务：根据路径参数 id 查询单个用户。
async function getUserById(db, idValue) {
  const id = parseId(idValue);
  if (!id) {
    return { status: 400, payload: { code: 1, message: "id 必须是正整数" } };
  }

  try {
    const user = await findUserById(db, id);
    if (!user) {
      return { status: 404, payload: { code: 1, message: "用户不存在" } };
    }
    return { status: 200, payload: { message: "OK", data: user } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "读取用户详情失败", data: error.message } };
  }
}

// 用户创建服务：校验必填字段，并校验 email 是否重复。
async function createUserRecord(db, body) {
  const { name, email } = body || {};
  if (!name || !email) {
    return { status: 400, payload: { code: 1, message: "缺少 name 或 email" } };
  }

  try {
    const exists = await findUserByEmail(db, email);
    if (exists) {
      return { status: 409, payload: { code: 1, message: "email 已存在" } };
    }
    const user = await createUser(db, { name, email });
    return { status: 201, payload: { message: "用户已创建", data: user } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "创建用户失败", data: error.message } };
  }
}

// 用户更新服务：支持部分更新 name/email，并处理 email 冲突。
async function updateUserRecord(db, idValue, body) {
  const id = parseId(idValue);
  if (!id) {
    return { status: 400, payload: { code: 1, message: "id 必须是正整数" } };
  }

  const { name, email } = body || {};
  if (!name && !email) {
    return { status: 400, payload: { code: 1, message: "至少传入 name 或 email 其中一个字段" } };
  }

  try {
    if (email) {
      const exists = await findUserByEmail(db, email);
      if (exists && exists.id !== id) {
        return { status: 409, payload: { code: 1, message: "email 已存在" } };
      }
    }

    const user = await updateUserById(db, id, { name, email });
    if (!user) {
      return { status: 404, payload: { code: 1, message: "用户不存在" } };
    }
    return { status: 200, payload: { message: "用户已更新", data: user } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "更新用户失败", data: error.message } };
  }
}

// 用户删除服务：删除成功返回 200，不存在返回 404。
async function deleteUserRecord(db, idValue) {
  const id = parseId(idValue);
  if (!id) {
    return { status: 400, payload: { code: 1, message: "id 必须是正整数" } };
  }

  try {
    const ok = await deleteUserById(db, id);
    if (!ok) {
      return { status: 404, payload: { code: 1, message: "用户不存在" } };
    }
    return { status: 200, payload: { message: "用户已删除", data: { id } } };
  } catch (error) {
    return { status: 500, payload: { code: 1, message: "删除用户失败", data: error.message } };
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
};
