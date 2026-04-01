const test = require("node:test");
const assert = require("node:assert/strict");
const sqlite3 = require("sqlite3").verbose();
const { close, initSchema, initBlogSchema, run } = require("../src/db/sqlite-db");
const {
  validatePostDetailParams,
  normalizePostSearchQuery,
  validateAdvancedPostSearchBody,
} = require("../src/app/request-validators");
const { getPostDetail, searchPosts, searchPostsAdvanced } = require("../src/services/blog-service");

// 创建内存 SQLite 数据库，避免测试污染真实 data/app.db。
async function createMemoryDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(":memory:", (error) => {
      if (error) {
        reject(error);
        return;
      }

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

// 初始化一套最小博客测试数据，覆盖用户、文章两个主链路。
async function seedBlogFixture(db) {
  // 固定时间戳，保证测试断言更稳定。
  const now = "2026-03-29T08:00:00.000Z";

  await initSchema(db);
  await initBlogSchema(db);

  await run(
    db,
    "INSERT INTO users (id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [1, "Alice", "alice@example.com", now, now]
  );
  await run(
    db,
    "INSERT INTO users (id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [2, "Bob", "bob@example.com", now, now]
  );
  await run(
    db,
    "INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [1, 1, "SQLite Query Guide", "Learn query filtering", now, now]
  );
  await run(
    db,
    "INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [2, 2, "Node Search Tips", "Advanced search body example", now, now]
  );
}

// 包一层测试数据库生命周期，保证每个用例互不影响。
async function withSeededBlogDb(runCase) {
  // 当前测试使用的临时数据库连接。
  const db = await createMemoryDatabase();

  try {
    await seedBlogFixture(db);
    await runCase(db);
  } finally {
    await close(db);
  }
}

test("validatePostDetailParams: 非法 id 返回 400 错误对象", () => {
  const result = validatePostDetailParams("abc");

  assert.deepEqual(result, {
    ok: false,
    error: {
      status: 400,
      payload: { code: 1, message: "文章 id 必须是正整数" },
    },
  });
});

test("validatePostDetailParams: 合法 id 返回标准化后的 postId", () => {
  const result = validatePostDetailParams("12");

  assert.deepEqual(result, {
    ok: true,
    value: { postId: 12 },
  });
});

test("normalizePostSearchQuery: 空 query 使用默认值，非法 authorId 不报错", () => {
  const result = normalizePostSearchQuery({ authorId: "abc" });

  assert.deepEqual(result, {
    page: 1,
    pageSize: 10,
    keyword: "",
    authorId: null,
    sortBy: "id",
    sortOrder: "DESC",
  });
});

test("normalizePostSearchQuery: pageSize 超限时收敛为 50，并保留合法排序", () => {
  const result = normalizePostSearchQuery({
    page: "2",
    pageSize: "999",
    keyword: "  SQLite  ",
    authorId: "1",
    sortBy: "created_at",
    sortOrder: "ASC",
  });

  assert.deepEqual(result, {
    page: 2,
    pageSize: 50,
    keyword: "SQLite",
    authorId: 1,
    sortBy: "created_at",
    sortOrder: "ASC",
  });
});

test("validateAdvancedPostSearchBody: 无过滤条件时返回 400", () => {
  const result = validateAdvancedPostSearchBody({});

  assert.deepEqual(result, {
    ok: false,
    error: {
      status: 400,
      payload: {
        code: 1,
        message: "高级搜索至少需要一个过滤条件（keywords/authorIds/createdFrom/createdTo）",
      },
    },
  });
});

test("validateAdvancedPostSearchBody: 清理 keywords 和 authorIds，并规范分页排序", () => {
  const result = validateAdvancedPostSearchBody({
    keywords: [" SQLite ", "", "  ", "Query"],
    authorIds: [1, "2", 2, 0, "abc", -1],
    createdFrom: " 2026-03-01T00:00:00.000Z ",
    createdTo: " 2026-03-31T23:59:59.999Z ",
    page: "3",
    pageSize: "200",
    sortBy: "created_at",
    sortOrder: "ASC",
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      keywords: ["SQLite", "Query"],
      authorIds: [1, 2],
      createdFrom: "2026-03-01T00:00:00.000Z",
      createdTo: "2026-03-31T23:59:59.999Z",
      page: 3,
      pageSize: 50,
      sortBy: "created_at",
      sortOrder: "ASC",
    },
  });
});

test("getPostDetail: 非法 id 返回 400", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await getPostDetail(db, "abc");

    assert.equal(result.status, 400);
    assert.equal(result.payload.message, "文章 id 必须是正整数");
  });
});

test("getPostDetail: 不存在的文章返回 404", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await getPostDetail(db, "999");

    assert.equal(result.status, 404);
    assert.equal(result.payload.message, "文章不存在");
  });
});

test("getPostDetail: 存在的文章返回 200 和作者信息", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await getPostDetail(db, "1");

    assert.equal(result.status, 200);
    assert.equal(result.payload.data.id, 1);
    assert.equal(result.payload.data.author_name, "Alice");
  });
});

test("searchPosts: 空 query 使用默认分页与排序", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await searchPosts(db, {});

    assert.equal(result.status, 200);
    assert.equal(result.payload.data.page, 1);
    assert.equal(result.payload.data.pageSize, 10);
    assert.equal(result.payload.data.list.length, 2);
  });
});

test("searchPosts: pageSize 超限时限制为 50，非法 authorId 视为不过滤", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await searchPosts(db, {
      pageSize: "999",
      sortBy: "not-allowed",
      authorId: "abc",
    });

    assert.equal(result.status, 200);
    assert.equal(result.payload.data.pageSize, 50);
    assert.equal(result.payload.data.list.length, 2);
  });
});

test("searchPostsAdvanced: 无过滤条件时返回 400", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await searchPostsAdvanced(db, {});

    assert.equal(result.status, 400);
    assert.equal(result.payload.message, "高级搜索至少需要一个过滤条件（keywords/authorIds/createdFrom/createdTo）");
  });
});

test("searchPostsAdvanced: 合法过滤条件可正常返回 200", async () => {
  await withSeededBlogDb(async (db) => {
    const result = await searchPostsAdvanced(db, {
      keywords: ["  SQLite  ", ""],
      authorIds: [1, "bad"],
      pageSize: "999",
      sortBy: "created_at",
      sortOrder: "DESC",
    });

    assert.equal(result.status, 200);
    assert.equal(result.payload.data.pageSize, 50);
    assert.equal(result.payload.data.list.length, 1);
    assert.equal(result.payload.data.list[0].id, 1);
  });
});
