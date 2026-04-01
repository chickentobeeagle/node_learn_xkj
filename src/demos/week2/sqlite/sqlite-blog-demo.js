const { openDatabase, initSchema, initBlogSchema, close } = require("../../../db/sqlite-db");
const { createUser } = require("../../../repos/user-repo-sqlite");
const { createPost, createComment, listPostsWithAuthor, listCommentsByPostId } = require("../../../repos/blog-repo-sqlite");

/**
 * Week2 博客关系模型演示：
 * 1) 创建两个用户（作者 + 评论者）
 * 2) 创建一篇文章
 * 3) 创建两条评论
 * 4) 跑两条联表查询并打印结果
 */
async function main() {
  const db = await openDatabase();
  await initSchema(db);
  await initBlogSchema(db);

  const seed = Date.now();

  // 1) 创建作者与评论者
  const author = await createUser(db, {
    name: "author-demo",
    email: `author-${seed}@demo.com`,
  });
  const reviewer = await createUser(db, {
    name: "reviewer-demo",
    email: `reviewer-${seed}@demo.com`,
  });

  // 2) 创建文章（作者是 author）
  const post = await createPost(db, {
    userId: author.id,
    title: "SQLite JOIN 实战",
    content: "这是一篇用于演示联表查询的文章。",
  });

  // 3) 创建评论（评论人是 reviewer 和 author）
  await createComment(db, {
    postId: post.id,
    userId: reviewer.id,
    content: "这篇文章讲得很清楚。",
  });
  await createComment(db, {
    postId: post.id,
    userId: author.id,
    content: "感谢反馈，后面会补充更多 SQL 例子。",
  });

  // 4) 联表查询：文章 + 作者信息
  const posts = await listPostsWithAuthor(db);
  console.log("\n[联表1] 文章列表 + 作者信息：");
  console.log(posts);

  // 5) 联表查询：某篇文章评论 + 评论用户信息
  const comments = await listCommentsByPostId(db, post.id);
  console.log(`\n[联表2] post_id=${post.id} 的评论 + 评论用户信息：`);
  console.log(comments);

  await close(db);
}

main().catch((error) => {
  console.error("sqlite blog demo 执行失败:", error);
  process.exit(1);
});
