# Vercel Deployment Instructions

To deploy this application to Vercel with the correct Firebase configuration, please follow these steps:

## 1. Environment Variables

Add the following environment variables in your Vercel Project Dashboard (**Settings > Environment Variables**):

| Variable Name | Value |
|---------------|-------|
| `VITE_FIREBASE_API_KEY` | Set from your private Vercel project environment settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Set from your Firebase project configuration |
| `VITE_FIREBASE_PROJECT_ID` | Set from your Firebase project configuration |
| `VITE_FIREBASE_STORAGE_BUCKET` | Set from your Firebase project configuration |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Set from your Firebase project configuration |
| `VITE_FIREBASE_APP_ID` | Set from your Firebase project configuration |
| `VITE_SITE_URL` | `https://manhaji-salaf.vercel.app` |

## 2. Security Reminder

As requested, the `.env` file has been used for local development but is included in `.gitignore` to prevent it from being pushed to the repository. 

**Important:** Before your final production deployment, ensure you have deleted any local `.env` files if you are deploying manually, though Vercel handles this automatically when deploying from GitHub.

## 3. Firebase Configuration

The application is now configured to use these variables via `import.meta.env`. The authentication logic (Email/Password and Google Sign-in) is fully implemented in:
- `src/lib/firebase.ts` (Initialization)
- `src/hooks/useAuth.ts` (Auth Logic)
- `src/components/auth/AuthModal.tsx` (UI Integration)
- `src/views/ProfileView.tsx` (User Profile & Logout)

## 4. Google Sign-in Requirements

Ensure that `manhaji-salaf.vercel.app` is added to the **Authorized domains** in your Firebase Console (**Authentication > Settings > Authorized domains**). After purchasing and connecting `salaf.com`, add `salaf.com` there as well.

## 5. SEO domain migration

The current canonical domain is `https://manhaji-salaf.vercel.app`. The application reserves `https://salaf.com` as the future domain. After `salaf.com` is purchased, connected to Vercel, and verified, set `VITE_SITE_URL=https://salaf.com` in Vercel and redeploy. Then verify canonical tags, Open Graph URLs, JSON-LD, `robots.txt`, `sitemap.xml`, redirects, and Search Console ownership before treating `salaf.com` as canonical.
