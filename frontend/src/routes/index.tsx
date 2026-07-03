import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AppShell from "../components/layout/AppShell";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ManagerRoute from "./ManagerRoute";
import { PageLoader } from "../design/components/Loading";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OTPVerification from "../pages/OTPVerification";
import ResetPassword from "../pages/ResetPassword";
import ChangePassword from "../pages/ChangePassword";
import TeamChat from "../pages/TeamChat";
import AIAssistant from "../pages/AIAssistant";
import MeetingSummaries from "../pages/MeetingSummaries";
import KnowledgeBase from "../pages/KnowledgeBase";
import Tasks from "../pages/Tasks";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminUsers from "../pages/AdminUsers";
import AuditLogs from "../pages/AuditLogs";
import Profile from "../pages/Profile";
import Meetings from "../pages/Meetings";

const Dashboard = lazy(() => import("../pages/Dashboard"));

function DashboardRoute() {
  return (
    <Suspense fallback={<PageLoader message="Loading command center..." />}>
      <Dashboard />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/verify-otp",
    element: <OTPVerification />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRoute />,
      },
    ],
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <TeamChat />,
      },
    ],
  },
  {
    path: "/ai",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AIAssistant />,
      },
    ],
  },
  {
    path: "/meetings",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Meetings />,
      },
    ],
  },
  {
    path: "/summaries",
    element: (
      <ProtectedRoute>
        <ManagerRoute>
          <AppShell />
        </ManagerRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MeetingSummaries />,
      },
    ],
  },
  {
    path: "/knowledge",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <KnowledgeBase />,
      },
    ],
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Tasks />,
      },
    ],
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <ManagerRoute>
          <AppShell />
        </ManagerRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminAnalytics />,
      },
    ],
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AppShell />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminUsers />,
      },
    ],
  },
  {
    path: "/admin/audit-logs",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AppShell />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AuditLogs />,
      },
    ],
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
  },
]);
