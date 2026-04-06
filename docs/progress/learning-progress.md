# 学习进度日志

## 当前总览
- 当前周次：第 1 周
- 当前主题：Node.js 基础
- 本周目标：独立完成一个简单的用户管理 API 服务
- 本周重点模块：`process`、`path`、`fs`、`http`、`url`、`events`、`Express`
- 已完成：
  - 已确认第 1 周学习主线为“用户管理 API”
  - 已明确第一周优先学习业务高频 Node API
- 还未完成：
  - 初始化 Node 项目
  - 完成 `GET /users`
  - 完成 `GET /users/:id`
  - 完成 `POST /users`
  - 用本地 JSON 文件模拟用户数据存储
- 当前最薄弱点：Node 原生 API 和后端接口请求处理流程还不熟
- 下一次学习入口：从 Day 1 开始，先建立 Node 项目并理解 Node 和浏览器 JavaScript 的区别

## API 掌握度说明
- `知道用途`：知道这个 API 是干什么的
- `会照着写`：能参考资料写出来
- `能独立写`：不看资料也能完成常见用法
- `能讲给别人听`：能用自己的话说明它的作用、使用方式和业务场景

---

## Day 1 - 2026-03-15
- 今日目标：理解 Node.js 基本定位，完成项目初始化，熟悉 `npm/pnpm` 和 `package.json`
- 实际完成：
  - 确认本机 Node 和 npm 环境可用
  - 初始化了第一个 Node 项目
  - 认识了 `package.json`、入口文件和脚本配置
  - 创建了最小可运行入口 `src/index.js`
- 一句话总结今天：Node 项目本质上就是“一个由 `package.json` 管理、由 Node 运行的 JavaScript 程序”
- 我已经理解：
  - Node 是运行 JavaScript 的服务器端环境，不是浏览器
  - `package.json` 是项目说明书，负责描述项目信息和脚本
  - `npm init -y` 会快速生成一个 Node 项目的基础配置
  - `npm run dev` 和 `npm start` 本质上是在执行 `scripts` 里定义好的命令
  - `main` 用来声明项目入口文件
  - `scripts.start` 本质上是 `node src/index.js` 的命令别名
  - `scripts.dev` 用来监听 `src/index.js` 变化并自动重新运行
  - `require` 和 `import` 都是把别的模块能力引入当前文件的方式
  - `src/index.js` 是当前项目的启动入口，程序执行从这里开始
- 我还不理解：
  - `CommonJS` 和 `ESM` 的差别还需要通过更多例子再巩固
  - `main` 字段在真实项目里的作用还不够直观
- 今天练习的 API / 模块：
  - `npm/pnpm`
  - `package.json`
  - `scripts`
  - `CommonJS` / `ESM`
- API 掌握度：
  - `process`：
  - `path`：
  - `fs`：
  - `http`：
  - `url`：
  - `events`：
  - `express`：
- 一句人话解释：
  - `package.json` 就像项目的控制面板，告诉 Node 和 npm“这个项目叫什么、从哪启动、能运行哪些命令”
- 对应业务场景：
  - 团队协作时，别人拉下项目后，只要看 `package.json` 就知道怎么安装依赖、怎么启动服务、怎么运行脚本
- 今天写了什么代码 / 接口：
  - 新建了 Node 项目基础结构
  - 配置了 `start` 和 `dev` 脚本
  - 创建了 `src/index.js` 作为当前入口文件
  - 跑通了 `CommonJS` 和 `ESM` 的最小示例
- 遇到的问题：
- 当前确认：
  - 能用自己的话说明 Node 和浏览器 JavaScript 的区别
  - 能基本说明 `require/import` 和入口文件的作用
- 我是怎么解决的：
- 明天继续：学习 `process`、`path` 和环境变量，把项目目录结构搭起来

---

## Day 2 - 2026-03-16
- 今日目标：理解 `process`、`path`、环境变量和项目路径处理
- 实际完成：
  - 通过 `NODE_ENV=development npm run demo:day2 -- --port=4000` 验证环境变量与命令参数的传递
  - 观察 `process.cwd()` / `__dirname` / `process.argv` 在不同模块中的输出
  - 用 `path.join` / `path.resolve` 构建了指向 `data/users.json` 的绝对路径
  - 搭好持久化准备：`data/users.json`、`src/user-store.js`、`src/fs-demo.js`
