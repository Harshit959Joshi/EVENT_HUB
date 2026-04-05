/**
 * Custom hooks for data fetching
 */
import { useState, useEffect, useCallback } from 'react';
import { eventsAPI, bookingsAPI, reviewsAPI, notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── useEvents ────────────────────────────────────────────────────────────────
export const useEvents = (params = {}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const fetchEvents = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsAPI.getAll(overrideParams || params);
      setEvents(res.events);
      setPagination({ total: res.total, pages: res.pages, page: res.page });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, error, pagination, refetch: fetchEvents, setEvents };
};

// ─── useEvent (single) ────────────────────────────────────────────────────────
export const useEvent = (id) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    eventsAPI.getOne(id)
      .then(res => setEvent(res.event))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { event, loading, error, setEvent };
};

// ─── useMyEvents (organizer) ──────────────────────────────────────────────────
export const useMyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getMyEvents();
      setEvents(res.events);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { events, loading, refetch: fetch };
};

// ─── useBookings ──────────────────────────────────────────────────────────────
export const useBookings = (params = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getMyBookings(params);
      setBookings(res.bookings);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { bookings, loading, refetch: fetch };
};

// ─── useReviews ───────────────────────────────────────────────────────────────
export const useReviews = (eventId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    reviewsAPI.getEventReviews(eventId)
      .then(res => setReviews(res.reviews))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  return { reviews, loading, setReviews };
};

// ─── useNotifications ─────────────────────────────────────────────────────────
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.notifications);
      setUnread(res.unread);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAllRead = async () => {
    await notificationsAPI.readAll();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return { notifications, unread, loading, markAllRead, refetch: fetch };
};
