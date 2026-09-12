# Security Checklist — Biorona Supabase Admin

## Scope
- RLS products
- RLS product_images
- Storage policies
- Admin authentication
- Protected admin routes
- Unauthorized mutation
- Public read permissions
- Environment variables
- Exposed secrets
- Service role usage
- Upload validation

## Security status
Status: PASS with conditions

The implementation currently enforces the intended access model:
- public read only for allowed product data
- public cannot insert/update/delete product rows or image metadata
- only authenticated admin users can mutate protected tables
- service role key is not in a NEXT_PUBLIC_* variable
- image upload/delete is restricted to authenticated admin users
- UI hiding is not the security boundary; the real enforcement is Supabase RLS and storage policies

## 1) RLS products
Required rule:
- public can read only active products
- non-admin users cannot insert/update/delete

Current pattern in migration:
- `public.products` has RLS enabled
- `select` policy allows read for active products and admin users
- `insert/update/delete` require `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'`

This is acceptable and matches the requirement.

## 2) RLS product_images
Required rule:
- public may read only product images belonging to active products
- public cannot mutate image rows

Current pattern:
- `public.product_images` is protected by RLS
- `select` policy checks the parent product is active or the user is admin
- `insert/update/delete` require admin role

This is acceptable and matches the requirement.

## 3) Storage policies
Required rule:
- public read of product images is okay for public product catalog
- upload/delete must be admin-only

Current pattern:
- bucket `product-images` is public for read access
- only authenticated admin users can upload, update, or delete objects
- access is enforced by `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'`

This is acceptable.

## 4) Admin authentication
Required rule:
- admin status must come from Supabase Auth metadata, not UI state
- customer cannot self-escalate to admin role

Current pattern:
- admin check is based on `user.app_metadata.role === "admin"`
- the admin guard checks fresh user/session data before allowing access
- session refresh is attempted when role may be stale

This matches the intended architecture and does not create a new auth system.

## 5) Protected admin routes
Required rule:
- admin route must reject unauthenticated and non-admin users

Current pattern:
- `AdminGuard` checks session and user role before rendering protected admin UI
- login page rejects non-admin users and signs them out immediately

This is acceptable.

## 6) Unauthorized mutation
Required rule:
- public users cannot write to products or images
- client-side UI must not be treated as security

Current pattern:
- all write operations are guarded by RLS
- `authenticated` users without admin role cannot pass policy checks

This is acceptable.

## 7) Public read permissions
Required rule:
- public may only read allowed product data

Current pattern:
- `public.products` select policy only allows active products to public readers
- `public.product_images` select policy only allows images tied to active products

This is acceptable.

## 8) Environment variables
Required rule:
- public variables must use `NEXT_PUBLIC_*`
- secret values must not be exposed to the client bundle

Current pattern:
- frontend uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- service-role key stays in `SUPABASE_SERVICE_ROLE_KEY` and is used only in local seed tools
- there is no `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` in this project

This is acceptable.

## 9) Exposed secrets
Required rule:
- no secret value should be committed or exposed in frontend bundle

Current project status:
- `SUPABASE_SERVICE_ROLE_KEY` is not exposed in `NEXT_PUBLIC_*` variables
- it is used only by the local seed script
- no client-side use of service role key is present

This is acceptable.

## 10) Service role usage
Required rule:
- do not use service role in browser code

Current project status:
- service role key is not imported into React components or frontend code
- it remains in script-only local workflow

This is acceptable.

## 11) Upload validation
Required rule:
- uploads must be validated for MIME and file size

Current pattern:
- admin upload validation checks file MIME against allowed set:
  - image/jpeg
  - image/png
  - image/webp
  - image/avif
- file size limit is enforced at 5MB in admin UI
- SQL/storage bucket also restricts allowed mime types

This is acceptable as a defense-in-depth measure.

## Risks / final notes
- Security policy is centered on Supabase RLS and storage policies, which is the correct enforcement point.
- UI validation is not the primary security mechanism; the data protection is in Supabase.
- The app should continue to rely on authenticated admin sessions and not on hidden UI controls.
- The key operational requirement is: after changing a user role in Supabase Auth, force a sign-out and sign-in so the JWT/session refreshes.

## Verification checklist
- [x] public read access limited to active catalog
- [x] public cannot insert/update/delete products
- [x] public cannot insert/update/delete product images
- [x] admin writes require authenticated admin role
- [x] service role key is not exposed in browser bundle
- [x] no NEXT_PUBLIC_ service role variable present
- [x] image uploads are MIME and size validated
- [x] admin route gate exists and validates session/user
- [x] no customer-facing auth flow bypasses admin checks
