# Verify Dummy Ticket

Verify Dummy Ticket is an open-source web application built to support travel booking verification and customer request workflows.

The project is designed for travel agencies, travel consultants, and users who need a simple way to manage travel-related verification requests, booking support, and customer communication in a structured digital system.

## Overview

Many travel businesses still handle booking support, verification requests, and customer inquiries manually through WhatsApp, email, or scattered documents. Verify Dummy Ticket provides a cleaner and more organized platform for managing these workflows.

The goal of this project is to make travel verification and booking-support processes easier, faster, and more transparent for both service providers and customers.

## Features

* Travel booking verification workflow
* Customer request management
* User-friendly web interface
* Admin-focused workflow structure
* Supabase integration
* Responsive design for desktop and mobile
* Environment-based configuration
* Secure project structure
* Ready for deployment on Vercel

## Tech Stack

This project is built with:

* Next.js
* TypeScript
* Tailwind CSS
* Supabase
* Vercel

## Getting Started

Follow the steps below to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/netspotmedia/Verify-Dummy-Ticket.git
cd Verify-Dummy-Ticket
```

### 2. Install dependencies

```bash
npm install
```

You can also use:

```bash
yarn install
```

or

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory.

If an `.env.example` file is available, use it as a guide:

```bash
cp .env.example .env.local
```

Add the required environment variables for Supabase and any other services used by the project.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit your `.env.local` file or private API keys to GitHub.

### 4. Run the development server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

in your browser.

## Project Structure

```text
Verify-Dummy-Ticket/
├── app/
├── components/
├── lib/
├── public/
├── supabase/
├── docs/
├── package.json
└── README.md
```

## Deployment

This project can be deployed on Vercel.

Basic deployment steps:

1. Push the project to GitHub
2. Connect the repository to Vercel
3. Add the required environment variables
4. Deploy the project

## Security

Please do not commit private keys, passwords, API secrets, Supabase service role keys, or `.env` files to this repository.

If you discover a security issue, please check the `SECURITY.md` file for responsible disclosure guidance.

## Roadmap

Planned improvements include:

* Improved admin dashboard
* Better verification status tracking
* Email notification workflow
* Customer request history
* Better documentation
* Public release versioning
* More test coverage
* Contributor guide

## Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Open a pull request

Please make sure your code is clean, readable, and does not include private credentials.

## License

This project is intended to be open-source. A license file should be added to clearly define how others may use, modify, and contribute to the project.

Recommended license: MIT License.

## Maintainer

Maintained by Netspot Media.

GitHub: [netspotmedia](https://github.com/netspotmedia)
