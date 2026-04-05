import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import { Footer, ProtectedRoute, PageLoader } from './components/common';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const { LoginPage, RegisterPage } = { LoginPage: lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage }))), RegisterPage: lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage }))) };
const { CreateEventPage, MyBookingsPage } = { CreateEventPage: lazy(() => import('./pages/EventFormPages').then(m => ({ default: m.CreateEventPage }))), MyBookingsPage: lazy(() => import('./pages/EventFormPages').then(m => ({ default: m.MyBookingsPage }))) };

// Simple 404
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl mb-4">🎭</div>
      <h1 className="font-display font-bold text-4xl text-gray-900 mb-2">404 — Page Not Found</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist or has been moved.</p>
      <a href="/" className="btn-primary inline-flex">Go Home</a>
    </div>
  </div>
);

// Layout wrapper: Navbar + content + Footer
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

// Auth pages don't have the layout
const AuthLayout = ({ children }) => <>{children}</>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              },
              success: { iconTheme: { primary: '#138808', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes with layout */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/events" element={<Layout><EventsPage /></Layout>} />
              <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />

              {/* Auth routes (no layout) */}
              <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
              <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/create-event" element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <Layout><CreateEventPage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <Layout><MyBookingsPage /></Layout>
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
