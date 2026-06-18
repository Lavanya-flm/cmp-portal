# Email Service Integration (AWS SES)

## Overview

The CMP Portal uses a custom AWS SES email service endpoint for sending transactional emails such as password reset notifications. This service is built using AWS SES (Simple Email Service) and provides a reliable, scalable email delivery solution.

## Configuration

### Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# ─── Email (AWS SES) ──────────────────────────────────────────
EMAIL_API_KEY=your_aws_ses_api_key_here
EMAIL_API_ENDPOINT=https://5z96f7b2hb.execute-api.ap-southeast-1.amazonaws.com/Prod/api/v1/email
EMAIL_FROM_ADDRESS=noreply@frontlinesedutech.com
EMAIL_REPLY_TO_ADDRESS=support@frontlinesedutech.com
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_EXPIRES_MINUTES=30
```

### Environment Variable Details

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_API_KEY` | API key for authenticating with the AWS SES service | Provided by your organization |
| `EMAIL_API_ENDPOINT` | Base URL of the AWS SES API endpoint | `https://5z96f7b2hb.execute-api.ap-southeast-1.amazonaws.com/Prod/api/v1/email` |
| `EMAIL_FROM_ADDRESS` | The email address that emails will be sent from | `noreply@frontlinesedutech.com` |
| `EMAIL_REPLY_TO_ADDRESS` | The email address for replies | `support@frontlinesedutech.com` |
| `FRONTEND_URL` | URL of the frontend application (used in email links) | `http://localhost:5173` |
| `PASSWORD_RESET_EXPIRES_MINUTES` | Number of minutes before password reset tokens expire | `30` |

## API Endpoint Details

### Endpoint

```
POST https://5z96f7b2hb.execute-api.ap-southeast-1.amazonaws.com/Prod/api/v1/email/send
```

### Headers

```
Content-Type: application/json
x-api-key: {{apikey}}
```

### Request Body

```json
{
  "fromEmail": "sender@example.com",
  "toEmails": ["recipient@example.com"],
  "ccEmails": ["cc@example.com"],
  "bccEmails": ["bcc@example.com"],
  "subject": "Important Email",
  "bodyText": "Plain text version",
  "bodyHtml": "<p>HTML version</p>",
  "replyTo": "reply@example.com",
  "priority": 8,
  "maxRetries": 5,
  "metadata": {
    "campaignId": "campaign-123",
    "source": "marketing"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fromEmail` | string | Yes | Sender email address |
| `toEmails` | string[] | Yes | Array of recipient email addresses |
| `ccEmails` | string[] | No | Array of CC email addresses |
| `bccEmails` | string[] | No | Array of BCC email addresses |
| `subject` | string | Yes | Email subject line |
| `bodyText` | string | Yes | Plain text version of the email body |
| `bodyHtml` | string | Yes | HTML version of the email body |
| `replyTo` | string | No | Reply-to email address |
| `priority` | number | No | Email priority (default: 8) |
| `maxRetries` | number | No | Maximum retry attempts (default: 5) |
| `metadata` | object | No | Custom metadata for tracking |

## Usage

### Current Implementation

The email service is currently integrated for:

1. **Password Reset Emails** - Sent when users request a password reset via `/auth/forgot-password`

### Code Example: Password Reset Email

The `emailService.sendPasswordResetEmail()` method is called from the auth service:

```typescript
await emailService.sendPasswordResetEmail(
  userRecord.email,
  userRecord.firstName,
  resetLink
);
```

### Adding New Email Types

To send other types of emails, use the generic `sendEmail()` method:

```typescript
import { emailService } from '../services/email.service';

// Example: Send a welcome email
const success = await emailService.sendEmail(
  'user@example.com',
  'Welcome to CMP Portal',
  'Welcome! This is the plain text version.',
  '<h1>Welcome!</h1><p>This is the HTML version.</p>',
  {
    priority: 8,
    metadata: {
      emailType: 'welcome',
      source: 'user-registration',
    },
  }
);

if (success) {
  console.log('Email sent successfully');
} else {
  console.log('Email failed to send');
}
```

## Features

### Security

- **API Key Authentication**: All requests are authenticated using the `EMAIL_API_KEY`
- **No Data Leakage**: Email sending errors are logged internally but not exposed to users
- **Email Enumeration Protection**: Password reset always returns success to prevent user enumeration

### Error Handling

- Automatic retry mechanism (configurable via `maxRetries`)
- Comprehensive logging for debugging
- Graceful degradation when email service is unavailable

### Monitoring

All email operations are logged with the following information:
- Recipient email address
- Email type (metadata)
- Success/failure status
- Error messages (if any)

## Testing

### Development Mode

When `EMAIL_API_KEY` or `EMAIL_API_ENDPOINT` is not configured, the service will:
1. Log a warning message
2. Skip email sending
3. Return `false` to indicate failure
4. Continue operation without throwing errors

### Testing Email Functionality

1. Configure the environment variables with your API key
2. Use the forgot password feature to trigger a test email
3. Check the server logs for email sending status
4. Verify email delivery in the recipient inbox

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**: Ensure all required variables are set correctly
2. **Verify API Key**: Confirm the `EMAIL_API_KEY` is valid and has proper permissions
3. **Check Logs**: Look for error messages in the application logs
4. **Network Issues**: Verify the server can reach the AWS SES endpoint

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "EMAIL_API_KEY or EMAIL_API_ENDPOINT not configured" | Missing environment variables | Add required variables to `.env` |
| "AWS SES API returned unexpected status" | API error or invalid payload | Check API credentials and payload format |
| "Failed to send password reset email" | Network or API issue | Check logs for detailed error message |

## Migration from Resend

This service replaces the previous Resend integration. The following changes were made:

1. **Removed Dependencies**: `resend` npm package uninstalled
2. **Added Dependencies**: `axios` installed for HTTP requests
3. **Environment Variables**: Updated from `RESEND_API_KEY` to AWS SES configuration
4. **Service Implementation**: Rewritten to use AWS SES API endpoint

No changes are required to calling code - the `emailService` interface remains the same.

## Support

For issues with the AWS SES service or API key access, contact your organization's DevOps or infrastructure team.
