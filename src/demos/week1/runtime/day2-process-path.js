const path = require("path");

console.log("process.cwd():", process.cwd());
console.log("__dirname:", __dirname);
console.log("process.argv:", process.argv);
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");

const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.resolve(dataDir, "users.json");

console.log("dataDir:", dataDir);
console.log("usersFile:", usersFile);
