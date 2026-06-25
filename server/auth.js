const { execSync } = require('child_process');
const path = require('path');

/**
 * Linux PAM 认证模块
 * 通过 Python ctypes 调用 libpam，免去 native 编译依赖
 */

const PAM_HELPER = path.join(__dirname, 'pam_helper.py');

function authenticate(username, password) {
  return new Promise((resolve) => {
    try {
      // 通过 stdin 传递用户名和密码
      const input = `${username}\n${password}`;
      const result = execSync(`python3 "${PAM_HELPER}"`, {
        input,
        encoding: 'utf8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      const parsed = JSON.parse(result.trim());
      resolve(parsed);
    } catch (err) {
      // JSON 解析失败或其他异常
      resolve({ success: false, error: `认证服务异常: ${err.message}` });
    }
  });
}

module.exports = { authenticate };
