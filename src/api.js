import axios from 'axios';
import { getConfig } from './config.js';

const CALLFIRE_BASE_URL = 'https://api.callfire.com/v2';

function createClient() {
  const apiUsername = getConfig('apiUsername');
  const apiPassword = getConfig('apiPassword');
  if (!apiUsername || !apiPassword) {
    throw new Error('API credentials not configured. Run: callfire config set --username <user> --password <pass>');
  }
  const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
  return axios.create({
    baseURL: CALLFIRE_BASE_URL,
    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' }
  });
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) throw new Error('Authentication failed. Check your API credentials.');
    else if (status === 403) throw new Error('Access forbidden. Check your API permissions.');
    else if (status === 404) throw new Error('Resource not found.');
    else if (status === 429) throw new Error('Rate limit exceeded. Please wait before retrying.');
    else {
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) throw new Error('No response from CallFire API. Check your internet connection.');
  else throw error;
}

export async function listTextMessages(params = {}) {
  const client = createClient();
  try { const response = await client.get('/texts', { params }); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function sendText(textData) {
  const client = createClient();
  try { const response = await client.post('/texts', textData); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function getText(textId) {
  const client = createClient();
  try { const response = await client.get(`/texts/${textId}`); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function listCalls(params = {}) {
  const client = createClient();
  try { const response = await client.get('/calls', { params }); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function sendCall(callData) {
  const client = createClient();
  try { const response = await client.post('/calls', callData); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function getCall(callId) {
  const client = createClient();
  try { const response = await client.get(`/calls/${callId}`); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function listCampaigns(params = {}) {
  const client = createClient();
  try { const response = await client.get('/campaigns', { params }); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function getCampaign(campaignId) {
  const client = createClient();
  try { const response = await client.get(`/campaigns/${campaignId}`); return response.data; }
  catch (error) { handleApiError(error); }
}

export async function createCampaign(campaignData) {
  const client = createClient();
  try { const response = await client.post('/campaigns', campaignData); return response.data; }
  catch (error) { handleApiError(error); }
}
