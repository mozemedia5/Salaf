# Salaf - Noor Platform

Salaf is a sophisticated, modern web application built on the **Noor Platform**, designed to provide a seamless experience for accessing Islamic content, including articles, audio lectures, videos, and donation campaigns. Built with **React 19**, **TypeScript**, and **Vite**, it leverages a glassmorphism design language and smooth animations to deliver a "pretty cool" and spiritually uplifting user interface.

## ✨ Features

-   **📱 Progressive Web App (PWA):** Installable on Android, iOS, and Desktop for an app-like experience.
-   **🎨 Modern UI/UX:** Glassmorphism design with backdrop blurs, smooth Framer Motion animations, and a responsive layout.
-   **🎧 Integrated Audio Player:** Persistent mini-player and full-screen player with speed control and progress tracking.
-   **📺 Video Integration:** Seamless YouTube iframe embedding for lectures and reminders.
-   **📖 Article Reader:** Clean, readable interface for long-form Islamic content.
-   **🤝 Donation Campaigns:** Track progress and contribute to various noble causes with beautiful visual feedback.
-   **🔍 Advanced Search:** Fast, filtered search across all content types.
-   **🔔 Real-time Notifications:** Stay updated with new content and campaign progress.

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 3, shadcn/ui, Framer Motion |
| **State Management** | Zustand, TanStack Query (React Query) |
| **Backend/Services** | Firebase (Auth, Firestore, Storage) |
| **Form Handling** | React Hook Form, Zod |
| **Routing** | React Router 7 |

## 🛠️ Getting Started

### Prerequisites

-   Node.js (Latest LTS recommended)
-   pnpm or npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[your-username]/Salaf.git
    cd Salaf
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    # or
    npm run dev
    ```

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components (shadcn + custom)
│   ├── audio/        # Audio player components
│   ├── auth/         # Authentication screens
│   ├── cards/        # Content cards (Article, Audio, Video, etc.)
│   ├── layout/       # AppShell, Header, BottomNav
│   └── ui-custom/    # Glassmorphism and specialized UI elements
├── hooks/            # Custom React hooks
├── lib/              # Utilities and data fetching logic
├── pages/            # Main entry pages
├── stores/           # Zustand state stores
├── types/            # TypeScript interfaces
└── views/            # Content-specific view components
```

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the Ummah.
