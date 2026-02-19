import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import { listTextMessages, sendText, getText, listCalls, sendCall, getCall, listCampaigns, getCampaign, createCampaign } from './api.js';

const program = new Command();

function printSuccess(message) { console.log(chalk.green('✓') + ' ' + message); }
function printError(message) { console.error(chalk.red('✗') + ' ' + message); }
function printJson(data) { console.log(JSON.stringify(data, null, 2)); }

function printTable(data, columns) {
  if (!data || data.length === 0) { console.log(chalk.yellow('No results found.')); return; }
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });
  console.log(chalk.dim(`\n${data.length} result(s)`));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try { const result = await fn(); spinner.stop(); return result; }
  catch (error) { spinner.stop(); throw error; }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('API credentials not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  callfire config set --username <user> --password <pass>'));
    process.exit(1);
  }
}

program.name('callfire').description(chalk.bold('CallFire CLI') + ' - Voice and SMS from your terminal').version('1.0.0');

const configCmd = program.command('config').description('Manage CLI configuration');
configCmd.command('set').description('Set configuration values')
  .option('--username <user>', 'CallFire API username').option('--password <pass>', 'CallFire API password')
  .action((options) => {
    if (options.username) { setConfig('apiUsername', options.username); printSuccess('Username set'); }
    if (options.password) { setConfig('apiPassword', options.password); printSuccess('Password set'); }
    if (!options.username && !options.password) { printError('No options provided. Use --username and --password'); }
  });

configCmd.command('show').description('Show current configuration').action(() => {
  const apiUsername = getConfig('apiUsername');
  const apiPassword = getConfig('apiPassword');
  console.log(chalk.bold('\nCallFire CLI Configuration\n'));
  console.log('Username: ', apiUsername ? chalk.green(apiUsername) : chalk.red('not set'));
  console.log('Password: ', apiPassword ? chalk.green('*'.repeat(8)) : chalk.red('not set'));
  console.log('');
});

const textsCmd = program.command('texts').description('Manage text messages');
textsCmd.command('list').description('List text messages').option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching texts...', () => listTextMessages());
      const items = result.items || result;
      if (options.json) { printJson(items); return; }
      printTable(items, [
        { key: 'id', label: 'ID' },
        { key: 'fromNumber', label: 'From' },
        { key: 'toNumber', label: 'To' },
        { key: 'message', label: 'Message' },
        { key: 'state', label: 'State' }
      ]);
    } catch (error) { printError(error.message); process.exit(1); }
  });

textsCmd.command('send').description('Send a text message')
  .requiredOption('--to <number>', 'Recipient phone number').requiredOption('--message <text>', 'Message body')
  .option('--from <number>', 'Sender phone number').option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const textData = { recipients: [{ phoneNumber: options.to }], message: options.message };
      if (options.from) textData.fromNumber = options.from;
      const result = await withSpinner('Sending text...', () => sendText(textData));
      if (options.json) { printJson(result); return; }
      printSuccess('Text sent successfully');
    } catch (error) { printError(error.message); process.exit(1); }
  });

textsCmd.command('get <text-id>').description('Get text details').option('--json', 'Output as JSON')
  .action(async (textId, options) => {
    requireAuth();
    try {
      const text = await withSpinner('Fetching text...', () => getText(textId));
      if (options.json) { printJson(text); return; }
      console.log(chalk.bold('\nText Details\n'));
      console.log('ID:      ', chalk.cyan(text.id));
      console.log('From:    ', text.fromNumber || 'N/A');
      console.log('To:      ', text.toNumber || 'N/A');
      console.log('Message: ', text.message || 'N/A');
      console.log('State:   ', text.state || 'N/A');
    } catch (error) { printError(error.message); process.exit(1); }
  });

const callsCmd = program.command('calls').description('Manage voice calls');
callsCmd.command('list').description('List calls').option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching calls...', () => listCalls());
      const items = result.items || result;
      if (options.json) { printJson(items); return; }
      printTable(items, [
        { key: 'id', label: 'ID' },
        { key: 'fromNumber', label: 'From' },
        { key: 'toNumber', label: 'To' },
        { key: 'state', label: 'State' },
        { key: 'duration', label: 'Duration (s)' }
      ]);
    } catch (error) { printError(error.message); process.exit(1); }
  });

callsCmd.command('send').description('Make a call')
  .requiredOption('--to <number>', 'Recipient phone number')
  .option('--from <number>', 'Caller phone number').option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const callData = { recipients: [{ phoneNumber: options.to }] };
      if (options.from) callData.fromNumber = options.from;
      const result = await withSpinner('Making call...', () => sendCall(callData));
      if (options.json) { printJson(result); return; }
      printSuccess('Call initiated');
    } catch (error) { printError(error.message); process.exit(1); }
  });

callsCmd.command('get <call-id>').description('Get call details').option('--json', 'Output as JSON')
  .action(async (callId, options) => {
    requireAuth();
    try {
      const call = await withSpinner('Fetching call...', () => getCall(callId));
      if (options.json) { printJson(call); return; }
      console.log(chalk.bold('\nCall Details\n'));
      console.log('ID:       ', chalk.cyan(call.id));
      console.log('From:     ', call.fromNumber || 'N/A');
      console.log('To:       ', call.toNumber || 'N/A');
      console.log('State:    ', call.state || 'N/A');
      console.log('Duration: ', call.duration ? `${call.duration}s` : 'N/A');
    } catch (error) { printError(error.message); process.exit(1); }
  });

const campaignsCmd = program.command('campaigns').description('Manage campaigns');
campaignsCmd.command('list').description('List campaigns').option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching campaigns...', () => listCampaigns());
      const items = result.items || result;
      if (options.json) { printJson(items); return; }
      printTable(items, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
        { key: 'type', label: 'Type' }
      ]);
    } catch (error) { printError(error.message); process.exit(1); }
  });

campaignsCmd.command('get <campaign-id>').description('Get campaign details').option('--json', 'Output as JSON')
  .action(async (campaignId, options) => {
    requireAuth();
    try {
      const campaign = await withSpinner('Fetching campaign...', () => getCampaign(campaignId));
      if (options.json) { printJson(campaign); return; }
      console.log(chalk.bold('\nCampaign Details\n'));
      console.log('ID:     ', chalk.cyan(campaign.id));
      console.log('Name:   ', campaign.name || 'N/A');
      console.log('Status: ', campaign.status || 'N/A');
      console.log('Type:   ', campaign.type || 'N/A');
    } catch (error) { printError(error.message); process.exit(1); }
  });

program.parse(process.argv);
if (process.argv.length <= 2) { program.help(); }
