# thennai storefront

Landing page, shop, cart, checkout (Razorpay + Cash on Delivery), order confirmation,
first-party product analytics and an admin for products, orders and engagement.

- **Frontend:** React 19, React Router 7, Tailwind CSS 4, Vite
- **API:** Express 5 (`server/`), mounted at `/api` by both the Vite dev server and the production server
- **Database, auth, image storage:** Supabase (free tier)
- **Payments:** Razorpay Standard Checkout (UPI, RuPay, cards, NetBanking, wallets) + optional COD
- **Validation:** zod schemas in `src/lib/schemas.ts`, shared by the browser and the server

## Run it

```bash
npm install
cp .env.example .env     # fill in as you go; everything below is optional for a first look
npm run dev              # http://localhost:5173 (site + API)
```

Without any keys the shop still works: products come from the bundled launch catalogue,
orders are written to `server/.data/orders.json`, and only Cash on Delivery is offered.

Production:

```bash
npm run build            # VITE_* variables must be set at build time
npm start                # serves dist/ and /api on PORT (default 8787)
```

## 1. Supabase (database, admin login, analytics)

1. Create a project at <https://supabase.com> (free tier is enough).
2. In **SQL Editor**, run `supabase/migrations/0001_storefront.sql`, then `supabase/seed.sql`.
3. **Project Settings → API**: copy the URL, the `anon` key and the `service_role` key into `.env`:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   The service-role key is secret: it is only read by the server, never bundled into the site.
4. **Authentication → Users → Add user**: create your admin login (email + password).
5. Grant it admin rights in the SQL editor:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
6. Restart `npm run dev` and sign in at `/admin`.

Row-level security does the access control: the public can read active products only; admins
(rows in `admins`) can edit products, upload images and read orders and analytics. Orders and
analytics events are written only by the server.

## 2. Razorpay (online payments)

1. Sign up at <https://dashboard.razorpay.com> and switch to **Test Mode**.
2. **Settings → API Keys → Generate**: put them in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. **Settings → Webhooks → Add**: URL `https://<your-domain>/api/webhooks/razorpay`, events
   `payment.captured`, `payment.failed`, `order.paid`; put the secret you choose in `RAZORPAY_WEBHOOK_SECRET`.
4. Test with Razorpay's test UPI ID `success@razorpay` or their test cards. Switch to live keys after KYC.

How a payment is trusted: the server prices the cart from the database (never from the browser),
creates a Razorpay order for that amount, and marks the order paid only after verifying Razorpay's
HMAC signature, either from the checkout callback (`/api/checkout/verify`) or the webhook. Both paths are
idempotent, so a payment is recorded once even if both arrive.

`ENABLE_COD=false` hides Cash on Delivery.

## Analytics

The storefront sends `product_view`, `product_click`, `add_to_cart` and `begin_checkout` events to
`/api/events` (batched, no cookies, no personal data; an anonymous per-tab session id only).
`purchase` events are recorded by the server when payment is confirmed. The admin's **Engagement**
page shows views → clicks → cart → checkout → orders and revenue per product for 7 / 30 / 90 days.

## Admin

`/admin`: **Engagement** (analytics), **Products** (create, edit, hide/show, delete, upload images,
variants, pricing), **Orders** (filter, view address and items, update status to shipped / delivered / cancelled).
Storefront changes appear within about 30 seconds (the product list is cached briefly).

## Where things live

| Path | What |
|---|---|
| `src/pages/` | Home, Shop, Product, Cart, Checkout, Order, 404 |
| `src/admin/` | Admin app (lazy-loaded; shoppers never download it) |
| `src/lib/schemas.ts` | All zod validation (checkout, products, analytics) |
| `src/lib/pricing.ts` | Order pricing used by cart and server |
| `server/api.ts` | API routes |
| `server/db.ts` | Supabase access, with local fallback |
| `supabase/` | Schema, RLS policies, analytics functions, seed data |

## Before going live

- Replace the placeholder testimonials and press logos on the landing page with real ones.
- Product photos and the scroll video still show the old brand name on the packaging.
- Add your terms, privacy, shipping and refund policy pages (Razorpay requires these for live mode).
- The rate limiter is in-memory (one server instance). Use a shared store if you run several.
