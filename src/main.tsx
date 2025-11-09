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
        path: "*",
        element: <DocsPage />,
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)