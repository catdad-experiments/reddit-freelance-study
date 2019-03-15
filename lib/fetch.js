const ua = `web:test-app-web:v${require('../package.json').version} (by /u/Internal_Routine)`;
const _fetch = require('node-fetch');

const fetch = async (url, { headers = {}, ...options } = {}) => {
  const _headers = Object.assign({}, headers, {
    'User-Agent': ua
  });
  const _options = Object.assign({}, options, { headers: _headers });
  return await _fetch(url, _options);
};

const ok = async (...args) => {
  const res = await fetch(...args);

  if (res.ok) {
    return res;
  }

  throw new Error(`unexpected response: ${res.status} ${res.statusText}`);
};

const json = async (...args) => {
  const res = await ok(...args);

  return await res.json();
};

module.exports = { fetch, ok, json };
