const { openDatabase, initSchema, initBlogSchema, close } = require("../../../db/sqlite-db");
const { listPostsWithCommentStatsPage } = require("../../../repos/blog-repo-sqlite");

/**
 * /posts/stats 分页演示
 *
 * 说明：
 * 这里不再造测试数据，直接复用当前数据库里已有的文章和评论，
 * 重点是观察分页元信息和列表切页行为。
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);
  await initBlogSchema(db);

  console.log("\n[场景1] page=1,pageSize=3,minComments=1,按评论数降序");
  const page1 = await listPostsWithCommentStatsPage(db, {
    page: 1,
    pageSize: 3,
    minComments: 1,
    sortBy: "comment_count",
    sortOrder: "DESC",
  });
  console.log(page1);

  console.log("\n[场景2] page=2,pageSize=3,minComments=1,按评论数降序");
  const page2 = await listPostsWithCommentStatsPage(db, {
    page: 2,
    pageSize: 3,
    minComments: 1,
    sortBy: "comment_count",
    sortOrder: "DESC",
  });
  console.log(page2);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite post stats page demo 执行失败:", error);
  process.exit(1);
});
