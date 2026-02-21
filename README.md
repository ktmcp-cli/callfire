> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# CallFire CLI

A production-ready command-line interface for the [CallFire](https://www.callfire.com) API. Send SMS messages, make voice calls, and manage campaigns directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by CallFire.

## Features

- **Text Messaging** — Send and manage SMS/text messages
- **Voice Calls** — Make and track voice calls
- **Campaigns** — Manage voice and SMS campaigns
- **HTTP Basic Auth** — Secure authentication with username/password
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output

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

### 1. Get API Credentials

1. Log in to [CallFire](https://www.callfire.com)
2. Enable API access in your account settings
3. Generate API username and password

### 2. Configure the CLI

```bash
callfire config set --username YOUR_USERNAME --password YOUR_PASSWORD
```

### 3. Verify

```bash
callfire config show
```

## Commands

### Configuration

```bash
# Set credentials
callfire config set --username <user> --password <pass>

# Show current config
callfire config show
```

### Text Messages

```bash
# List text messages
callfire texts list

# Send a text message
callfire texts send --to "+1234567890" --message "Hello from CLI"
callfire texts send --from "+0987654321" --to "+1234567890" --message "Custom sender"

# Get text details
callfire texts get <text-id>
```

### Voice Calls

```bash
# List calls
callfire calls list

# Make a call
callfire calls send --to "+1234567890"
callfire calls send --from "+0987654321" --to "+1234567890"

# Get call details
callfire calls get <call-id>
```

### Campaigns

```bash
# List campaigns
callfire campaigns list

# Get campaign details
callfire campaigns get <campaign-id>
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all texts as JSON
callfire texts list --json

# Pipe to jq for filtering
callfire texts list --json | jq '.[] | select(.state == "SENT")'

# Get call status
callfire calls get <id> --json | jq '.state'
```

## Examples

### Send SMS notifications

```bash
# Send a simple text
callfire texts send --to "+1234567890" --message "Your order has shipped!"

# Send from custom number
callfire texts send \
  --from "+0987654321" \
  --to "+1234567890" \
  --message "Verification code: 123456"
```

### Make voice calls

```bash
# Make a call
callfire calls send --to "+1234567890"

# Check call status
callfire calls get <call-id> --json
```

### Track campaign performance

```bash
# List all campaigns
callfire campaigns list --json

# Get campaign details
callfire campaigns get <campaign-id> --json | jq '{name: .name, status: .status}'
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/callfire](https://github.com/ktmcp-cli/callfire).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.


---

## Support KTMCP

If you find this CLI useful, we'd greatly appreciate your support! Share your experience on:
- Reddit
- Twitter/X
- Hacker News

**Incentive:** Users who can demonstrate that their support/advocacy helped advance KTMCP will have their feature requests and issues prioritized.

Just be mindful - these are real accounts and real communities. Authentic mentions and genuine recommendations go a long way!

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.
