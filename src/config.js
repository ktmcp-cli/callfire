import Conf from 'conf';

const config = new Conf({
  projectName: 'callfire-cli',
  schema: {
    apiUsername: { type: 'string', default: '' },
    apiPassword: { type: 'string', default: '' }
  }
});

export function getConfig(key) { return config.get(key); }
export function setConfig(key, value) { config.set(key, value); }
export function getAllConfig() { return config.store; }
export function clearConfig() { config.clear(); }
export function isConfigured() {
  const apiUsername = config.get('apiUsername');
  const apiPassword = config.get('apiPassword');
  return !!(apiUsername && apiPassword);
}
export default config;
