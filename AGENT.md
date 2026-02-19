# CallFire CLI - AI Agent Usage Guide

This CLI is designed to be used by AI agents for voice and SMS communications.

## Authentication

Before using any commands, configure your credentials:

```bash
callfire config set --username YOUR_USERNAME --password YOUR_PASSWORD
```

## Common Tasks

### 1. Send SMS Message

```bash
callfire texts send --to "+1234567890" --message "MESSAGE_TEXT" --json
callfire texts send --from "+SOURCE" --to "+DEST" --message "TEXT" --json
```

### 2. List Text Messages

```bash
callfire texts list --json
```

### 3. Get Text Message Status

```bash
callfire texts get TEXT_ID --json
```

### 4. Make Voice Call

```bash
callfire calls send --to "+1234567890" --json
callfire calls send --from "+SOURCE" --to "+DEST" --json
```

### 5. List Calls

```bash
callfire calls list --json
```

### 6. Get Call Details

```bash
callfire calls get CALL_ID --json
```

### 7. List Campaigns

```bash
callfire campaigns list --json
```

### 8. Get Campaign Details

```bash
callfire campaigns get CAMPAIGN_ID --json
```

## JSON Output

All commands support `--json` flag for structured output suitable for parsing.

## Error Handling

- Exit code 0 = success
- Exit code 1 = error (check stderr for message)

## Use Cases

- **SMS Notifications**: Send order confirmations, alerts, reminders
- **Voice Calls**: Make automated calls for notifications or surveys
- **2FA/OTP**: Send verification codes via SMS
- **Campaigns**: Manage broadcast SMS or voice campaigns
- **Call Tracking**: Monitor call status and duration
