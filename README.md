# Browser Extensions Manager

A responsive browser extension manager built with Next.js, TypeScript, HeroUI,
Tailwind CSS, Zustand, and TanStack Query.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Features

- Loads extension records from the extensions API.
- Filters extensions by active and inactive status.
- Updates an extension's status and removes extensions through the API.
- Persists the selected filter and light/dark theme in local storage.
- Responsive layouts, keyboard focus styles, loading states, and API error
  feedback.

## API

The app uses `https://api-backend-test-0qvm.onrender.com/api/v1/extensions`
for listing, updating, and deleting extensions. See the API's

## Validation

```bash
npm run typecheck
npm run build
```
