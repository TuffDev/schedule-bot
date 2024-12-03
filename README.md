This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

First, create a `.env.local` file in your root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
NOTIFICATION_PHONE_NUMBER=recipient_phone_number
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Using Docker

To run the application using Docker:

1. Build the Docker image:

```bash
docker build -t ai-scheduler .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env.local ai-scheduler
```

For development with hot-reload:

```bash
docker compose up
```

To stop the container:

```bash
docker compose down
```

## Features

- Interactive AI Schedule Management
- Natural language event scheduling
- SMS notifications via Twilio integration
- Auto-test functionality for development

### Using the Auto-Test Feature

The application includes an auto-test feature for development purposes. **Important:** Remember to terminate the auto-test when finished to prevent continuous scheduling attempts.

### Starter Prompts

The application comes with pre-configured starter prompts to help you interact with the scheduling AI.

### Caveat

The app is currently set to UTC
