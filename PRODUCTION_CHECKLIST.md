# Production Checklist

## Build and type safety
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] no `any` or `@ts-ignore` introduced for production work

## Environment
- [ ] `.env.local` contains real values only for local environment
- [ ] no `NEXT_PUBLIC_` service role key exists
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set to production project URL
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the publishable key only
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept local/off-client only
- [ ] no localhost or demo URL remains in production config

## Supabase
- [ ] Auth user role is set via `app_metadata.role = "admin"`
- [ ] admin sign-out and sign-in refreshes stale session/JWT
- [ ] `products` RLS allows public read of active products only
- [ ] `product_images` RLS allows public read only when parent product is active
- [ ] only authenticated admin can insert/update/delete product rows
- [ ] only authenticated admin can insert/update/delete product image rows
- [ ] bucket `product-images` is public for read, restricted for write to admin

## Product flow
- [ ] homepage uses Supabase-backed product catalog
- [ ] catalog and filters use active product rows only
- [ ] unavailable products still show status correctly without checkout flow
- [ ] deleted/invalid slug routes return not found
- [ ] missing image falls back safely
- [ ] WhatsApp order uses product data from Supabase product record

## SEO
- [ ] unique titles/meta per product
- [ ] canonical URLs are correct
- [ ] OpenGraph and Twitter metadata are present
- [ ] sitemap includes live catalog URLs
- [ ] robots file allows indexing of public pages
- [ ] Product JSON-LD uses real product fields
- [ ] LocalBusiness/Florist schema uses real business identity only
- [ ] alt text is meaningful and not empty

## UX and performance
- [ ] responsive on mobile 360–1440px
- [ ] sticky WhatsApp CTA works without overlap
- [ ] no critical layout overflow
- [ ] safe-area mobile spacing checked
- [ ] reduced-motion respected
- [ ] images are optimized and fallback-safe

## Admin
- [ ] login/logout works
- [ ] session validation checks fresh user role
- [ ] product create/edit/delete works for admin
- [ ] image upload/delete works for admin
- [ ] thumbnail selection works
- [ ] unauthorized user is redirected away from admin pages

## Placeholder and fake data
- [ ] no demo URL, sample phone, or placeholder address remains in production config
- [ ] testimonial content is real and approved before publication
- [ ] no fake business listing data is used

## Deployment
- [ ] production env variables are configured in hosting provider
- [ ] Supabase URL and publishable key are configured in production
- [ ] admin user role is verified in Supabase Auth
- [ ] final smoke test is performed in production deployment
