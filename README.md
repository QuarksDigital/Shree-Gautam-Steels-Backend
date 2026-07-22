# Shree Gautam Enterprises — Backend API

REST API (Node + Express + TypeScript) that serves the product catalogue for the
Shree Gautam Enterprises website.

## Stack

- **Express 4** — HTTP server & routing
- **TypeScript** — strict, path-aliased (`@/*` → `src/*`)
- **helmet / cors / morgan** — security, cross-origin, request logging

## Structure

```
src/
├── server.ts              # entry point — boots the HTTP server
├── app.ts                 # express app: middleware + route mounting
├── config/
│   └── env.ts             # typed environment config
├── routes/
│   ├── index.ts           # CENTRAL router — imports every feature router
│   ├── health.routes.ts
│   └── product.routes.ts
├── controllers/
│   └── product.controller.ts
├── services/
│   └── product.service.ts # data-access layer (swap for a DB later)
├── data/
│   └── products.ts        # seed catalogue
├── middlewares/
│   ├── notFound.ts
│   └── errorHandler.ts
├── utils/
│   ├── ApiError.ts
│   └── logger.ts
└── types/
    └── product.ts
```

The **central router** (`src/routes/index.ts`) imports all feature routers and is
mounted once in `app.ts` under `API_PREFIX` (default `/api`).

## Getting started

```bash
cp .env.example .env      # adjust if needed
npm install
npm run dev               # http://localhost:4000
```

Build & run for production:

```bash
npm run build
npm start
```

## Endpoints

| Method | Path                       | Description                          |
| ------ | -------------------------- | ------------------------------------ |
| GET    | `/`                        | Service liveness                     |
| GET    | `/api/health`              | Health check                         |
| GET    | `/api/products`            | List products (`?category=&featured=&search=`) |
| GET    | `/api/products/categories` | Distinct categories                  |
| GET    | `/api/products/:slug`      | Single product by slug               |

Response envelope: `{ success, count?, data }`.
