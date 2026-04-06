const {
  listUsersWithQuery,
  findUserById,
  findUserByEmail,
  createUser,
  updateUserById,
  deleteUserById,
} = require("../repos/user-repo-sqlite");
const { parseId } = require("../app/http");
const { normalizeUserListQuery } = require("../app/request-validators");
const { ok, created, badRequest, notFound, conflict, internalError } = require("../app/service-results");

// 用户列表查询服务：
// - 负责把 query 参数转成安全的查询选项
// - 负责兜底默认值和 pageSize 上限
// - SQL 执行交给 repo 层
async function listUsers(db, query) {
  // query 参数统一交给业务校验工具归一化。
  const queryOptions = normalizeUserListQuery(query);

  try {
    const result = await listUsersWithQuery(db, queryOptions);
    return ok(result);
  } catch (error) {
    return internalError("读取用户列表失败", error);
  }
}

// 用户详情服务：根据路径参数 id 查询单个用户。
async function getUserById(db, idValue) {
  const id = parseId(idValue);
  if (!id) {
    return badRequest("id 必须是正整数");
  }

  try {
    const user = await findUserById(db, id);
    if (!user) {
      return notFound("用户不存在");
    }
    return ok(user);
  } catch (error) {
    return internalError("读取用户详情失败", error);
  }
}

// 用户创建服务：校验必填字段，并校验 email 是否重复。
async function createUserRecord(db, body) {
  const { name, email } = body || {};
  if (!name || !email) {
    return badRequest("缺少 name 或 email");
  }

  try {
    const exists = await findUserByEmail(db, email);
    if (exists) {
      return conflict("email 已存在");
    }
    const user = await createUser(db, { name, email });
    return created(user, "用户已创建");
  } catch (error) {
    return internalError("创建用户失败", error);
  }
}

// 用户更新服务：支持部分更新 name/email，并处理 email 冲突。
async function updateUserRecord(db, idValue, body) {
  const id = parseId(idValue);
  if (!id) {
    return badRequest("id 必须是正整数");
  }

  const { name, email } = body || {};
  if (!name && !email) {
    return badRequest("至少传入 name 或 email 其中一个字段");
  }

  try {
    if (email) {
      const exists = await findUserByEmail(db, email);
      if (exists && exists.id !== id) {
        return conflict("email 已存在");
      }
    }

    const user = await updateUserById(db, id, { name, email });
    if (!user) {
      return notFound("用户不存在");
    }
    return ok(user, "用户已更新");
  } catch (error) {
    return internalError("更新用户失败", error);
  }
}

// 用户删除服务：删除成功返回 200，不存在返回 404。
async function deleteUserRecord(db, idValue) {
  const id = parseId(idValue);
  if (!id) {
    return badRequest("id 必须是正整数");
  }

  try {
    const okToDelete = await deleteUserById(db, id);
    if (!okToDelete) {
      return notFound("用户不存在");
    }
    return ok({ id }, "用户已删除");
  } catch (error) {
    return internalError("删除用户失败", error);
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
};
