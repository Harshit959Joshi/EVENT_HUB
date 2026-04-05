import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { timeAgo } from '../../utils/helpers';
import {
  FiMenu, FiX, FiBell, FiUser, FiLogOut, FiSettings,
  FiCalendar, FiPlusCircle, FiGrid, FiHome,
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const { unreadCount, notifications, clearUnread } = useSocket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/events', label: 'Browse Events', icon: FiCalendar },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-saffron-500 to-saffron-600 rounded-xl flex items-center justify-center shadow-saffron group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">EH</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-gray-900">Event</span>
              <span className="font-display font-bold text-xl text-saffron-500">Hub</span>
              <div className="text-[10px] text-india-green font-semibold tracking-wider leading-none">INDIA</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-saffron-50 text-saffron-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {(isOrganizer || isAdmin) && (
              <NavLink
                to="/create-event"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
                    isActive ? 'bg-saffron-50 text-saffron-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <FiPlusCircle size={14} />
                Create Event
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) clearUnread(); }}
                    className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <FiBell size={20} className="text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-saffron-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="font-semibold text-gray-900">Notifications</span>
                          <span className="text-xs text-saffron-500 font-medium">{unreadCount} new</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                          ) : (
                            notifications.slice(0, 8).map((n) => (
                              <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                <p className="text-sm text-gray-700">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.time)}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <Link to="/notifications" className="text-xs text-saffron-500 font-medium hover:underline" onClick={() => setNotifOpen(false)}>
                            View all notifications →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        {[
                          { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
                          { to: '/profile', icon: FiUser, label: 'My Profile' },
                          { to: '/my-bookings', icon: FiCalendar, label: 'My Bookings' },
                          ...(isAdmin ? [{ to: '/admin', icon: FiSettings, label: 'Admin Panel' }] : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to} to={to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                          >
                            <Icon size={15} className="text-gray-400" />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full transition-colors"
                          >
                            <FiLogOut size={15} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Join Free</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100 pb-4"
            >
              <div className="pt-3 space-y-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-saffron-50 text-saffron-600' : 'text-gray-700'}`}>
                    <Icon size={16} /> {label}
                  </NavLink>
                ))}
                {isAuthenticated && (
                  <>
                    <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700">
                      <FiGrid size={16} /> Dashboard
                    </NavLink>
                    <NavLink to="/my-bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700">
                      <FiCalendar size={16} /> My Bookings
                    </NavLink>
                    {(isOrganizer || isAdmin) && (
                      <NavLink to="/create-event" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-saffron-600 bg-saffron-50">
                        <FiPlusCircle size={16} /> Create Event
                      </NavLink>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 w-full">
                      <FiLogOut size={16} /> Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
