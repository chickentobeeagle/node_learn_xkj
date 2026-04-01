# Week 2 HAVING 与排序说明

## 1) WHERE 和 HAVING 的区别

- `WHERE`：在分组前过滤原始行
- `HAVING`：在 `GROUP BY` 之后过滤聚合结果

当你要按评论数（`COUNT(c.id)`）过滤时，必须用 `HAVING`，不能用 `WHERE`。

## 2) 典型 SQL

```sql
SELECT
  p.id,
  p.title,
  COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, p.title
HAVING COUNT(c.id) >= ?
ORDER BY comment_count DESC, p.id DESC
```

## 3) 为什么 ORDER BY 要白名单

字段名不能用 `?` 占位符绑定。  
如果把前端传入的字段名直接拼字符串，存在 SQL 注入风险。

做法：代码里只允许固定字段，比如：
- `comment_count`
- `id`

不在白名单中的字段一律回退到默认排序字段。

## 4) 常见业务场景

- 运营后台：只看“有互动”的文章（`HAVING COUNT(c.id) >= 1`）
- 内容分析：按评论数降序看最热文章
