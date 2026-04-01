const http = require("http");
const { readUsers, addUser } = require("../../../storage/user-store");

// 统一响应 JSON 格式的辅助函数。
function sendJSON(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

// 收集请求流并解析 JSON，遇到错误就抛出。
function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const data = JSON.parse(raw);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 根据方法和路径路由到对应的逻辑。
async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const { pathname } = parsedUrl;

  try {
    if (req.method === "GET" && pathname === "/users") {
      const users = await readUsers();
      sendJSON(res, 200, { code: 0, message: "OK", data: users });
      return;
    }

    if (req.method === "POST" && pathname === "/users") {
      const body = await parseJSONBody(req);
      if (!body || !body.name || !body.email) {
        sendJSON(res, 400, { code: 1, message: "缺少 name 或 email" });
        return;
      }
      const user = {
        id: Date.now(),
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString(),
      };
      await addUser(user);
      sendJSON(res, 201, { code: 0, message: "用户已创建", data: user });
      return;
    }

    sendJSON(res, 404, { code: 1, message: "未找到接口" });
  } catch (error) {
    sendJSON(res, 500, { code: 1, message: "服务内部错误", detail: error.message });
  }
}

// 启动 HTTP 服务；演示模式下允许传 0，让系统分配端口，避免权限问题。
function startServer(port = 3000) {
  const server = http.createServer((req, res) => {
    handleRequest(req, res);
  });
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function runDemo(port) {
  const { server, port: actualPort } = await startServer(port ?? 0);
  console.log(`HTTP 服务已启动，端口 ${actualPort}`);

  const baseUrl = `http://localhost:${actualPort}`;
  const getResp = await fetch(`${baseUrl}/users`);
  console.log("GET /users 响应：", await getResp.json());

  const postResp = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "lite-demo", email: "demo@example.com" }),
  });
  console.log("POST /users 响应：", await postResp.json());

  server.close();
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const demoMode = args.includes("--demo");
  const portArg = args.find((arg) => arg.startsWith("--port="));
  const requestedPort = portArg ? parseInt(portArg.split("=")[1], 10) : null;
  const port = demoMode ? requestedPort ?? 0 : requestedPort ?? 3000;

  if (demoMode) {
    runDemo(port).catch((err) => {
      console.error("demo 执行失败：", err);
      process.exit(1);
    });
  } else {
    startServer(port)
      .then(({ port: actualPort }) => {
        console.log(`服务在 http://localhost:${actualPort} 上运行`);
      })
      .catch((err) => {
        console.error("启动失败：", err);
        process.exit(1);
      });
  }
}

module.exports = {
  startServer,
};
