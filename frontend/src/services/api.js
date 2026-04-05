import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: 'https://event-hub-tty1.onrender.com', // ✅ fixed: must be a string
  withCredentials: true,
  timeout: 15000,
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle errors globally ────────────────────────────
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to do that.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updatePassword: (data) => API.put('/auth/password', data),
};

// ─── Events ────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params) => API.get('/events', { params }),
  getOne: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
  getMyEvents: () => API.get('/events/organizer/my'),
  getAttendees: (id) => API.get(`/events/${id}/attendees`),
  getFeatured: () => API.get('/events/featured'),
};

// ─── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings', { params }),
  getOne: (id) => API.get(`/bookings/${id}`),
  cancel: (id, data) => API.put(`/bookings/${id}/cancel`, data),
};

// ─── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data) => API.post('/reviews', data),
  getEventReviews: (eventId) => API.get(`/reviews/event/${eventId}`),
  delete: (id) => API.delete(`/reviews/${id}`),
};

// ─── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createIntent: (data) => API.post('/payments/create-intent', data),
  confirm: (data) => API.post('/payments/confirm', data),
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  readAll: () => API.put('/notifications/read-all'),
  readOne: (id) => API.put(`/notifications/${id}/read`),
};

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  toggleFeature: (id) => API.put(`/admin/events/${id}/feature`),
};

export default API;