- 一句话总结今天：`process` 告诉我“我从哪儿跑出来的”，`path` 则把路径片段都精准拼接起来变成可用的文件地址。
- 我已经理解：
  - `process.env.NODE_ENV` 来自命令行前缀设置的环境变量
  - `process.cwd()` 是你执行命令那个目录，`__dirname` 是当前模块所在目录
  - `path.join` / `path.resolve` 解决了跨平台路径拼接、和相对路径跳转
- 我还不理解：
  - `path.resolve` 中多个 `..` 是怎么一步步往上跳的
- 今天练习的 API / 模块：
  - `process.cwd`
  - `process.argv`
  - `process.env`
  - `path.join`
  - `path.resolve`
  - `fs`（初步读写数据）
  - `JSON.parse` / `JSON.stringify`
- API 掌握度：
  - `process`：知道用途
  - `path`：知道用途
  - `fs`：会照着写
  - `http`：知道用途
  - `url`：知道用途
  - `events`：知道用途
  - `express`：知道用途
- 一句人话解释：`process` 是“程序的感官”，`path` 是“路径的装配工”。
- 对应业务场景：后端服务要读配置、保存文件，必须同时知道“我在哪儿运行”和“我要找的文件在哪儿”，否则部署到别的环境就找不到资源。
- 今天写了什么代码 / 接口：
  - `data/users.json`（初始 `[]`）
  - `src/user-store.js`：封装 JSON 读写并保障目录存在
  - `src/fs-demo.js`：调用 user-store 读写并打印状态的演示脚本
- 遇到的问题：
- 我是怎么解决的：
- 明天继续：用 `fs` 读写用户数据、模拟业务接口的持久化能力

---

## Day 3 - 2026-03-17
- 今日目标：掌握 `fs` 基础读写，并把用户数据保存到本地 JSON，模拟接口需要的持久化
- 实际完成：
  - 实现 `src/user-store.js`，封装用户 JSON 的读取、写入、目录保障
  - 用 `src/fs-demo.js` 运行了一次读写演示，确认数据能写进 `data/users.json`
  - 更新 `src/index.js`：支持 `--create --name --email` 语义，用 `user-store` 新增用户并打印表格
  - 学会通过 `npm start -- --create --name 道长 -- --email dao@example.com` 创建用户
- 一句话总结今天：`fs` 是接口背后持久化的最小积木，先把 JSON 读写端对端搞通再写接口。
- 我已经理解：
  - `fs.promises` 提供异步读写，不用回调
  - JSON 在本地做为简易存储时，利用 `readUsers + addUser` 可以模拟 CRUD
  - 把业务逻辑放在 `src/user-store.js`，入口只管调用，提高可维护性
- 我还不理解：
  - 如果多个进程同时写 `users.json`，会不会冲突
- 今天练习的 API / 模块：
  - `fs.promises.readFile`
  - `fs.promises.writeFile`
  - `JSON.parse`
  - `JSON.stringify`
  - `process.argv`
- API 掌握度：
  - `process`：知道用途
  - `path`：知道用途
  - `fs`：能独立写（read + write）
  - `http`：知道用途
  - `url`：知道用途
  - `events`：知道用途
  - `express`：知道用途
- 一句人话解释：`fs` 是“把对象序列化到文件里”，`JSON` 是“把结构变成字符”的桥梁。
- 对应业务场景：产品上线前常用 JSON 作为本地缓存，用 `fs` 读写来模拟更复杂的数据库。
- 今天写了什么代码 / 接口：
  - `src/user-store.js`：`readUsers`、`writeUsers`、`addUser`
  - `src/fs-demo.js`：展示读写流程
  - `src/index.js`：CLI 入口支持查看和新增用户
- 遇到的问题：
- 我是怎么解决的：
- 明天继续：用原生 `http` 手写最小用户接口服务

---

