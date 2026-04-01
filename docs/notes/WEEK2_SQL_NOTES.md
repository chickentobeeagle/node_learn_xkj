# Week 2 SQL 说明（列表查询）

## 1) 为什么列表查询要拆成两条 SQL

第一条 SQL：查当前页数据

```sql
SELECT ... FROM users WHERE ... ORDER BY ... LIMIT ? OFFSET ?
```

第二条 SQL：查总条数

```sql
SELECT COUNT(*) AS total FROM users WHERE ...
```

原因：分页页面不仅要显示当前页数据，还要显示总条数和总页数。

## 2) 为什么参数数组写成 `[...params, pageSize, offset]`

SQL 里问号的顺序是：
1. `WHERE` 条件里的问号（可能有 0/2/3/4 个）
2. `LIMIT ?`
3. `OFFSET ?`

所以参数数组必须按这个顺序拼，不然参数会错位。

## 3) 为什么用 `LIKE ?` 而不是拼接字符串

写法：

```sql
WHERE name LIKE ? OR email LIKE ?
```

参数：

```js
[`%${keyword}%`, `%${keyword}%`]
```

原因：
- 防 SQL 注入
- 让数据库驱动负责参数转义
- 代码更容易维护

## 4) 为什么 pageSize 要限制最大值

如果不限制，用户传 `pageSize=100000` 会让数据库一次返回大量数据，接口变慢甚至影响服务稳定。

当前实现把 `pageSize` 上限限制为 `50`，这是接口保护措施。
