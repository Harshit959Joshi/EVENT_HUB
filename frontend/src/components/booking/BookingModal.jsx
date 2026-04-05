import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiCreditCard, FiCheck } from 'react-icons/fi';
import { bookingsAPI, paymentsAPI } from '../../services/api';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState('confirm'); // confirm | payment | success
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const available = event?.ticketsTotal - event?.ticketsSold;
  const total = (event?.price || 0) * qty;

  const handleFreeBooking = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.create({
        eventId: event._id,
        ticketsBooked: qty,
        attendeeInfo: { name: user.name, email: user.email },
      });
      setBooking(res.booking);
      setStep('success');
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaidBooking = async () => {
    setLoading(true);
    try {
      // Create payment intent
      const { clientSecret } = await paymentsAPI.createIntent({
        eventId: event._id,
        ticketsBooked: qty,
      });
      // In a real app, open Stripe Elements here
      // For demo, we simulate confirmation
      toast('Stripe payment flow would open here. Using test mode.', { icon: '💳' });
      await handleFreeBooking(); // Fallback for demo
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }
    if (event.isFree || event.price === 0) {
      handleFreeBooking();
    } else {
      handlePaidBooking();
    }
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-gray-900">
                {step === 'success' ? '🎉 Booking Confirmed!' : 'Book Tickets'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <FiX size={18} />
              </button>
            </div>

            {/* Event summary */}
            <div className="p-5">
              {step !== 'success' ? (
                <>
                  <div className="flex gap-4 p-4 bg-saffron-50 rounded-2xl mb-6">
                    {event.image && (
                      <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(event.date)}</p>
                      <p className="text-xs text-gray-500">{event.location?.venue}, {event.location?.city}</p>
                    </div>
                  </div>

                  {/* Ticket quantity selector */}
                  <div className="mb-6">
                    <label className="label">Number of Tickets</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-saffron-400 transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="text-3xl font-display font-bold text-gray-900 w-8 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(q => Math.min(available, q + 1))}
                        disabled={qty >= available || qty >= 10}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-saffron-400 transition-colors disabled:opacity-40"
                      >
                        <FiPlus size={16} />
                      </button>
                      <span className="text-sm text-gray-400 ml-2">{available} available</span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(event.price)} × {qty} ticket{qty > 1 ? 's' : ''}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform fee</span>
                      <span className="text-india-green">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-saffron-600 text-lg">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Attendee info */}
                  <div className="bg-blue-50 rounded-xl p-3 mb-5 text-sm text-blue-700">
                    Booking as: <span className="font-semibold">{user?.name || 'Guest'}</span> · {user?.email}
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-base"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : event.isFree || event.price === 0 ? (
                      <><FiCheck size={18} /> Confirm Free Booking</>
                    ) : (
                      <><FiCreditCard size={18} /> Pay {formatPrice(total)}</>
                    )}
                  </button>
                </>
              ) : (
                /* Success state */
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck size={36} className="text-india-green" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-2">You're all set!</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {qty} ticket{qty > 1 ? 's' : ''} for <strong>{event.title}</strong>
                  </p>
                  {booking && (
                    <div className="bg-saffron-50 border border-saffron-100 rounded-2xl p-4 mb-6 text-left">
                      <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
                      <p className="font-mono font-bold text-saffron-700 text-lg">{booking.bookingRef}</p>
                      <p className="text-xs text-gray-500 mt-2">A confirmation email has been sent to {user?.email}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">Close</button>
                    <button onClick={() => { onClose(); navigate('/my-bookings'); }} className="btn-primary flex-1">
                      View Bookings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