## Day 4 - 2026-03-18
- 今日目标：理解原生 `http` 服务，手写 `GET /users`/`POST /users` 并调用刚封装的 `user-store`
- 实际完成：
  - 写了 `src/http-server.js`：一个用 `http.createServer`、解析 `req.url`/`req.method` 的接口层
  - `GET /users` 直接读取 JSON，`POST /users` 解析请求体、校验字段再写入
  - 提供 `demo:http` 脚本，示意可以用 `fetch` 依次调用 GET 和 POST
  - 记录了 `runDemo` 失败的原因：当前沙箱禁止监听本地 0.0.0.0 端口，实际部署时即可运行
- 一句话总结今天：用原生 `http` 再包一层逻辑，把读写 JSON 的 `user-store` 接口化。
- 我已经理解：
  - `req.method` + `req.url` 就能判断需要处理哪个接口
  - `res.writeHead` + `res.end` 用来设置状态码和返回 JSON
  - POST 接口要手动收集 `data` 事件再 `JSON.parse`
  - 如果服务下线了 `listen` 会报 `EPERM`（沙箱限制），实际部署不会
- 我还不理解：
  - POST 接口中，为什么用了 `Date.now()` 生成 `id` 避免冲突
- 今天练习的 API / 模块：
  - `http.createServer`
  - `req.method`
  - `req.url`
  - `res.writeHead`
  - `res.end`
  - `Buffer`（从 request 里收集数据）
  - `URL`（用作路由判断）
- API 掌握度：
  - `process`：知道用途
  - `path`：知道用途
  - `fs`：能独立写（read + write）
  - `http`：开始能独立写基本服务
  - `url`：知道用途
  - `events`：知道用途
  - `express`：知道用途
- 一句人话解释：`req.method`/`req.url` 让你自己像框架那样分接口、`res.writeHead` + `end` 让你手动回应浏览器。
- 对应业务场景：业务接口层需要解析路由、做参数校验，然后拿刚才写的 `user-store` 持久化用户。
- 今天写了什么代码 / 接口：
  - `src/http-server.js`：原生 HTTP 服务 + `GET /users`、`POST /users`
  - `package.json`：新增 `demo:http` 命令
- 遇到的问题：
  - `demo:http` 在当前沙箱里 `listen 0.0.0.0` 会被拒绝（`EPERM`），只能在真实环境运行
- 我是怎么解决的：
  - 在日志里记录了这一点，下次在能监听的环境再跑一次 demo
- 明天继续：学习 Express，借助它简化路由、JSON 和错误处理

---

## Day 5 - 2026-03-19
- 今日目标：用 Express 重写接口，体验中间件自动解析 JSON 与路由分发
- 实际完成：
  - 安装 `express`（通过升级权限从 npm registry 下载）
  - 新建 `src/express-server.js`：Express 应用自动解析 JSON、统一响应结构、GET/POST `/users`
  - 增加 `serve:express` 脚本，验证服务能绑定到 `127.0.0.1` 的 4000 端口
- 一句话总结今天：Express 把原生 `http` 的路由、JSON 解析和状态码都封装好了，让我专注业务逻辑。
- 我已经理解：
  - `express.json()` 取代了手动拼接 `req.on("data")`
  - `app.get` / `app.post` 让路由分发变成简单的函数链
  - 通过中间件统一设置 `Content-Type` 和响应结构
- 我还不理解：
  - Express 在底层是如何把 `req`/`res` 转成原生 Socket 的
- 今天练习的 API / 模块：
  - `express()`
  - `app.use`
  - `app.get`
  - `app.post`
  - `express.json()`
  - `res.status`
  - `res.json`
- API 掌握度：
  - `process`：知道用途
  - `path`：知道用途
  - `fs`：能独立写
  - `http`：知道用途
  - `url`：知道用途
  - `events`：知道用途
  - `express`：开始能独立写接口
- 一句人话解释：Express 就像把所有原生 HTTP 的重复步骤包成好用的中间件链。
- 对应业务场景：上线接口时常常用 Express 处理路由和 JSON 加工，后台只需关注数据校验和持久化。
- 今天写了什么代码 / 接口：
  - `src/express-server.js`：重写 `GET /users`、`POST /users`，统一 JSON 响应
  - `package.json`：新增 `serve:express` 脚本，方便启动 Express 服务
