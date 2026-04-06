const test = require("node:test");
const assert = require("node:assert/strict");
const { ok, created, badRequest, notFound, conflict, internalError } = require("../src/app/service-results");

test("ok: 默认返回 200 和 OK 文案", () => {
  const result = ok({ id: 1 });

  assert.deepEqual(result, {
    status: 200,
    payload: {
      message: "OK",
      data: { id: 1 },
    },
  });
});

test("created: 返回 201 和自定义创建文案", () => {
  const result = created({ id: 2 }, "文章已创建");

  assert.deepEqual(result, {
    status: 201,
    payload: {
      message: "文章已创建",
      data: { id: 2 },
    },
  });
});

test("badRequest/notFound/conflict: 返回统一错误结构", () => {
  assert.deepEqual(badRequest("参数错误"), {
    status: 400,
    payload: { code: 1, message: "参数错误" },
  });

  assert.deepEqual(notFound("资源不存在"), {
    status: 404,
    payload: { code: 1, message: "资源不存在" },
  });

  assert.deepEqual(conflict("资源冲突"), {
    status: 409,
    payload: { code: 1, message: "资源冲突" },
  });
});

test("internalError: 返回 500 并带出 error.message", () => {
  const result = internalError("读取失败", new Error("db down"));

  assert.deepEqual(result, {
    status: 500,
    payload: {
      code: 1,
      message: "读取失败",
      data: "db down",
    },
  });
});
