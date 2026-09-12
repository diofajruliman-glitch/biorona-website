# Deployment Guide

## 1. Required environment variables
Create the production environment with these values only:

- NEXT_PUBLIC_WHATSAPP_NUMBER
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_INSTAGRAM_URL
- NEXT_PUBLIC_GOOGLE_MAPS_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Do not set any of these as service-role values:
- NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_SERVICE_ROLE_KEY in the frontend bundle

Keep service role key only in local seed scripts or secure server-side deployment secrets.

## 2. Supabase setup
- Set admin user role in Auth via app_metadata.role = "admin"
- Re-login after role change so JWT/session refreshes
- Keep RLS enabled on products and product_images
- Keep storage bucket product-images public for read and restricted for write

## 3. Production deployment checks
- Confirm project URL and Supabase publishable key match production project
- Confirm admin login works with valid admin metadata
- Confirm catalog reads only active products
- Confirm unavailable products remain visible with correct status
- Confirm missing image fallback is working
- Confirm product detail and sitemap generate valid public URLs

## 4. Post-deploy smoke test
- Home page loads
- Catalog renders active products only
- Search and category filter work
- Detail page loads for valid slug
- Invalid slug shows not found
- WhatsApp CTA uses correct number and product details
- Admin dashboard loads only for admin users
- Product create/edit/delete works for admin
- Product image upload/delete works for admin

## 5. Production-ready guardrails
- Never store service role keys in client environment variables
- Never disable RLS to “fix” admin access
- Never treat hidden UI as security
- Use real data only, not placeholder business info