- 遇到的问题：
  - 沙箱默认不能访问外部网络，安装 `express` 时网络请求失败后重新用提权命令下载
  - 绑定 0.0.0.0 会触发 `EPERM`，所以新服务固定监听 `127.0.0.1`
- 我是怎么解决的：
  - 通过 `require_escalated` 重新运行 `npm install express`
  - 明确 Express 服务要固定监听 `127.0.0.1`，避免权限错误
- 明天继续：把这些接口做得更像业务（校验、错误、统一返回），然后练习 Postman 访问

---

## Day 6 - 2026-03-20
- 今日目标：补齐用户模块常见业务处理，包括参数校验、按 `id` 查询和统一响应格式
- 实际完成：
  - 在 `src/express-server.js` 增加 `GET /health`、`GET /users/:id`
  - `POST /users` 增加 email 重复校验，命中重复时返回 `409`
  - 为 Hoppscotch 增加 CORS 响应头，允许 `https://hoppscotch.io` 访问
  - 补充 `OPTIONS` 预检请求处理，避免浏览器跨域请求被拦截
  - `package.json` 增加 `curl:health` 和 `curl:get-users` 快速验证脚本
- 一句话总结今天：把“能跑通接口”升级为“更像真实业务接口”的状态了。
- 我已经理解：
  - 浏览器环境请求本地接口会受 CORS 约束
  - `/:id` 路由参数是业务接口高频模式
  - 冲突场景应该返回 `409`，而不是泛化为 `500`
  - `OPTIONS` 是跨域预检流程的一部分
- 我还不理解：
  - 生产环境里 CORS 白名单如何按多域名管理
- 今天练习的 API / 模块：
  - 路由参数
  - 请求体校验
  - 错误响应
  - 统一返回结构
  - CORS 预检处理
- API 掌握度：
  - `process`：知道用途
  - `path`：知道用途
  - `fs`：能独立写
  - `http`：知道用途
  - `url`：知道用途
  - `events`：知道用途
  - `express`：能独立写中小型 CRUD 接口
- 一句人话解释：今天是把接口“加业务规则”和“加浏览器兼容规则”的一天。
- 对应业务场景：不仅要能创建用户，还要处理重复数据、跨域请求和按 ID 查询等真实访问场景。
- 今天写了什么代码 / 接口：
  - `src/express-server.js`：新增 `GET /health`、`GET /users/:id`、CORS 和重复邮箱校验
  - `package.json`：新增 `curl:health`、`curl:get-users`
- 遇到的问题：
  - Hoppscotch 属于浏览器端请求，默认会被 CORS 拦截
  - 当前终端沙箱不适合长期保持服务监听，验证流程受限
- 我是怎么解决的：
  - 服务端加 CORS + OPTIONS 处理
  - 用语法检查确认代码可运行，实际请求建议在本机终端验证
- 明天继续：复盘本周内容，独立重写一遍最小用户 API

---

## Day 7 - 2026-03-21
- 今日目标：复盘本周知识点，独立完成一遍用户管理 API，并明确哪些内容需要下周继续巩固
- 实际完成：
  - 为 `src/express-server.js` 增补“设计动机级”中文注释（中间件顺序、CORS、状态码、兜底路由）
  - 新增 `src/day7-review.js`，把 `process/path/fs/user-store` 串成一条可执行复盘链路
  - `package.json` 新增 `demo:day7`，可一键运行本周复盘脚本
- 一句话总结今天：把“会写代码”升级成“能解释为什么这样设计”的状态了。
- 我已经理解：
  - Express 中间件顺序会直接影响请求处理结果
  - 路由层负责参数校验和流程编排，存储层负责数据持久化
  - CORS 是浏览器访问本地接口时必须处理的约束，不是可选项
  - `409`、`404`、`400`、`500` 分别对应不同业务语义
- 我还不理解：
  - 如何在生产环境把日志、监控和错误追踪接入到这套接口
- 今天练习的 API / 模块：
  - `process`
  - `path`
  - `fs`
  - `http`
  - `url`
  - `events`
  - `express`
  - 中间件执行顺序
  - 统一响应协议
