# Week 2 博客 SQL 说明（外键 + 联表）

## 1) 为什么要拆 posts 和 comments 两张表

- `posts` 代表文章实体（作者、标题、正文、时间）
- `comments` 代表评论实体（属于哪篇文章、谁评论、评论内容）

拆表后关系更清晰，也符合 1:N（一个文章有多条评论）的业务结构。

## 2) 外键为什么这样定义

### posts

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

含义：文章作者必须是已存在用户；如果作者被删除，文章也自动删除。

### comments

```sql
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

含义：评论必须同时属于“已存在文章 + 已存在用户”；如果文章被删，评论也自动删。

## 3) 联表查询为什么要 JOIN

### 文章 + 作者信息

```sql
FROM posts p
JOIN users u ON p.user_id = u.id
```

原因：前端列表常同时展示“文章标题 + 作者名”，JOIN 一次就拿全，避免循环查用户。

### 评论 + 评论用户信息

```sql
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.post_id = ?
```

原因：评论列表要展示评论人信息；`WHERE c.post_id = ?` 表示只查当前文章下的评论。

## 4) 为什么用参数占位符 `?`

- 防止 SQL 注入
- 让驱动做参数转义
- 查询逻辑和数据分离，代码更可维护
