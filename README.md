# Order Entry

A front-end for employees to record customer orders against your Supabase database.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Supabase**

   Copy `.env.example` to `.env` and add your project credentials from the [Supabase dashboard](https://supabase.com/dashboard) → Project Settings → API:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database permissions**

   Your `.env` is fine — the issue is that the `orders` table does not allow the `anon` role to read or write.

   Open **Supabase Dashboard → SQL Editor**, paste the contents of `supabase/setup.sql`, and run it.

   This grants `SELECT`/`INSERT` on `products`, `customers`, and `orders`, and adds the required RLS policies.

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open http://localhost:5173

## Features

- **Employee name** — saved in the browser for the next visit
- **Customer lookup** — search by name, email, or phone; create new customers inline
- **Product selection** — dropdown from your `products` table
- **Sale type** — Campus or FM (maps to `sale_type`)
- **Order type** — Premade or Custom; custom orders require a design number
- **Live price** — shows the matching price from the product row
- **Recent orders** — last 10 orders with product, customer, and employee

## Schema mapping

| Form field   | Database column        |
|-------------|------------------------|
| Employee    | `orders.employee`      |
| Customer    | `orders.customer_id`   |
| Product     | `orders.product_id`    |
| Campus / FM   | `orders.sale_type`     |
| Premade/Custom | `orders.custom`     |
| Design #    | `orders.design`        |

## Build for production

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, etc.).