- API 掌握度：
  - `process`：能讲给别人听
  - `path`：能讲给别人听
  - `fs`：能独立写
  - `http`：能独立写最小服务
  - `url`：能独立用于路由判断
  - `events`：知道用途
  - `express`：能独立写中小型 CRUD 接口
- 一句人话解释：Day7 的重点是“把每段代码背后的设计原因讲清楚”。
- 对应业务场景：当你开始做真实业务接口时，代码能跑只是底线，能解释设计和状态码选择才是真正可协作开发。
- 今天写了什么代码 / 接口：
  - `src/express-server.js`：增强注释，明确每段设计意图
  - `src/day7-review.js`：周复盘脚本，串联关键 API
  - `package.json`：新增 `demo:day7`
- 遇到的问题：
- 我是怎么解决的：
- 明天继续：进入第 2 周前，先整理本周不会写和不理解的点

---

## Week 2 启动 - 2026-03-17
- 本周目标：从文件存储升级到数据库存储，完成用户 CRUD（含更新、删除）
- 实际完成：
  - 安装 `sqlite3@5.1.7`
  - 新增 `src/sqlite-db.js`：数据库连接、建表、基础 SQL 执行封装
  - 新增 `src/user-repo-sqlite.js`：用户数据库 CRUD 仓储层
  - `src/express-server.js` 切换到 SQLite 数据源，并补齐 `PUT /users/:id`、`DELETE /users/:id`
  - 新增 `src/sqlite-demo.js` + `npm run demo:sqlite`，可本地无服务验证完整 CRUD
- 一句话总结：数据存储从 JSON 文件迁移到 SQLite 后，接口已具备更真实的后端结构。
- 当前收获：
  - 理解了“路由层”和“数据访问层”的职责分离
  - 掌握了 SQLite 建表、唯一约束、增删改查的基本流程
  - 继续保持统一响应结构和状态码语义
- 下一步：在本机启动 Express 并用 Hoppscotch/curl 走一遍数据库版接口联调

## Week 2 进展 - 2026-03-18
- 今日目标：补齐用户列表的业务查询能力（分页 + 关键字搜索）
- 实际完成：
  - `src/user-repo-sqlite.js` 新增 `listUsersWithQuery`，支持 `page/pageSize/keyword`
  - `src/express-server.js` 的 `GET /users` 支持查询参数并返回分页元信息
  - 新增 `src/sqlite-query-demo.js`，可离线演示分页和搜索逻辑
  - `package.json` 新增 `demo:sqlite-query`
- 一句话总结：接口从“能查到数据”升级为“能按条件高效查数据”。
- 关键收获：
  - 列表接口不只返回数组，还要返回 `total/page/pageSize/totalPages`
  - `LIKE %keyword%` 是 SQL 模糊搜索的基础写法
  - `pageSize` 应限制最大值，避免一次查太多拖慢服务

## Week 2 进展 - 2026-03-24
- 今日目标：理解并实践多表关系（文章/评论），掌握外键与联表查询
- 实际完成：
  - `src/sqlite-db.js` 增加 `initBlogSchema`，创建 `posts`/`comments` 两张表及外键约束
  - `src/blog-repo-sqlite.js` 增加文章、评论写入和联表查询封装
  - 新增 `src/sqlite-blog-demo.js`，一键演示“建数据 -> JOIN 查询”
  - 新增 `WEEK2_BLOG_SQL_NOTES.md`，解释外键和 JOIN 的设计原因
  - `package.json` 增加 `demo:sqlite-blog`
- 一句话总结：从单表 CRUD 进入到关系型数据库最核心的“外键 + 联表”阶段。
- 关键收获：
  - 外键让数据关系具备数据库层面的约束，不只依赖代码约束
  - `JOIN` 能一次拿到“主数据 + 关联信息”，减少前端多次请求
  - `ON DELETE CASCADE` 能自动清理下游关联数据，降低脏数据风险

## Week 2 进展 - 2026-03-25
- 今日目标：掌握聚合查询（LEFT JOIN + GROUP BY），实现文章评论数统计
- 实际完成：
  - `src/blog-repo-sqlite.js` 新增 `listPostsWithCommentStats`
  - 新增 `src/demos/week2/sqlite/sqlite-join-aggregate-demo.js`，演示有评论/无评论文章的统计结果
  - `package.json` 新增 `demo:sqlite-aggregate`
  - 新增 `WEEK2_AGGREGATE_SQL_NOTES.md`，解释 JOIN 类型和 GROUP BY 设计原因
