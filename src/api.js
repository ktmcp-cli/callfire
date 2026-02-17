import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://api.callfire.com/v2';

function getClient() {
  const username = getConfig('username');
  const password = getConfig('password');
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) throw new Error('Authentication failed. Check your username and password.');
    if (status === 403) throw new Error('Access forbidden. Check your API permissions.');
    if (status === 404) throw new Error('Resource not found.');
    if (status === 429) throw new Error('Rate limit exceeded. Please wait before retrying.');
    const message = data?.message || data?.developerMessage || JSON.stringify(data);
    throw new Error(`API Error (${status}): ${message}`);
  } else if (error.request) {
    throw new Error('No response from CallFire API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// CALLS
// ============================================================

export async function listCalls({ limit = 25, offset = 0, status } = {}) {
  const client = getClient();
  try {
    const params = { limit, offset };
    if (status) params.states = status;
    const response = await client.get('/calls', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getCall(callId) {
  const client = getClient();
  try {
    const response = await client.get(`/calls/${callId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function sendCall({ toNumber, fromNumber, message, liveMessage, machineMessage } = {}) {
  const client = getClient();
  try {
    const body = {
      toNumber,
      config: {
        fromNumber,
        ...(liveMessage && { liveMessage }),
        ...(machineMessage && { machineMessage })
      }
    };
    const response = await client.post('/calls/sound-texts', body);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// TEXTS (SMS)
// ============================================================

export async function listTexts({ limit = 25, offset = 0, status } = {}) {
  const client = getClient();
  try {
    const params = { limit, offset };
    if (status) params.states = status;
    const response = await client.get('/texts', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getText(textId) {
  const client = getClient();
  try {
    const response = await client.get(`/texts/${textId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function sendText({ toNumber, fromNumber, message } = {}) {
  const client = getClient();
  try {
    const body = {
      toNumber,
      config: { fromNumber },
      message
    };
    const response = await client.post('/texts/simple', body);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// CAMPAIGNS
// ============================================================

export async function listCampaigns({ limit = 25, offset = 0, type } = {}) {
  const client = getClient();
  try {
    const endpoint = type === 'text' ? '/texts/campaigns' : '/calls/campaigns';
    const response = await client.get(endpoint, { params: { limit, offset } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getCampaign(campaignId, { type = 'call' } = {}) {
  const client = getClient();
  try {
    const endpoint = type === 'text' ? `/texts/campaigns/${campaignId}` : `/calls/campaigns/${campaignId}`;
    const response = await client.get(endpoint);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// CONTACTS
// ============================================================

export async function listContacts({ limit = 25, offset = 0, search } = {}) {
  const client = getClient();
  try {
    const params = { limit, offset };
    if (search) params.number = search;
    const response = await client.get('/contacts', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getContact(contactId) {
  const client = getClient();
  try {
    const response = await client.get(`/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createContact({ firstName, lastName, homePhone, mobilePhone, email } = {}) {
  const client = getClient();
  try {
    const body = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(homePhone && { homePhone }),
      ...(mobilePhone && { mobilePhone }),
      ...(email && { email })
    };
    const response = await client.post('/contacts', body);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// ACCOUNT
// ============================================================

export async function getAccount() {
  const client = getClient();
  try {
    const response = await client.get('/me/account');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getCredits() {
  const client = getClient();
  try {
    const response = await client.get('/me/billing/credit');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
