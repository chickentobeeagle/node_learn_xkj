// 构造统一的成功结果对象。
// - data: 返回给客户端的业务数据
// - message: 成功提示文案，默认使用 OK
function ok(data, message = "OK") {
  return {
    status: 200,
    payload: { message, data },
  };
}

// 构造统一的创建成功结果对象。
// - data: 刚创建完成的资源数据
// - message: 创建成功提示文案
function created(data, message) {
  return {
    status: 201,
    payload: { message, data },
  };
}

// 构造统一的错误结果对象。
// - status: HTTP 状态码
// - message: 返回给客户端的错误文案
// - data: 可选的错误明细，一般用于 500 场景带出 error.message
function errorResult(status, message, data) {
  if (data === undefined) {
    return {
      status,
      payload: { code: 1, message },
    };
  }

  return {
    status,
    payload: { code: 1, message, data },
  };
}

// 统一 400 参数错误结果。
function badRequest(message) {
  return errorResult(400, message);
}

// 统一 404 资源不存在结果。
function notFound(message) {
  return errorResult(404, message);
}

// 统一 409 资源冲突结果。
function conflict(message) {
  return errorResult(409, message);
}

// 统一 500 服务内部错误结果。
// - error: 原始异常对象，存在时把 error.message 带到 data 中
function internalError(message, error) {
  return errorResult(500, message, error && error.message ? error.message : null);
}

module.exports = {
  ok,
  created,
  badRequest,
  notFound,
  conflict,
  internalError,
};
