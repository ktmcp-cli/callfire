import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  listCalls,
  getCall,
  sendCall,
  listTexts,
  getText,
  sendText,
  listCampaigns,
  getCampaign,
  listContacts,
  getContact,
  createContact,
  getAccount,
  getCredits
} from './api.js';

const program = new Command();

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }
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

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('CallFire credentials not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  callfire config set --username <user> --password <pass>'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('callfire')
  .description(chalk.bold('CallFire CLI') + ' - SMS & voice broadcasting from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--username <user>', 'CallFire API username')
  .option('--password <pass>', 'CallFire API password')
  .action((options) => {
    if (options.username) { setConfig('username', options.username); printSuccess('Username set'); }
    if (options.password) { setConfig('password', options.password); printSuccess('Password set'); }
    if (!options.username && !options.password) {
      printError('No options provided. Use --username and/or --password');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const username = getConfig('username');
    const password = getConfig('password');
    console.log(chalk.bold('\nCallFire CLI Configuration\n'));
    console.log('Username: ', username ? chalk.green(username) : chalk.red('not set'));
    console.log('Password: ', password ? chalk.green('*'.repeat(8)) : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// CALLS
// ============================================================

const callsCmd = program.command('calls').description('Manage voice calls');

callsCmd
  .command('list')
  .description('List voice calls')
  .option('--limit <n>', 'Maximum results', '25')
  .option('--offset <n>', 'Offset for pagination', '0')
  .option('--status <status>', 'Filter by status (READY|SELECTED|CALLBACK|FINISHED|DISABLED|DNC|DNC_LIST|...)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching calls...', () =>
        listCalls({ limit: parseInt(options.limit), offset: parseInt(options.offset), status: options.status })
      );
      if (options.json) { printJson(data); return; }
      const items = data.items || data || [];
      printTable(Array.isArray(items) ? items : [items], [
        { key: 'id', label: 'ID', format: (v) => v ? String(v) : 'N/A' },
        { key: 'toNumber', label: 'To', format: (v) => v || 'N/A' },
        { key: 'fromNumber', label: 'From', format: (v) => v || 'N/A' },
        { key: 'state', label: 'Status', format: (v) => v || 'N/A' },
        { key: 'duration', label: 'Duration', format: (v) => v ? `${v}s` : 'N/A' },
        { key: 'created', label: 'Created', format: (v) => v ? new Date(v).toLocaleString() : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

callsCmd
  .command('get <call-id>')
  .description('Get a specific call')
  .option('--json', 'Output as JSON')
  .action(async (callId, options) => {
    requireAuth();
    try {
      const call = await withSpinner('Fetching call...', () => getCall(callId));
      if (options.json) { printJson(call); return; }
      console.log(chalk.bold('\nCall Details\n'));
      console.log('ID:       ', chalk.cyan(call.id || callId));
      console.log('To:       ', call.toNumber || 'N/A');
      console.log('From:     ', call.fromNumber || 'N/A');
      console.log('Status:   ', call.state || 'N/A');
      console.log('Duration: ', call.duration ? `${call.duration}s` : 'N/A');
      console.log('Created:  ', call.created ? new Date(call.created).toLocaleString() : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

callsCmd
  .command('send')
  .description('Send a voice call with a text-to-speech message')
  .requiredOption('--to <number>', 'Recipient phone number (E.164 format)')
  .requiredOption('--from <number>', 'Sender phone number')
  .requiredOption('--message <text>', 'Message for live answer')
  .option('--machine-message <text>', 'Message for answering machine')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Sending call...', () =>
        sendCall({
          toNumber: options.to,
          fromNumber: options.from,
          liveMessage: options.message,
          machineMessage: options.machineMessage
        })
      );
      if (options.json) { printJson(result); return; }
      printSuccess(`Call initiated to ${options.to}`);
      console.log('Call ID: ', result.id || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// TEXTS (SMS)
// ============================================================

const textsCmd = program.command('texts').description('Manage SMS text messages');

textsCmd
  .command('list')
  .description('List SMS messages')
  .option('--limit <n>', 'Maximum results', '25')
  .option('--offset <n>', 'Offset for pagination', '0')
  .option('--status <status>', 'Filter by status')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching texts...', () =>
        listTexts({ limit: parseInt(options.limit), offset: parseInt(options.offset), status: options.status })
      );
      if (options.json) { printJson(data); return; }
      const items = data.items || data || [];
      printTable(Array.isArray(items) ? items : [items], [
        { key: 'id', label: 'ID', format: (v) => v ? String(v) : 'N/A' },
        { key: 'toNumber', label: 'To', format: (v) => v || 'N/A' },
        { key: 'fromNumber', label: 'From', format: (v) => v || 'N/A' },
        { key: 'message', label: 'Message', format: (v) => v ? v.substring(0, 30) + (v.length > 30 ? '...' : '') : 'N/A' },
        { key: 'state', label: 'Status', format: (v) => v || 'N/A' },
        { key: 'created', label: 'Created', format: (v) => v ? new Date(v).toLocaleString() : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

textsCmd
  .command('get <text-id>')
  .description('Get a specific text message')
  .option('--json', 'Output as JSON')
  .action(async (textId, options) => {
    requireAuth();
    try {
      const text = await withSpinner('Fetching text...', () => getText(textId));
      if (options.json) { printJson(text); return; }
      console.log(chalk.bold('\nText Message Details\n'));
      console.log('ID:      ', chalk.cyan(text.id || textId));
      console.log('To:      ', text.toNumber || 'N/A');
      console.log('From:    ', text.fromNumber || 'N/A');
      console.log('Status:  ', text.state || 'N/A');
      console.log('Message: ', text.message || 'N/A');
      console.log('Created: ', text.created ? new Date(text.created).toLocaleString() : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

textsCmd
  .command('send')
  .description('Send an SMS text message')
  .requiredOption('--to <number>', 'Recipient phone number (E.164 format)')
  .requiredOption('--from <number>', 'Sender phone number')
  .requiredOption('--message <text>', 'SMS message text')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Sending text...', () =>
        sendText({ toNumber: options.to, fromNumber: options.from, message: options.message })
      );
      if (options.json) { printJson(result); return; }
      printSuccess(`SMS sent to ${options.to}`);
      console.log('Text ID: ', result.id || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// CAMPAIGNS
// ============================================================

const campaignsCmd = program.command('campaigns').description('Manage broadcast campaigns');

campaignsCmd
  .command('list')
  .description('List campaigns')
  .option('--type <type>', 'Campaign type: call or text', 'call')
  .option('--limit <n>', 'Maximum results', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching campaigns...', () =>
        listCampaigns({ limit: parseInt(options.limit), type: options.type })
      );
      if (options.json) { printJson(data); return; }
      const items = data.items || data || [];
      printTable(Array.isArray(items) ? items : [items], [
        { key: 'id', label: 'ID', format: (v) => v ? String(v) : 'N/A' },
        { key: 'name', label: 'Name', format: (v) => v || 'N/A' },
        { key: 'status', label: 'Status', format: (v) => v || 'N/A' },
        { key: 'created', label: 'Created', format: (v) => v ? new Date(v).toLocaleString() : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

campaignsCmd
  .command('get <campaign-id>')
  .description('Get a specific campaign')
  .option('--type <type>', 'Campaign type: call or text', 'call')
  .option('--json', 'Output as JSON')
  .action(async (campaignId, options) => {
    requireAuth();
    try {
      const campaign = await withSpinner('Fetching campaign...', () =>
        getCampaign(campaignId, { type: options.type })
      );
      if (options.json) { printJson(campaign); return; }
      console.log(chalk.bold('\nCampaign Details\n'));
      console.log('ID:      ', chalk.cyan(campaign.id || campaignId));
      console.log('Name:    ', campaign.name || 'N/A');
      console.log('Status:  ', campaign.status || 'N/A');
      console.log('Created: ', campaign.created ? new Date(campaign.created).toLocaleString() : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// CONTACTS
// ============================================================

const contactsCmd = program.command('contacts').description('Manage contacts');

contactsCmd
  .command('list')
  .description('List contacts')
  .option('--limit <n>', 'Maximum results', '25')
  .option('--search <number>', 'Search by phone number')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching contacts...', () =>
        listContacts({ limit: parseInt(options.limit), search: options.search })
      );
      if (options.json) { printJson(data); return; }
      const items = data.items || data || [];
      printTable(Array.isArray(items) ? items : [items], [
        { key: 'id', label: 'ID', format: (v) => v ? String(v) : 'N/A' },
        { key: 'firstName', label: 'First Name', format: (v) => v || 'N/A' },
        { key: 'lastName', label: 'Last Name', format: (v) => v || 'N/A' },
        { key: 'homePhone', label: 'Home Phone', format: (v) => v || 'N/A' },
        { key: 'mobilePhone', label: 'Mobile', format: (v) => v || 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

contactsCmd
  .command('get <contact-id>')
  .description('Get a specific contact')
  .option('--json', 'Output as JSON')
  .action(async (contactId, options) => {
    requireAuth();
    try {
      const contact = await withSpinner('Fetching contact...', () => getContact(contactId));
      if (options.json) { printJson(contact); return; }
      console.log(chalk.bold('\nContact Details\n'));
      console.log('ID:           ', chalk.cyan(contact.id || contactId));
      console.log('First Name:   ', contact.firstName || 'N/A');
      console.log('Last Name:    ', contact.lastName || 'N/A');
      console.log('Home Phone:   ', contact.homePhone || 'N/A');
      console.log('Mobile:       ', contact.mobilePhone || 'N/A');
      console.log('Email:        ', contact.email || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

contactsCmd
  .command('create')
  .description('Create a new contact')
  .option('--first-name <name>', 'First name')
  .option('--last-name <name>', 'Last name')
  .option('--home-phone <number>', 'Home phone (E.164 format)')
  .option('--mobile-phone <number>', 'Mobile phone (E.164 format)')
  .option('--email <email>', 'Email address')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const contact = await withSpinner('Creating contact...', () =>
        createContact({
          firstName: options.firstName,
          lastName: options.lastName,
          homePhone: options.homePhone,
          mobilePhone: options.mobilePhone,
          email: options.email
        })
      );
      if (options.json) { printJson(contact); return; }
      printSuccess(`Contact created: ${[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'N/A'}`);
      console.log('Contact ID: ', contact.id || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// ACCOUNT
// ============================================================

const accountCmd = program.command('account').description('View account information');

accountCmd
  .command('info')
  .description('Get account information')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const account = await withSpinner('Fetching account...', () => getAccount());
      if (options.json) { printJson(account); return; }
      console.log(chalk.bold('\nAccount Information\n'));
      console.log('Name:     ', account.name || 'N/A');
      console.log('Email:    ', account.email || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

accountCmd
  .command('credits')
  .description('Check account credit balance')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const credits = await withSpinner('Fetching credits...', () => getCredits());
      if (options.json) { printJson(credits); return; }
      console.log(chalk.bold('\nAccount Credits\n'));
      console.log('Credits: ', chalk.green(credits.credits !== undefined ? String(credits.credits) : JSON.stringify(credits)));
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
