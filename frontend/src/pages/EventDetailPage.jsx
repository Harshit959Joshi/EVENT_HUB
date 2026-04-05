import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiShare2, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useEvent } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { eventsAPI } from '../services/api';
import BookingModal from '../components/booking/BookingModal';
import ReviewSection from '../components/events/ReviewSection';
import { PageLoader } from '../components/common';
import { formatDateTime, formatPrice, getCategoryMeta, getTicketStatus } from '../utils/helpers';
import toast from 'react-hot-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer, isAdmin } = useAuth();
  const { joinEventRoom, leaveEventRoom } = useSocket();
  const { event, loading, error, setEvent } = useEvent(id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      joinEventRoom(id);
      return () => leaveEventRoom(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? All bookings will be cancelled.')) return;
    setDeleting(true);
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <PageLoader />;
  if (error) return (
    <div className="page-container py-20 text-center">
      <p className="text-red-500 text-lg">{error}</p>
      <Link to="/events" className="btn-primary mt-4 inline-flex">Back to Events</Link>
    </div>
  );
  if (!event) return null;

  const cat = getCategoryMeta(event.category);
  const ticketStatus = getTicketStatus(event.ticketsSold, event.ticketsTotal);
  const available = event.ticketsTotal - event.ticketsSold;
  const isSoldOut = available === 0;
  const isOwnEvent = user?._id === event.organizer?._id || isAdmin;
  const pct = Math.round((event.ticketsSold / event.ticketsTotal) * 100);

  return (
    <>
      <div className="page-container py-8">
        {/* Back button */}
        <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <FiArrowLeft size={14} /> Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Event Details ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-video">
              {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-saffron-100 to-saffron-200 flex items-center justify-center">
                  <span className="text-8xl">{cat.icon}</span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`badge-category ${cat.color} shadow`}>{cat.icon} {cat.label}</span>
                {event.isFeatured && <span className="badge-category bg-saffron-500 text-white shadow">⭐ Featured</span>}
              </div>
            </div>

            {/* Title & actions */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-900 leading-tight">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={handleShare} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FiShare2 size={16} className="text-gray-500" />
                  </button>
                  {isOwnEvent && (
                    <>
                      <Link to={`/create-event?edit=${event._id}`} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <FiEdit2 size={16} className="text-gray-500" />
                      </Link>
                      <button onClick={handleDelete} disabled={deleting} className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 transition-colors">
                        <FiTrash2 size={16} className="text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {[
                  { icon: FiCalendar, label: 'Date & Time', value: formatDateTime(event.date) },
                  { icon: FiMapPin, label: 'Location', value: `${event.location?.venue}, ${event.location?.city}` },
                  { icon: FiUsers, label: 'Organizer', value: event.organizer?.name },
                  { icon: FiTag, label: 'Tags', value: event.tags?.join(', ') || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-saffron-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-saffron-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-700 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-3">About this Event</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Reviews */}
            <ReviewSection eventId={id} />
          </div>

          {/* ── Right: Booking Card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 p-6">
                {/* Price */}
                <div className="text-center mb-5">
                  <span className="font-display font-bold text-4xl text-saffron-600">
                    {formatPrice(event.price)}
                  </span>
                  {!event.isFree && <span className="text-gray-400 text-sm ml-1">per ticket</span>}
                </div>

                {/* Ticket availability */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`font-semibold ${ticketStatus.color} px-2.5 py-1 rounded-full`}>
                      {ticketStatus.label}
                    </span>
                    <span className="text-gray-500">{pct}% filled</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-2 rounded-full ${isSoldOut ? 'bg-red-400' : ticketStatus.urgent ? 'bg-orange-400' : 'bg-india-green'}`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-right">
                    {event.ticketsSold} of {event.ticketsTotal} tickets sold
                  </p>
                </div>

                {/* Book button */}
                <button
                  onClick={() => setBookingOpen(true)}
                  disabled={isSoldOut}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    isSoldOut
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-saffron-500 hover:bg-saffron-600 text-white shadow-saffron hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isSoldOut ? '😔 Sold Out' : isAuthenticated ? '🎟 Book Tickets' : '🎟 Sign In to Book'}
                </button>

                {!isAuthenticated && !isSoldOut && (
                  <p className="text-xs text-center text-gray-400 mt-2">
                    <Link to="/login" className="text-saffron-500 font-medium hover:underline">Sign in</Link> to book tickets
                  </p>
                )}

                {/* Organizer info */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2 font-medium">ORGANIZED BY</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {event.organizer?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{event.organizer?.name}</p>
                      {event.organizer?.bio && <p className="text-xs text-gray-400">{event.organizer.bio}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event rating card */}
              {event.rating?.count > 0 && (
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 text-center">
                  <span className="text-3xl font-display font-bold text-yellow-600">{event.rating.average}</span>
                  <span className="text-yellow-400 text-xl ml-1">★</span>
                  <p className="text-sm text-gray-500 mt-1">{event.rating.count} attendee reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        event={event}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => setEvent(prev => ({ ...prev, ticketsSold: prev.ticketsSold + 1 }))}
      />
    </>
  );
};

export default EventDetailPage;
