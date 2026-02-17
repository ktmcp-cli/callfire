import Conf from 'conf';

const config = new Conf({
  projectName: 'callfire-cli',
  schema: {
    username: {
      type: 'string',
      default: ''
    },
    password: {
      type: 'string',
      default: ''
    },
    baseUrl: {
      type: 'string',
      default: 'https://api.callfire.com/v2'
    }
  }
});

export function getConfig(key) {
  return config.get(key);
}

export function setConfig(key, value) {
  config.set(key, value);
}

export function getAllConfig() {
  return config.store;
}

export function clearConfig() {
  config.clear();
}

export function isConfigured() {
  const username = config.get('username');
  const password = config.get('password');
  return !!(username && password);
}

export default config;
