# Codex: The Cockpit Design System Platform

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/legionsa/codex-cockpit-design-system-platform)

Codex is a sophisticated, public-facing documentation platform designed to be the single source of truth for the Cockpit Design System (CDS). It merges design principles, UI component documentation, and code examples into a cohesive, living ecosystem. The platform features a minimalist, reader-focused public site and a powerful, secure admin dashboard. The public site provides a hierarchical navigation structure, automatic breadcrumbs, and a lightning-fast search experience. The admin dashboard empowers contributors with a block-based visual editor (Editor.js) to create, organize, and manage content seamlessly. The entire application is built on a high-performance, serverless architecture using Cloudflare Workers and Durable Objects for persistent storage, ensuring scalability and speed.

## ✨ Key Features

-   **📚 Public Documentation Site:** A clean, readable, three-column layout for browsing documentation.
-   **🔐 Secure Admin Dashboard:** An authenticated interface for content management with a powerful block-based editor.
-   **ιε Hierarchical Structure:** Organize content in a parent-child hierarchy with automatic breadcrumbs and navigation.
-   **✍️ Block-Based Editor:** Powered by Editor.js for a modern, intuitive content creation experience.
-   **⚡️ High-Performance Backend:** Built on Hono for a fast, serverless API running on Cloudflare Workers.
-   **💾 Persistent Storage:** Utilizes a single Cloudflare Durable Object for scalable, consistent data storage.
-   **🎨 Modern UI:** Crafted with Tailwind CSS and shadcn/ui for a beautiful, responsive, and accessible user experience.

## 🛠️ Technology Stack

-   **Framework:** Vite
-   **Frontend:** React, TypeScript, React Router
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Styling:** Tailwind CSS, shadcn/ui
-   **State Management:** Zustand
-   **Icons:** Lucide React
-   **Animation:** Framer Motion

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later)
-   Bun
-   Git
-   A Cloudflare account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/codex-design-system-docs.git
    cd codex-design-system-docs
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```bash
    bun install
    ```

3.  **Cloudflare Wrangler Login:**
    Authenticate with your Cloudflare account.
    ```bash
    bunx wrangler login
    ```

### Running the Development Server

To start the local development server, which includes the Vite frontend and the Wrangler dev server for the worker, run:

```bash
bun dev
```

This will start the application, typically on `http://localhost:3000`.

## 📜 Available Scripts

-   `bun dev`: Starts the development server with live reloading.
-   `bun build`: Builds the frontend application for production.
-   `bun lint`: Lints the codebase using ESLint.
-   `bun deploy`: Deploys the application to your Cloudflare account.

## 📁 Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Cloudflare Worker code, built with Hono. This is where API routes and Durable Object logic reside.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.

## ☁️ Deployment

This project is designed for seamless deployment to Cloudflare.

1.  **Login to Wrangler:**
    If you haven't already, authenticate with your Cloudflare account:
    ```bash
    bunx wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script to build and publish your application to Cloudflare Workers.
    ```bash
    bun deploy
    ```

Alternatively, you can deploy your own version of this project with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/legionsa/codex-cockpit-design-system-platform)

## ⚖️ License

This project is licensed under the MIT License. See the `LICENSE` file for details.