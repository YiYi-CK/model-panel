const { spawn } = require('child_process');

/**
 * 通过 openclaw config patch --stdin 写入配置变更
 * 使用 JSON patch 格式，自带头 schema 校验 + 热重载
 */

// 执行 patch 并等待结果
function applyPatch(patchObj) {
  return new Promise((resolve, reject) => {
    const child = spawn('openclaw', ['config', 'patch', '--stdin'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout.trim() });
      } else {
        resolve({
          success: false,
          error: stderr.trim() || stdout.trim() || `openclaw config patch 返回码 ${code}`,
        });
      }
    });

    child.on('error', (err) => {
      reject(new Error(`无法调用 openclaw CLI: ${err.message}`));
    });

    // 写入 patch JSON
    child.stdin.write(JSON.stringify(patchObj));
    child.stdin.end();
  });
}

// 构建 models.providers 路径的 patch 对象
// path: e.g. "deepseek" 或 "deepseek.models[0]"
function buildProviderPatch(path, value) {
  // openclaw config patch 使用嵌套对象格式
  const patch = path.split('.').reduceRight(
    (acc, part) => ({ [part]: acc }),
    value
  );
  return { models: { providers: patch } };
}

// 删除 provider
function deleteProviderPatch(providerId) {
  return { models: { providers: { [providerId]: null } } };
}

// 添加/更新 provider
function upsertProviderPatch(providerId, providerData) {
  return { models: { providers: { [providerId]: providerData } } };
}

// 更新 provider 下的 models 数组
function setModelsPatch(providerId, models) {
  return { models: { providers: { [providerId]: { models } } } };
}

// 删除 provider
async function deleteProvider(providerId) {
  return applyPatch(deleteProviderPatch(providerId));
}

// 添加或更新 provider
async function upsertProvider(providerId, providerData) {
  return applyPatch(upsertProviderPatch(providerId, providerData));
}

// 设置 provider 的 models 数组
async function setProviderModels(providerId, models) {
  return applyPatch(setModelsPatch(providerId, models));
}

module.exports = {
  applyPatch,
  buildProviderPatch,
  deleteProviderPatch,
  upsertProviderPatch,
  setModelsPatch,
  deleteProvider,
  upsertProvider,
  setProviderModels,
};
