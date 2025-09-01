
# Adorrable.dev - AI Website Builder

A production-ready Next.js 14 application that generates websites using AI, built with Supabase, Tailwind CSS, and TypeScript.

## Features

- 🤖 AI-powered website generation
- 💳 Payment integration (Paystack & NOWPayments)
- 🔐 User authentication with Supabase
- 💬 Live chat support with Crisp
- 📱 Responsive design with Tailwind CSS
- 🌍 Multi-language support (English, French, Swahili, Pidgin)

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/myndava-lab/adorrable.git
cd adorrable
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com

# Payment Provider Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
WEBHOOK_SECRET=your_webhook_secret

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Crisp Chat Configuration
NEXT_PUBLIC_CRISP_WEBSITE_ID=your_crisp_website_id
```

### 3. Database Setup

Run the Supabase migrations:

```bash
# Apply database migrations
supabase db reset
```

### 4. Development

```bash
npm run dev
```

### 5. Production Build

```bash
npm run build
npm start
```

## Deployment

This app is optimized for deployment on Replit with automatic environment variable management and SSL certificates.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Authentication**: Supabase Auth
- **Payments**: Paystack, NOWPayments
- **AI**: OpenAI GPT
- **Chat**: Crisp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