- 一句话总结：从“查明细”升级到“查统计”，进入业务报表常见 SQL 模式。
- 关键收获：
  - `LEFT JOIN` 能保留无评论文章，统计更完整
  - `COUNT(c.id)` 在无评论时会返回 0
  - `GROUP BY` 用来把多行评论聚合成单行文章统计

## Week 2 进展 - 2026-03-26
- 今日目标：掌握 HAVING 过滤与聚合结果排序
- 实际完成：
  - `src/blog-repo-sqlite.js` 新增 `listPostsWithCommentStatsAdvanced`
  - 新增 `src/demos/week2/sqlite/sqlite-having-sort-demo.js`
  - `package.json` 新增 `demo:sqlite-having-sort`
  - 新增 `WEEK2_HAVING_SORT_NOTES.md` 解释 HAVING、排序白名单与安全性
- 一句话总结：可以基于评论数做筛选和排序，查询能力已经接近后台运营列表场景。
- 关键收获：
  - 聚合结果过滤必须用 `HAVING`，不能用 `WHERE`
  - 排序字段要做白名单，避免 SQL 注入
  - `ORDER BY comment_count` 可以直接支持“最热文章榜单”需求

## Week 2 进展 - 2026-03-26（接口接入）
- 今日目标：把聚合 SQL 能力接入到实际 API
- 实际完成：
  - `src/express-server.js` 新增 `GET /posts`（文章+作者）
  - `src/express-server.js` 新增 `GET /posts/stats`（支持 `minComments/sortBy/sortOrder`）
  - 服务启动时补充 `initBlogSchema`，保证博客表存在
  - `package.json` 增加 `curl:get-posts` 和 `curl:get-post-stats` 调试命令
- 一句话总结：聚合 SQL 已经从“demo 脚本”升级为“可被前端直接调用的接口能力”。

## Week 2 进展 - 2026-03-29
- 今日目标：把 `/posts/stats` 做成完整分页接口
- 实际完成：
  - `src/blog-repo-sqlite.js` 新增 `listPostsWithCommentStatsPage`
  - `src/express-server.js` 的 `GET /posts/stats` 支持 `page/pageSize`
  - 新增 `src/demos/week2/sqlite/sqlite-post-stats-page-demo.js`
  - 新增 `WEEK2_POST_STATS_PAGE_NOTES.md`
  - `package.json` 新增 `demo:sqlite-post-stats-page`
- 一句话总结：聚合统计已经具备真实后台列表需要的分页元信息。
- 关键收获：
  - 聚合查询分页时，`total` 必须对“分组后的结果”再统计一次
  - `LIMIT/OFFSET` 作用在聚合结果上，不是原始评论行
  - 列表接口最终都要回到 `list + total + page + pageSize + totalPages`

## Week 2 进展 - 2026-03-29（写入接口）
- 今日目标：把博客模块从“只会查”升级为“可写可查”
- 实际完成：
  - `src/express-server.js` 新增 `POST /posts`
  - `src/express-server.js` 新增 `POST /comments`
  - `src/express-server.js` 新增 `GET /posts/:id/comments`
  - `package.json` 增加 `curl:create-post`、`curl:create-comment`、`curl:get-post-comments`
  - 新增 `WEEK2_WRITE_API_NOTES.md`，说明写入前的参数与关联资源校验逻辑
- 一句话总结：博客模块已经具备“创建文章 -> 创建评论 -> 查询评论”的完整业务闭环。

## Week 2 进展 - 2026-03-29（补齐改删 + 参数机制）
- 今日目标：补齐博客模块改删接口，并系统说明 params/query/body
- 实际完成：
  - `src/blog-repo-sqlite.js` 增加 `updatePostById`、`deletePostById`、`updateCommentById`、`deleteCommentById`
  - `src/express-server.js` 新增 `PUT /posts/:id`、`DELETE /posts/:id`
  - `src/express-server.js` 新增 `PUT /comments/:id`、`DELETE /comments/:id`
  - `package.json` 增加 `curl:update-post`、`curl:delete-post`、`curl:update-comment`、`curl:delete-comment`
  - 新增 `REQUEST_PARAM_GUIDE.md`，对照讲解 `params/query/body` 与常见误区
