/**
 * Session 校验中间件 + 错误处理
 */

// 会话最长空闲时间（ms）
const SESSION_MAX_AGE = 60 * 60 * 1000; // 1 小时
const REMEMBER_ME_MAX_AGE = 24 * 60 * 60 * 1000; // 24 小时

// 需要 session 校验的 API 中间件
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated && req.session.username) {
    // 检查会话是否过期
    const now = Date.now();
    const expiresAt = req.session.expiresAt || 0;
    if (now > expiresAt) {
      req.session.destroy(() => {});
      return res.status(401).json({ authenticated: false, error: '会话已过期，请重新登录' });
    }
    return next();
  }
  return res.status(401).json({ authenticated: false, error: '请先登录' });
}

// 全局错误处理
function errorHandler(err, req, res, _next) {
  console.error('[Server Error]', err.message || err);
  // 不暴露内部错误详情
  res.status(500).json({ error: '服务器内部错误' });
}

module.exports = { requireAuth, errorHandler, SESSION_MAX_AGE, REMEMBER_ME_MAX_AGE };
