const http = require('http');
const https = require('https');

/**
 * 工具函数：测试连接 + 格式校验
 */

// 测试 URL 连通性
function testConnection(baseUrl) {
  return new Promise((resolve) => {
    if (!baseUrl || !/^https?:\/\/.+/.test(baseUrl)) {
      return resolve({ success: false, error: 'URL 格式不正确' });
    }

    const client = baseUrl.startsWith('https') ? https : http;
    const url = new URL(baseUrl);

    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname || '/',
        method: 'GET',
        timeout: 5000,
        rejectUnauthorized: false, // 自签名证书也允许
      },
      (res) => {
        resolve({
          success: true,
          statusCode: res.statusCode,
          message: `连接成功 (HTTP ${res.statusCode})`,
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: '连接超时 (5s)' });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: `连接失败: ${err.message}` });
    });

    req.end();
  });
}

// ID 格式校验
function isValidId(id, min = 2, max = 64) {
  if (typeof id !== 'string') return false;
  return new RegExp(`^[a-zA-Z0-9_.-]{${min},${max}}$`).test(id);
}

module.exports = { testConnection, isValidId };
