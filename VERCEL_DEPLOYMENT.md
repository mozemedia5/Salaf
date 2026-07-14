# Vercel Deployment Instructions

To deploy this application to Vercel with the correct Firebase configuration, please follow these steps:

## 1. Environment Variables

Add the following environment variables in your Vercel Project Dashboard (**Settings > Environment Variables**):

| Variable Name | Value |
|---------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyDgg6vkE5QueU7Y2aa0i01ZzS7bJKe1_mk` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `manhaji-salaf.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `manhaji-salaf` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `manhaji-salaf.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `46470231862` |
| `VITE_FIREBASE_APP_ID` | `1:46470231862:web:7d4c8305774ca846092597` |

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

Ensure that your Vercel deployment URL (e.g., `https://your-app.vercel.app`) is added to the **Authorized domains** in your Firebase Console (**Authentication > Settings > Authorized domains**).
