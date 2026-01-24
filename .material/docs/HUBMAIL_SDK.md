# HubMail SDK

A TypeScript-friendly SDK for sending emails via the HubMail API.

## Installation

```bash
bun add hubmail
# or
npm install hubmail
```

## Quick Start

### 1. Set up your API key

The SDK will automatically look for `HUBMAIL_KEY` in your environment variables.

```bash
# .env
HUBMAIL_KEY=hm_your_api_key_here
```

### 2. Initialize the Client

```typescript
import { HubMail } from "hubmail";

// Automatically uses process.env.HUBMAIL_KEY
const hubmail = new HubMail();

// OR pass configuration directly
const hubmailCustom = new HubMail({
  apiKey: "hm_custom_key",
});
```

## API Reference

### TypeScript Support

The SDK is fully typed. You can import interfaces for your own use:

```typescript
import { HubMail, type SendEmailOptions, type SendEmailResponse } from "hubmail";

const options: SendEmailOptions = {
  from: "sender@hubmail.space",
  to: "recipient@example.com",
  subject: "Typed Email",
  text: "Hello!"
};
```

### Sending Emails

Send a single email to one or multiple recipients.

```typescript
try {
  const result = await hubmail.send({
    from: "sender@hubmail.space",
    to: ["recipient@example.com"],
    cc: ["manager@example.com"],
    bcc: ["archive@example.com"],
    subject: "Hello from HubMail",
    text: "This is a plain text email.",
    html: "<p>This is an <b>HTML</b> email.</p>",
    // Optional: Use a template
    // templateId: "tmpl_123456",
    // variables: { name: "Alice", orderId: "123" }
  });

  console.log("Email sent! ID:", result.id);
} catch (error) {
  console.error("Failed to send email:", error);
}
```

### Scheduling Emails

Schedule an email to be sent at a specific time in the future.

```typescript
try {
  const result = await hubmail.schedule({
    scheduledAt: "2026-10-15T09:00:00Z", // Must be at least 5 mins in the future
    templateId: "tmpl_welcome_email",
    to: ["user@example.com"],
    // OR send to an entire mailbook
    // mailbookId: "bk_12345",
    variables: {
      promoCode: "SUMMER2026"
    }
  });

  console.log(`Scheduled ${result.count} emails. IDs:`, result.scheduleIds);
} catch (error) {
  console.error("Failed to schedule email:", error);
}
```

### Managing Mailbooks & Contacts

HubMail allows you to manage contact lists (Mailbooks) and contacts directly.

#### List Mailbooks

Retrieve all mailbooks owned by your account.

```typescript
const mailbooks = await hubmail.listMailbooks();
console.log(mailbooks.data);
// Output: [{ id: "bk_123", name: "Newsletter", createdAt: "..." }, ...]
```

#### List Contacts

Get all contacts within a specific mailbook.

```typescript
const mailbookId = "bk_123456";
const contacts = await hubmail.listContacts(mailbookId);

contacts.data.forEach(contact => {
  console.log(`Email: ${contact.email}, Name: ${contact.firstName}, Status: ${contact.status}`);
});
```

#### Add Contact

Add a new contact to a mailbook or update an existing one.

```typescript
const contact = await hubmail.addContact("bk_123456", {
  email: "newuser@example.com",
  firstName: "John",
  tags: ["api-user", "trial"]
});

console.log("Contact added/updated. Action taken:", contact.action);
```

## Error Handling

The SDK throws a `HubMailError` when API requests fail.

```typescript
import { HubMail, HubMailError } from "hubmail";

try {
  await hubmail.send({ /* ... */ });
} catch (error) {
  if (error instanceof HubMailError) {
    console.error("API Error Status:", error.status);
    console.error("Error Message:", error.message);
    if (error.details) {
      console.error("Validation Details:", error.details);
    }
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Features

- **TypeScript Friendly**: Full type support for all request and response structures.
- **Flexible Recipients**: Support for single or multiple recipients (To, CC, BCC).
- **Templates & Variables**: Support for template-based sending with variable interpolation.
- **Scheduling**: Schedule emails for future delivery.
- **Contact Management**: Manage mailbooks and contacts programmatically.
- **Environment Driven**: Automatic detection of API keys from environment variables.
- **Bun Native**: Built for high performance with Bun and standard Web APIs.
