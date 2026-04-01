# Week 2 聚合 SQL 说明（LEFT JOIN + GROUP BY）

## 1) 这个场景要解决什么问题

需求：文章列表里需要展示“每篇文章的评论数”。

## 2) SQL 为什么这样写

```sql
SELECT
  p.id,
  p.title,
  p.created_at,
  u.name AS author_name,
  COUNT(c.id) AS comment_count
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, p.title, p.created_at, u.name
ORDER BY p.id DESC
```

### 为什么 `JOIN users`

文章列表常要显示作者名，`JOIN users` 一次性把作者信息带出来。

### 为什么 `LEFT JOIN comments`

要保留“无评论文章”。  
如果用普通 `JOIN comments`，没有评论的文章会被过滤掉。

### 为什么 `COUNT(c.id)`

每条评论对应一行 `c.id`，统计评论数量最直接。  
无评论时 `c.id` 为 `NULL`，`COUNT(c.id)` 会得到 `0`。

### 为什么必须 `GROUP BY`

一篇文章如果有多条评论，JOIN 后会出现多行。  
`GROUP BY` 把这些行按文章聚合成一行，才能得到“每篇文章一条记录 + 评论总数”。

## 3) 什么时候用 `JOIN`，什么时候用 `LEFT JOIN`

- 必须有下游数据才返回：用 `JOIN`
- 下游数据可选，但主数据必须保留：用 `LEFT JOIN`

文章评论统计通常用 `LEFT JOIN`，因为“0 条评论的文章”也要展示。
