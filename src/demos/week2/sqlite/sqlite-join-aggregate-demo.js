const { openDatabase, initSchema, initBlogSchema, close } = require("../../../db/sqlite-db");
const { createUser } = require("../../../repos/user-repo-sqlite");
const { createPost, createComment, listPostsWithCommentStats } = require("../../../repos/blog-repo-sqlite");

/**
 * 聚合查询演示：LEFT JOIN + GROUP BY
 *
 * 目标：
 * 1) 验证有评论和无评论的文章都能出现在统计列表中
 * 2) 观察 comment_count 是否正确
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);
  await initBlogSchema(db);

  const seed = Date.now();
  const author = await createUser(db, {
    name: "aggregate-author",
    email: `aggregate-author-${seed}@demo.com`,
  });

  // 文章 A：会创建 2 条评论。
  const postA = await createPost(db, {
    userId: author.id,
    title: "有评论的文章",
    content: "用于演示 LEFT JOIN + GROUP BY。",
  });

  // 文章 B：不创建评论，用来验证 LEFT JOIN 是否保留无评论文章。
  await createPost(db, {
    userId: author.id,
    title: "无评论的文章",
    content: "如果是 LEFT JOIN，这篇也应该出现在结果里。",
  });

  await createComment(db, {
    postId: postA.id,
    userId: author.id,
    content: "第一条评论",
  });
  await createComment(db, {
    postId: postA.id,
    userId: author.id,
    content: "第二条评论",
  });

  const stats = await listPostsWithCommentStats(db);
  console.log("[聚合查询结果] 每篇文章评论数：");
  console.log(stats);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite join aggregate demo 执行失败:", error);
  process.exit(1);
});
