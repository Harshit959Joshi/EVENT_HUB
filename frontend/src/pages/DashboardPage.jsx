import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiTrendingUp, FiDollarSign, FiEdit2, FiTrash2, FiPlusCircle, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useMyEvents, useBookings } from '../hooks/useData';
import { eventsAPI } from '../services/api';
import { formatDate, formatPrice, getTicketStatus } from '../utils/helpers';
import { EmptyState, Spinner, EventCardSkeleton } from '../components/common';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="font-display font-bold text-2xl text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </motion.div>
);

// ─── Organizer Dashboard ──────────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const { events, loading, refetch } = useMyEvents();
  const navigate = useNavigate();

  const totalSold = events.reduce((a, e) => a + e.ticketsSold, 0);
  const totalRevenue = events.reduce((a, e) => a + (e.ticketsSold * e.price), 0);
  const totalAttendees = events.reduce((a, e) => a + (e.bookingCount || 0), 0);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All bookings will be cancelled.`)) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your events and track performance</p>
        </div>
        <Link to="/create-event" className="btn-primary flex items-center gap-2">
          <FiPlusCircle size={16} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={events.length} icon={FiCalendar} color="bg-saffron-500" sub="All time" />
        <StatCard label="Tickets Sold" value={totalSold.toLocaleString()} icon={FiTrendingUp} color="bg-blue-500" sub="Across all events" />
        <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={FiDollarSign} color="bg-india-green" sub="Net earnings" />
        <StatCard label="Attendees" value={totalAttendees.toLocaleString()} icon={FiUsers} color="bg-purple-500" sub="Confirmed bookings" />
      </div>

      {/* Events table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Your Events</h2>
          <span className="text-sm text-gray-400">{events.length} events</span>
        </div>

        {loading ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState icon="🎭" title="No events yet" message="Create your first event and start selling tickets!"
            actionTo="/create-event" actionLabel="Create Event" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Event', 'Date', 'Location', 'Tickets', 'Revenue', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(event => {
                  const ts = getTicketStatus(event.ticketsSold, event.ticketsTotal);
                  return (
                    <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {event.image && <img src={event.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm max-w-[180px] truncate">{event.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{event.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(event.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{event.location?.city}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                            <div className="bg-saffron-400 h-1.5 rounded-full" style={{ width: `${(event.ticketsSold/event.ticketsTotal)*100}%` }} />
                          </div>
                          <p className="text-xs text-gray-500">{event.ticketsSold}/{event.ticketsTotal}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 text-sm">
                        {formatPrice(event.ticketsSold * event.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ts.color}`}>{ts.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link to={`/events/${event._id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                            <FiEye size={14} className="text-gray-500" />
                          </Link>
                          <Link to={`/create-event?edit=${event._id}`} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={14} className="text-blue-500" />
                          </Link>
                          <button onClick={() => handleDelete(event._id, event.title)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <FiTrash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Attendee Dashboard ───────────────────────────────────────────────────────
const AttendeeDashboard = () => {
  const { user } = useAuth();
  const { bookings, loading } = useBookings();
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const totalSpent = confirmed.reduce((a, b) => a + b.totalAmount, 0);

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900">
          Hello, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your EventHub activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Bookings" value={bookings.length} icon={FiCalendar} color="bg-saffron-500" />
        <StatCard label="Active" value={confirmed.length} icon={FiTrendingUp} color="bg-india-green" sub="Confirmed" />
        <StatCard label="Cancelled" value={cancelled.length} icon={FiUsers} color="bg-red-400" />
        <StatCard label="Total Spent" value={formatPrice(totalSpent)} icon={FiDollarSign} color="bg-blue-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/my-bookings" className="text-saffron-600 text-sm font-medium hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center"><Spinner /></div>
        ) : bookings.length === 0 ? (
          <EmptyState icon="🎟" title="No bookings yet" message="Start exploring events and book your first ticket!"
            actionTo="/events" actionLabel="Browse Events" />
        ) : (
          <div className="divide-y divide-gray-50">
            {bookings.slice(0, 5).map(booking => (
              <div key={booking._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {booking.event?.image && <img src={booking.event.image} alt="" className="w-10 h-10 rounded-xl object-cover" />}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{booking.event?.title}</p>
                    <p className="text-xs text-gray-400">{booking.ticketsBooked} ticket{booking.ticketsBooked > 1 ? 's' : ''} · {booking.bookingRef}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>{booking.status}</span>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(booking.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── DashboardPage: routes to correct role dashboard ─────────────────────────
const DashboardPage = () => {
  const { user, isOrganizer, isAdmin } = useAuth();
  if (isOrganizer || isAdmin) return <OrganizerDashboard />;
  return <AttendeeDashboard />;
};

export default DashboardPage;
