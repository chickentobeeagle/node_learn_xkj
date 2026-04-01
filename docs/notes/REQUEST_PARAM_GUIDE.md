# 请求参数获取方式对照（params / query / body）

## 1) params：路径参数（定位资源）

典型场景：你已经知道要操作哪条记录。  
示例：

- `GET /users/:id`
- `PUT /posts/:id`
- `DELETE /comments/:id`

在 Express 里通过 `req.params` 读取，例如：

```js
const id = req.params.id;
```

为什么用它：  
`/:id` 语义上代表“资源标识符”，适合单条资源的查改删。

## 2) query：查询参数（筛选、分页、排序）

典型场景：列表筛选，不改变数据。  
示例：

- `GET /users?page=1&pageSize=10&keyword=ali`
- `GET /posts/stats?page=1&pageSize=5&minComments=1`

在 Express 里通过 `req.query` 读取，例如：

```js
const page = req.query.page;
```

为什么用它：  
query 更适合表达“查询条件”，而不是“资源身份”。

## 3) body：请求体参数（创建/更新的数据负载）

典型场景：提交结构化数据，新增或更新。  
示例：

- `POST /posts`（提交 `title/content/userId`）
- `POST /comments`（提交 `postId/userId/content`）
- `PUT /posts/:id`（提交要改的字段）

在 Express 里通过 `req.body` 读取（前提是 `app.use(express.json())` 已启用）。

## 4) 常见误区

- 误区 A：GET 用 body 传筛选条件  
  - 不推荐。很多客户端/网关会忽略 GET body。
  - 列表筛选优先用 query。

- 误区 B：终端请求没给 URL 加引号  
  - `&` 在 shell 里有特殊含义，不加引号会导致参数丢失。
  - 正确示例：`curl "http://127.0.0.1:4000/users?page=1&pageSize=2&keyword=ali"`

- 误区 C：把数字当字符串直接进业务逻辑  
  - `req.params/req.query` 默认都是字符串，通常要先转数字再校验。
