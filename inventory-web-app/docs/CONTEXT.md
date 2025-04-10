# Inventory Management Web App Documentation

## Overview

A minimalist, AI-powered web application that helps users keep track of their items across multiple personal locations (e.g., garage, house, backpack, car). The **first version** focuses only on delivering **core value** with the **simplest features necessary** to help users start organizing and finding their items efficiently.

---

## Tech Stack

> While not all technologies will be implemented in this first beat, this is the reference stack for scalability:

- **Frontend**: Next.js + TypeScript
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Clerk (or Supabase Auth in early stages)
- **Styling**: Tailwind CSS
- **Emails**: Resend (for onboarding or verification)
- **Payments**: Stripe (future plan)
- **Deployment**: AWS Amplify
- **Analytics**: PostHog
- **Live Chat**: Crisp
- **AI Processing**: DeepSeek (for NLP and image classification)

---

## First Beat – Core Features

### ✅ Authentication
- Email-based sign-up and login
- Simple onboarding to access dashboard
- Managed via Clerk or Supabase Auth

---

### ✅ Main Dashboard
- **Global Search Bar**  
  - Search across all items and inventories
  - AI-assisted keyword support (via DeepSeek)

- **Inventory Cards**  
  - Display user-created inventory locations (e.g., "Garage", "Backpack")
  - Show inventory name and item count
  - Sorted by most recently used

- **Quick Add Buttons**  
  - Add new inventory
  - Add new item to inventory

---

### ✅ Inventory Management
- Create/edit/delete custom inventories
- Basic info: name and icon
- Associate multiple items to a location

---

### ✅ Item Management
- Add/edit/delete items within inventories
- Item properties:
  - Name
  - Optional description
  - Optional photo upload
- Items associated with one inventory

---

### ✅ AI Capabilities (Minimal First Beat)
- **Text-based item addition** via chat-style interface
  - e.g., "Add camping gear to Backpack"
- **Basic AI categorization** suggestions on item creation

---

## Planned Features (Beyond First Beat)
- Photo upload with AI auto-categorization
- Natural language search
- Barcode scanning
- Voice input
- Multi-user collaboration
- Stripe-powered paid plans
- Cloud sync across multiple sessions/devices

---

## Database Schema

### `users` table
- `id`: uuid (PK)
- `email`: string
- `created_at`: timestamp

### `inventories` table
- `id`: uuid (PK)
- `user_id`: uuid (FK → users.id)
- `name`: string
- `icon`: string
- `created_at`: timestamp
- `last_accessed`: timestamp
- `item_count`: integer

### `items` table
- `id`: uuid (PK)
- `inventory_id`: uuid (FK → inventories.id)
- `name`: string
- `description`: text (optional)
- `created_at`: timestamp
- `last_accessed`: timestamp
- `metadata`: jsonb (for AI-related tags, future use)

---

## Folder Structure

```bash
inventory-web-app/
├── app/                      # Next.js app directory
│   ├── auth/                 # Auth routes (login, register)
│   ├── dashboard/            # Main app dashboard
│   ├── inventories/          # Inventories routes
│   │   ├── [id]/             # Single inventory view
│   │   └── new.tsx           # Add inventory page
│   ├── items/                # Items routes
│   │   ├── [id]/             # Item detail/edit page
│   │   └── new.tsx           # Add item form
│   └── layout.tsx            # Global layout
├── components/               # Reusable components
│   ├── ui/                   # UI elements (cards, buttons, forms)
│   ├── inventory/            # Inventory-specific components
│   └── items/                # Item-specific components
├── lib/                      # Utility functions and helpers
│   ├── supabase/             # Supabase client and DB utils
│   ├── auth/                 # Clerk/Supabase auth functions
│   └── ai/                   # DeepSeek AI helpers (for future)
├── types/                    # Global TypeScript types
├── public/                   # Static assets (icons, images)
├── styles/                   # Tailwind config and globals
├── config/                   # App-wide configuration (e.g., constants)
└── docs/                     # Internal documentation
``` 