- 一句话总结：博客模块现已达到完整 CRUD，参数获取方式也形成了可复用的统一认知框架。

## Week 3 进展 - 2026-03-29（分层实战 Day 1）
- 今日目标：用 `routes -> services -> repos` 三层结构新增一个真实接口，巩固模块化思维
- 实际完成：
  - `src/repos/blog-repo-sqlite.js` 新增 `getPostWithAuthorById`（按文章 id 联表查询作者信息）
  - `src/services/blog-service.js` 新增 `getPostDetail`（参数校验 + 400/404/500 语义）
  - `src/routes/posts-routes.js` 新增 `GET /posts/:id`
  - `package.json` 新增 `curl:get-post-by-id`
- 一句话总结：同一个接口已经可以按三层拆分独立实现，后续切 NestJS 会非常顺滑。
- 关键收获：
  - 路由层只负责“接收 + 返回”，不写 SQL
  - 业务语义放到 service，repo 专注数据查询
  - `/:id` 用 `params` 最适合资源定位场景

## Week 3 进展 - 2026-03-29（分层实战 Day 1 - query 对照）
- 今日目标：通过一个 query 场景接口，明确 `params` 与 `query` 的分工边界
- 实际完成：
  - `src/repos/blog-repo-sqlite.js` 新增 `listPostsWithAuthorQuery`
  - `src/services/blog-service.js` 新增 `searchPosts`
  - `src/routes/posts-routes.js` 新增 `GET /posts/search`
  - `package.json` 新增 `curl:search-posts`
- 一句话总结：同一个“文章域”里，`/posts/:id`（params）和 `/posts/search?...`（query）的语义边界已经清晰。
- 关键收获：
  - `params` 用于资源定位，`query` 用于列表筛选/分页/排序
  - query 接口同样需要分页上限和排序白名单保护
  - service 层负责 query 参数归一化，repo 层负责 SQL 执行

## Week 3 进展 - 2026-03-29（分层实战 Day 2 - body 复杂查询）
- 今日目标：理解“复杂检索为什么更适合 body”，并落地一个 POST 检索接口
- 实际完成：
  - `src/repos/blog-repo-sqlite.js` 新增 `listPostsWithAuthorAdvancedQuery`
  - `src/services/blog-service.js` 新增 `searchPostsAdvanced`
  - `src/routes/posts-routes.js` 新增 `POST /posts/search-advanced`
  - `package.json` 新增 `curl:search-posts-advanced`
- 一句话总结：当过滤条件变多、含数组参数时，用 body 比 query 更清晰、更稳定。
- 关键收获：
  - query 适合轻量筛选；body 适合复杂组合条件
  - body 检索同样要做分页上限、排序白名单、参数归一化
  - “路由收参数 -> service 归一化 -> repo 组 SQL”的链路已形成固定心智模型

## Week 3 进展 - 2026-04-01（分层实战 Day 3 - 统一参数校验工具）
- 今日目标：把 `GET /posts/:id`、`GET /posts/search`、`POST /posts/search-advanced` 里的重复参数处理抽成统一工具，减少 service 层重复代码
- 实际完成：
  - `src/app/request-validators.js` 新增 `validatePostDetailParams`
  - `src/app/request-validators.js` 新增 `normalizePostSearchQuery`
  - `src/app/request-validators.js` 新增 `validateAdvancedPostSearchBody`
  - `src/services/blog-service.js` 的 `getPostDetail`、`searchPosts`、`searchPostsAdvanced` 改为调用统一参数工具
- 一句话总结：开始把“参数怎么收、怎么校验、怎么归一化”从业务流程里拆出来，service 变得更聚焦。
- 关键收获：
  - `routes` 层继续只收请求，不负责参数规则判断
  - `services` 层仍然拥有参数校验语义，但可把重复规则下沉到业务校验工具
  - 原子工具（`parseId`、`parsePositiveInt`、排序白名单）和场景工具（文章详情/轻量搜索/高级搜索）适合分两层组织
  - 抽象的标准不是“能不能抽”，而是“这段逻辑是不是稳定、重复、可复用”

