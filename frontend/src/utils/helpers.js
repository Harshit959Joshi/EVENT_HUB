import { format, formatDistanceToNow, isPast } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy');
export const formatDateTime = (date) => format(new Date(date), 'dd MMM yyyy, h:mm a');
export const formatTime = (date) => format(new Date(date), 'h:mm a');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
export const isEventPast = (date) => isPast(new Date(date));

export const formatPrice = (price, currency = 'INR') => {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
};

export const CATEGORIES = [
  { value: 'technology', label: 'Technology', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { value: 'music', label: 'Music', icon: '🎵', color: 'bg-purple-100 text-purple-700' },
  { value: 'sports', label: 'Sports', icon: '🏏', color: 'bg-green-100 text-green-700' },
  { value: 'food', label: 'Food & Drink', icon: '🍽️', color: 'bg-orange-100 text-orange-700' },
  { value: 'art', label: 'Art & Culture', icon: '🎨', color: 'bg-pink-100 text-pink-700' },
  { value: 'business', label: 'Business', icon: '💼', color: 'bg-gray-100 text-gray-700' },
  { value: 'education', label: 'Education', icon: '📚', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'health', label: 'Health', icon: '🧘', color: 'bg-teal-100 text-teal-700' },
  { value: 'other', label: 'Other', icon: '✨', color: 'bg-indigo-100 text-indigo-700' },
];

export const getCategoryMeta = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kochi', 'Chandigarh', 'Bhopal', 'Indore',
  'Dehradun', 'Goa', 'Rishikesh', 'Varanasi', 'Agra',
];

export const getTicketStatus = (sold, total) => {
  const available = total - sold;
  const pct = (sold / total) * 100;
  if (available === 0) return { label: 'Sold Out', color: 'text-red-600 bg-red-50', urgent: true };
  if (pct >= 80) return { label: `Only ${available} left!`, color: 'text-orange-600 bg-orange-50', urgent: true };
  return { label: `${available} available`, color: 'text-green-600 bg-green-50', urgent: false };
};

export const truncate = (str, n = 120) => str?.length > n ? str.slice(0, n) + '...' : str;
