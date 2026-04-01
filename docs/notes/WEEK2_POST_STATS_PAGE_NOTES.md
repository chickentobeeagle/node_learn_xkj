# Week 2 /posts/stats 分页说明

## 1) 这个接口为什么比普通分页难

普通列表分页通常是：

```sql
SELECT ... FROM table LIMIT ? OFFSET ?
SELECT COUNT(*) AS total FROM table
```

但 `/posts/stats` 不是普通表查询，它是“聚合后的结果集”，所以总数必须对“分组后的文章”再统计一次。

## 2) 为什么 total 不能直接用 COUNT(c.id)

`COUNT(c.id)` 统计的是评论数量。  
这个接口要分页的是“文章统计列表”，所以 total 应该是“符合条件的文章数量”。

## 3) 为什么外层还要再包一层 COUNT(*)

写法：

```sql
SELECT COUNT(*) AS total
FROM (
  SELECT p.id
  FROM posts p
  ...
  GROUP BY ...
  HAVING ...
) grouped_posts
```

原因：先把每篇文章的聚合结果算出来，再统计这些文章一共有多少条。

## 4) 返回结构为什么要带 totalPages

后台列表常见元信息：
- `list`
- `total`
- `page`
- `pageSize`
- `totalPages`

这样前端才能正确渲染分页器并判断是否还有下一页。
