# AGENT.md — CallFire CLI for AI Agents

This document explains how to use the CallFire CLI as an AI agent.

## Overview

The `callfire` CLI provides access to the CallFire SMS and voice broadcasting API. Use it to send texts, make calls, manage campaigns, and handle contacts.

## Prerequisites

Configure with credentials:

```bash
callfire config set --username <user> --password <pass>
callfire config show
```

## All Commands

### Config

```bash
callfire config set --username <user> --password <pass>
callfire config show
```

### Calls

```bash
callfire calls list
callfire calls list --limit 50 --offset 0
callfire calls list --status FINISHED
callfire calls get <call-id>
callfire calls send --to +12125551234 --from +18005551234 --message "Hello" --machine-message "Leave a message"
```

Call states: `READY`, `SELECTED`, `CALLBACK`, `FINISHED`, `DISABLED`, `DNC`, `DNC_LIST`, `UPLOADED`, `RETRIED`

### Texts (SMS)

```bash
callfire texts list
callfire texts list --limit 50
callfire texts get <text-id>
callfire texts send --to +12125551234 --from +18005551234 --message "Your appointment is confirmed"
```

### Campaigns

```bash
callfire campaigns list --type call
callfire campaigns list --type text
callfire campaigns get <campaign-id> --type call
callfire campaigns get <campaign-id> --type text
```

### Contacts

```bash
callfire contacts list
callfire contacts list --search +12125551234
callfire contacts get <contact-id>
callfire contacts create --first-name "John" --last-name "Doe" --mobile-phone +12125551234 --email john@example.com
```

### Account

```bash
callfire account info
callfire account credits
```

## JSON Output

Always use `--json` when parsing results:

```bash
callfire calls list --json
callfire texts list --json
callfire contacts list --json
callfire account credits --json
```

## Phone Number Format

All phone numbers must be in E.164 format: `+12125551234`

## Error Handling

The CLI exits with code 1 on error. Common errors:
- `Authentication failed` — Check username and password
- `Resource not found` — Verify ID is correct
- `Rate limit exceeded` — Wait and retry
