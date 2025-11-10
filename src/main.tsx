import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DocsPage } from '@/pages/DocsPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChangelogPage } from '@/pages/ChangelogPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/docs/home" replace />,
  },
  {
    path: "/docs",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "changelog",
        element: <ChangelogPage />,
      },
      {
        path: "*",
        element: <DocsPage />,
      },
    ],
  },
  {
    path: "/admin",
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "login",
        element: <AdminLoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "",
            element: <Navigate to="/admin/dashboard" replace />,
          }
        ]
      }
    ]
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)