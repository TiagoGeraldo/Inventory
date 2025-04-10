# Development Plan – Inventory Web App (First Beat)

## 🛠️ Objective
Deliver a minimal, functional web app that helps users track items across different locations with AI-assisted organization. The first version prioritizes **core utility**, **simple UX**, and **clean architecture** while laying the foundation for future features.

---

## Tech Overview

| Area               | Stack                                  |
|--------------------|----------------------------------------|
| Frontend           | Next.js (App Router) + TypeScript      |
| Styling            | Tailwind CSS                           |
| Database           | Supabase (Postgres)                    |
| Authentication     | Clerk (or Supabase Auth)               |
| AI Services        | DeepSeek (text & image classification) |
| Deployment         | AWS Amplify                            |
| Emails             | Resend                                 |
| Analytics          | PostHog                                |
| Live Chat          | Crisp                                  |
| Payments           | Stripe (future)                        |

---

## Phase 1: Project Setup & Auth (1 week)

### 1.1 Project Initialization
- Set up `Next.js` app with TypeScript and App Router
- Configure Tailwind CSS and base styling
- Define initial folder structure (see below)

### 1.2 Supabase Setup
- Create Supabase project
- Set up database schemas for:
  - `users`
  - `inventories`
  - `items`
- Enable Row-Level Security
- Create initial database seed scripts

### 1.3 Authentication
- Integrate Clerk (preferred) or Supabase Auth
- Implement:
  - Sign up page
  - Login page
  - Session management
- Protect authenticated routes
- Add simple auth UI components

---

## Phase 2: Core Inventory System (1.5 weeks)

### 2.1 Inventory Management
- Inventory list view on dashboard
- "Create Inventory" modal/form
- Basic editing & deletion
- Display name, icon, and item count

### 2.2 Item Management
- View items within an inventory
- Create/edit/delete items
- Optional item description field
- Link each item to an inventory

---

## Phase 3: AI-Assisted UX (1.5 weeks)

### 3.1 AI Integration (Text)
- Set up DeepSeek text processing
- Add chat-style interface to:
  - Add item via natural language
  - Suggest category (basic)

### 3.2 Search (AI + Basic)
- Global search bar (across all items)
- Filter results by inventory
- Include basic AI keyword matching

---

## Phase 4: UI Polish, Testing & Docs (1 week)

### 4.1 UI & UX
- Add empty states, loading states
- Implement basic responsive layout
- Add quick-action buttons (e.g. add inventory, add item)

### 4.2 QA & Testing
- Manual test all user flows
- Write unit tests for services & helpers
- Bug fixes & UX tweaks

### 4.3 Documentation
- Setup README with run instructions
- Environment variable guide
- Developer notes on schema & architecture

---

## Folder Structure

```bash
inventory-web-app/
├── app/                      # Next.js App Router structure
│   ├── auth/                 # Sign in / Sign up
│   ├── dashboard/            # Main dashboard
│   ├── inventories/          # CRUD for inventories
│   ├── items/                # CRUD for items
│   ├── api/                  # API routes (server functions)
│   └── layout.tsx            # Global layout
├── components/               # UI components
│   ├── ui/                   # Buttons, inputs, etc.
│   ├── inventory/            # Inventory UI
│   └── items/                # Item cards, forms
├── lib/                      # Utility functions & services
│   ├── supabase/             # Supabase client setup
│   ├── ai/                   # DeepSeek integration
│   ├── auth/                 # Clerk helpers
│   └── validators/           # Zod schema validators
├── types/                    # Global TypeScript types
├── public/                   # Static files
├── styles/                   # Tailwind config, base styles
├── config/                   # App-wide configs and constants
├── tests/                    # Unit and integration tests
└── docs/                     # Internal docs and setup notes
``` 