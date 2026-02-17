> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# CallFire CLI

A production-ready command-line interface for the [CallFire](https://callfire.com) SMS and voice broadcasting API. Send text messages, make voice calls, manage campaigns, and handle contacts directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by CallFire, Inc.

## Features

- **Calls** — List, view, and send voice calls with text-to-speech
- **Texts** — Send and manage SMS messages
- **Campaigns** — View voice and text broadcast campaigns
- **Contacts** — Manage your contact list
- **Account** — Check account info and credit balance
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output with chalk

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/callfire
```

## Authentication Setup

Use your CallFire API credentials (username and password) from the [CallFire Developer Portal](https://www.callfire.com/ui/#/developer).

### Configure the CLI

```bash
callfire config set --username YOUR_USERNAME --password YOUR_PASSWORD
```

## Commands

### Configuration

```bash
callfire config set --username <user> --password <pass>
callfire config show
```

### Voice Calls

```bash
# List all calls
callfire calls list

# Filter by status
callfire calls list --status FINISHED

# Get a specific call
callfire calls get <call-id>

# Send a voice call (text-to-speech)
callfire calls send \
  --to +12125551234 \
  --from +18005551234 \
  --message "Hello, this is an automated message." \
  --machine-message "Please leave a message after the tone."
```

### SMS Text Messages

```bash
# List texts
callfire texts list

# Get a specific text
callfire texts get <text-id>

# Send an SMS
callfire texts send \
  --to +12125551234 \
  --from +18005551234 \
  --message "Your appointment is confirmed for tomorrow at 3pm."
```

### Campaigns

```bash
# List call campaigns
callfire campaigns list --type call

# List text campaigns
callfire campaigns list --type text

# Get a specific campaign
callfire campaigns get <campaign-id> --type call
```

### Contacts

```bash
# List contacts
callfire contacts list

# Get a specific contact
callfire contacts get <contact-id>

# Create a contact
callfire contacts create \
  --first-name "John" \
  --last-name "Doe" \
  --mobile-phone +12125551234 \
  --email john@example.com
```

### Account

```bash
# View account info
callfire account info

# Check credit balance
callfire account credits
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all texts as JSON
callfire texts list --json

# Get call details
callfire calls get <id> --json | jq '{id, to: .toNumber, from: .fromNumber, status: .state}'

# Check balance
callfire account credits --json | jq '.credits'
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/callfire](https://github.com/ktmcp-cli/callfire).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