## Week 3 进展 - 2026-04-02（分层实战 Day 4 - 自动化测试入门）
- 今日目标：为刚抽出来的参数工具和 service 关键路径补自动化测试，验证重构没有改坏行为
- 实际完成：
  - 新增 `test/request-validators.test.js`
  - 用 `node:test` + `node:assert/strict` 为 `request-validators` 补纯函数测试
  - 用内存 SQLite（`:memory:`）为 `getPostDetail`、`searchPosts`、`searchPostsAdvanced` 补 service 层行为测试
  - `package.json` 的 `test` 脚本改为 `node --test`
- 一句话总结：从“我觉得代码没问题”升级为“我能用测试证明这次重构没改坏行为”。
- 关键收获：
  - 纯函数最容易测试，适合从参数校验工具开始练手
  - service 测试更关注业务承诺：`400/404/200` 是否正确，而不是内部实现细节
  - 内存数据库适合做后端学习项目的最小隔离测试，不会污染真实数据文件
  - 自动化测试是后续继续重构 service/repo 的安全网

## Week 3 进展 - 2026-04-06（分层实战 Day 5 - 统一 Service 返回结果）
- 今日目标：把 service 层大量重复的 `{ status, payload }` 返回结构抽成统一结果工具，进一步减少样板代码
- 实际完成：
  - `src/app/service-results.js` 新增 `ok`、`created`、`badRequest`、`notFound`、`conflict`、`internalError`
  - `src/services/blog-service.js` 改为统一使用结果工具返回 `200/201/400/404/500`
  - `src/services/users-service.js` 改为统一使用结果工具返回 `200/201/400/404/409/500`
  - `src/app/request-validators.js` 的 `400` 参数错误也接入统一结果工具
  - 新增 `test/service-results.test.js`，补齐统一结果工具的纯函数测试
- 一句话总结：输入侧已经统一，输出侧也开始统一，service 层越来越像真正的业务编排层。
- 关键收获：
  - `sendJSON` 负责“怎么发响应”，`service-results` 负责“service 应该返回什么语义”
  - `ok/notFound/internalError` 这类语义化函数能让 service 更容易读，也更容易统一状态码规范
  - 抽象目标不是省几行代码，而是把稳定的返回协议收敛到一个地方维护
  - 参数工具统一输入，结果工具统一输出，service 才真正专注业务分支判断

## Week 3 进展 - 2026-04-06（分层实战 Day 6 - 统一列表 Query 工具）
- 今日目标：继续把用户列表和文章统计里的重复 query 归一化逻辑抽成场景工具，让列表类 service 也保持统一写法
- 实际完成：
  - `src/app/request-validators.js` 新增 `normalizeUserListQuery`
  - `src/app/request-validators.js` 新增 `normalizePostStatsQuery`
  - `src/services/users-service.js` 的 `listUsers` 改为调用统一 query 工具
  - `src/services/blog-service.js` 的 `listPostStats` 改为调用统一 query 工具
  - `test/request-validators.test.js` 新增用户列表和文章统计的纯函数测试与 service 测试
  - 修复 `src/repos/blog-repo-sqlite.js` 中聚合排序默认字段的歧义问题：默认排序从 `id` 调整为显式 `p.id`
- 一句话总结：列表类接口的分页、排序、筛选也开始统一收口，service 层进一步变薄了。
- 关键收获：
  - `request-validators` 不只适合 `params/body`，也适合承接稳定的列表 query 规则
  - 列表类 query 的核心模式是：默认值、页大小上限、排序白名单、筛选参数归一化
  - 自动化测试不只是验证“抽象没改坏”，也能帮你抓出真实 SQL 细节问题
  - 多表聚合查询里默认排序字段要写成带表前缀的列名，避免 `ORDER BY id` 这类歧义
- 明天继续：可以开始考虑把“创建/更新”类接口里的 body 校验也继续场景化拆分，例如文章创建、评论创建、用户更新等输入规则
