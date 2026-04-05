// ─── CreateEventPage.jsx ──────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiCalendar, FiMapPin, FiInfo } from 'react-icons/fi';
import { eventsAPI } from '../services/api';
import { CATEGORIES, INDIAN_CITIES } from '../utils/helpers';
import toast from 'react-hot-toast';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  const [form, setForm] = useState({
    title: '', description: '', category: 'technology',
    date: '', endDate: '', price: 0, ticketsTotal: 100,
    image: '', tags: '',
    location: { venue: '', city: 'Mumbai', state: '', address: '' },
  });

  // Load existing event if editing
  useEffect(() => {
    if (!editId) return;
    eventsAPI.getOne(editId)
      .then(res => {
        const e = res.event;
        setForm({
          title: e.title, description: e.description, category: e.category,
          date: e.date?.slice(0, 16), endDate: e.endDate?.slice(0, 16) || '',
          price: e.price, ticketsTotal: e.ticketsTotal,
          image: e.image || '', tags: e.tags?.join(', ') || '',
          location: e.location,
        });
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoadingEdit(false));
  }, [editId]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setLoc = (field, val) => setForm(p => ({ ...p, location: { ...p.location, [field]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, date, price, ticketsTotal, location } = form;
    if (!title || !description || !date || !location.venue || !location.city) {
      toast.error('Please fill all required fields.'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        ticketsTotal: Number(form.ticketsTotal),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isFree: Number(form.price) === 0,
      };
      if (editId) {
        await eventsAPI.update(editId, payload);
        toast.success('Event updated! ✅');
      } else {
        await eventsAPI.create(payload);
        toast.success('Event published! 🎉');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEdit) return <div className="page-container py-20 text-center"><div className="w-8 h-8 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="page-container py-10">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
            {editId ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">Fill in the details to {editId ? 'update' : 'publish'} your event</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiInfo size={16} className="text-saffron-500" /> Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Event Title *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder="e.g. React Workshop 2025" className="input-field" maxLength={100} />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={5} placeholder="Tell attendees what to expect..." className="input-field resize-none" maxLength={2000} />
                  <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/2000</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Cover Image URL</label>
                    <input value={form.image} onChange={e => set('image', e.target.value)}
                      placeholder="https://..." className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="react, javascript, workshop" className="input-field" />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiCalendar size={16} className="text-saffron-500" /> Date & Time</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date & Time *</label>
                  <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label">End Date & Time</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiMapPin size={16} className="text-saffron-500" /> Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Venue / Hall *</label>
                  <input value={form.location.venue} onChange={e => setLoc('venue', e.target.value)}
                    placeholder="e.g. Grand Hyatt" className="input-field" />
                </div>
                <div>
                  <label className="label">City *</label>
                  <select value={form.location.city} onChange={e => setLoc('city', e.target.value)} className="input-field">
                    {INDIAN_CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">State</label>
                  <input value={form.location.state} onChange={e => setLoc('state', e.target.value)}
                    placeholder="Maharashtra" className="input-field" />
                </div>
                <div>
                  <label className="label">Full Address</label>
                  <input value={form.location.address} onChange={e => setLoc('address', e.target.value)}
                    placeholder="Street, Area, Pincode" className="input-field" />
                </div>
              </div>
            </div>

            {/* Tickets & Pricing */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">🎟 Tickets & Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Total Tickets *</label>
                  <input type="number" value={form.ticketsTotal} onChange={e => set('ticketsTotal', e.target.value)}
                    min={1} className="input-field" />
                </div>
                <div>
                  <label className="label">Price per Ticket (₹)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    min={0} className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">Set to 0 for a free event</p>
                </div>
              </div>
              {Number(form.price) === 0 && (
                <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-india-green font-medium">
                  ✅ This will be listed as a FREE event
                </div>
              )}
            </div>

            {/* Preview */}
            {form.image && (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">📸 Cover Preview</h2>
                <img src={form.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" onError={e => e.target.src = 'https://via.placeholder.com/800x300?text=Invalid+URL'} />
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editId ? 'Save Changes' : '🚀 Publish Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// ─── MyBookingsPage.jsx ────────────────────────────────────────────────────────
export const MyBookingsPage = () => {
  const { bookings, loading, refetch } = useBookings();
  const [filter, setFilter] = useState('all');
  const { bookingsAPI } = require('../services/api');

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const { bookingsAPI: bAPI } = require('../services/api');
      await bAPI.cancel(bookingId, { cancellationReason: 'Cancelled by user' });
      toast.success('Booking cancelled.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-container py-10">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 text-sm mb-6">All your event ticket bookings</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl w-fit">
        {['all', 'confirmed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? 'bg-white shadow text-saffron-600' : 'text-gray-500'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎟</p>
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <motion.div key={booking._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {booking.event?.image && (
                <img src={booking.event.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-gray-900">{booking.event?.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  📅 {booking.event?.date ? require('../utils/helpers').formatDate(booking.event.date) : '—'} · 📍 {booking.event?.location?.city}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-xs bg-saffron-50 text-saffron-700 px-2 py-1 rounded-lg">{booking.bookingRef}</span>
                  <span className="text-sm text-gray-500">{booking.ticketsBooked} ticket{booking.ticketsBooked > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'
                  }`}>{booking.status}</span>
                  <p className="font-bold text-gray-900 mt-1">{require('../utils/helpers').formatPrice(booking.totalAmount)}</p>
                </div>
                {booking.status === 'confirmed' && (
                  <button onClick={() => handleCancel(booking._id)}
                    className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors font-medium">
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


