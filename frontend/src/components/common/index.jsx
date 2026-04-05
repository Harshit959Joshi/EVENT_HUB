// ─── Footer.jsx ───────────────────────────────────────────────────────────────
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-16">
    <div className="page-container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EH</span>
            </div>
            <span className="text-white font-display font-bold text-lg">EventHub India</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
            India's premier event management platform. Discover, book, and create unforgettable experiences across the country.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-6 bg-india-saffron rounded-full" />
            <div className="w-2 h-6 bg-white rounded-full" />
            <div className="w-2 h-6 bg-india-green rounded-full" />
            <span className="text-xs text-gray-600 ml-1">Made with ❤️ in India</span>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/events', 'Browse Events'], ['/events?category=technology', 'Tech Events'], ['/events?isFree=true', 'Free Events']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-saffron-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm">
            {[['/login', 'Sign In'], ['/register', 'Join Free'], ['/dashboard', 'Dashboard'], ['/my-bookings', 'My Bookings']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-saffron-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-center text-gray-600">
        © 2025 EventHub India. All rights reserved.
      </div>
    </div>
  </footer>
);

// ─── ProtectedRoute.jsx ────────────────────────────────────────────────────────
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ─── Loading / Skeleton components ────────────────────────────────────────────
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div className={`${sizes[size]} border-saffron-200 border-t-saffron-500 rounded-full animate-spin ${className}`} />
  );
};

export const EventCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card overflow-hidden">
    <div className="skeleton h-48 w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-4 w-20 rounded-full" />
      <div className="skeleton h-5 w-4/5 rounded" />
      <div className="skeleton h-4 w-3/5 rounded" />
      <div className="skeleton h-4 w-2/5 rounded" />
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, message, action, actionLabel, actionTo }) => (
  <div className="text-center py-16 px-4">
    <div className="text-5xl mb-4">{icon || '🔍'}</div>
    <h3 className="text-xl font-display font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">{message}</p>
    {action && (
      <button onClick={action} className="btn-primary">
        {actionLabel}
      </button>
    )}
    {actionTo && (
      <Link to={actionTo} className="btn-primary">
        {actionLabel}
      </Link>
    )}
  </div>
);
