function sendJSON(res, status, payload) {
  res.status(status).json({ code: payload.code ?? 0, message: payload.message, data: payload.data ?? null });
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePositiveInt(value, fallback) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return fallback;
  }
  return num;
}

function normalizeSortBy(value) {
  return value === "created_at" ? "created_at" : "id";
}

function normalizeSortOrder(value) {
  return String(value || "").toUpperCase() === "ASC" ? "ASC" : "DESC";
}

function normalizeStatsSortBy(value) {
  // 只允许白名单字段，避免 ORDER BY 注入风险。
  return value === "comment_count" ? "comment_count" : "id";
}

module.exports = {
  sendJSON,
  parseId,
  parsePositiveInt,
  normalizeSortBy,
  normalizeSortOrder,
  normalizeStatsSortBy,
};
