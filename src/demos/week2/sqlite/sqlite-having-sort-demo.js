const { openDatabase, initSchema, initBlogSchema, close } = require("../../../db/sqlite-db");
const { createUser } = require("../../../repos/user-repo-sqlite");
const { createPost, createComment, listPostsWithCommentStatsAdvanced } = require("../../../repos/blog-repo-sqlite");

/**
 * HAVING + 排序演示
 *
 * 场景设计：
 * - post A: 0 条评论
 * - post B: 1 条评论
 * - post C: 3 条评论
 *
 * 通过三组查询观察：
 * 1) 不过滤时的完整统计
 * 2) HAVING 过滤后只保留评论数 >= 1 的文章
 * 3) 按 comment_count ASC 排序
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);
  await initBlogSchema(db);

  const seed = Date.now();
  const author = await createUser(db, {
    name: "having-author",
    email: `having-author-${seed}@demo.com`,
  });

  const postA = await createPost(db, {
    userId: author.id,
    title: "post-A-no-comments",
    content: "0 comments",
  });
  const postB = await createPost(db, {
    userId: author.id,
    title: "post-B-one-comment",
    content: "1 comment",
  });
  const postC = await createPost(db, {
    userId: author.id,
    title: "post-C-three-comments",
    content: "3 comments",
  });

  await createComment(db, {
    postId: postB.id,
    userId: author.id,
    content: "comment for B",
  });

  await createComment(db, {
    postId: postC.id,
    userId: author.id,
    content: "comment1 for C",
  });
  await createComment(db, {
    postId: postC.id,
    userId: author.id,
    content: "comment2 for C",
  });
  await createComment(db, {
    postId: postC.id,
    userId: author.id,
    content: "comment3 for C",
  });

  console.log("\n[场景1] 不过滤，按评论数降序");
  const q1 = await listPostsWithCommentStatsAdvanced(db, {
    minComments: 0,
    sortBy: "comment_count",
    sortOrder: "DESC",
  });
  console.log(q1);

  console.log("\n[场景2] HAVING 过滤：只看评论数 >= 1");
  const q2 = await listPostsWithCommentStatsAdvanced(db, {
    minComments: 1,
    sortBy: "comment_count",
    sortOrder: "DESC",
  });
  console.log(q2);

  console.log("\n[场景3] 按评论数升序，观察 0/1/3 的顺序");
  const q3 = await listPostsWithCommentStatsAdvanced(db, {
    minComments: 0,
    sortBy: "comment_count",
    sortOrder: "ASC",
  });
  console.log(q3);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite having sort demo 执行失败:", error);
  process.exit(1);
});
