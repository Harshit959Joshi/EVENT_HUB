import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiMapPin, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { eventsAPI } from '../services/api';
import EventCard from '../components/events/EventCard';
import { EventCardSkeleton } from '../components/common';
import { CATEGORIES, formatPrice } from '../utils/helpers';

const stats = [
  { label: 'Events Listed', value: '2,400+', icon: FiCalendar },
  { label: 'Cities Covered', value: '50+', icon: FiMapPin },
  { label: 'Happy Attendees', value: '1.2L+', icon: FiUsers },
  { label: 'Growing Monthly', value: '35%', icon: FiTrendingUp },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    eventsAPI.getFeatured()
      .then(res => setFeatured(res.events))
      .finally(() => setLoadingFeatured(false));

    eventsAPI.getAll({ sort: 'date', limit: 6 })
      .then(res => setUpcoming(res.events))
      .finally(() => setLoadingUpcoming(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-saffron-50 via-orange-50 to-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-saffron-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-40 w-48 h-48 bg-india-green rounded-full blur-3xl" />
        </div>
        {/* Indian flag stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-india-saffron" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-india-green" />
        </div>

        <div className="page-container py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 bg-saffron-100 text-saffron-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              🇮🇳 India's Premier Event Platform
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Discover &{' '}
              <span className="text-saffron-500">Experience</span>
              <br />
              <span className="text-india-green">India's</span> Best Events
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
              From tech conferences in Bengaluru to music festivals in Goa — find, book, and create
              extraordinary events across the country.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events, artists, venues..."
                className="input-field flex-1 text-base py-4 shadow-sm"
              />
              <button type="submit" className="btn-primary py-4 px-8 text-base flex items-center gap-2 whitespace-nowrap">
                Find Events <FiArrowRight size={16} />
              </button>
            </form>

            {/* Quick category links */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 5).map(cat => (
                <Link
                  key={cat.value}
                  to={`/events?category=${cat.value}`}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:border-saffron-400 hover:text-saffron-600 text-sm px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow-card"
                >
                  <span>{cat.icon}</span> {cat.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100">
        <div className="page-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-saffron-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-saffron-600" />
                </div>
                <div className="font-display font-bold text-2xl md:text-3xl text-gray-900">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Events ───────────────────────────────────────── */}
      <section className="page-container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-saffron-600 font-semibold text-sm mb-1">⭐ Hand-picked for you</p>
            <h2 className="section-title">Featured Events</h2>
          </div>
          <Link to="/events?isFeatured=true" className="text-saffron-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            See all <FiArrowRight size={14} />
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
          </div>
        )}
      </section>

      {/* ── Category Showcase ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-50 to-saffron-50 py-14">
        <div className="page-container">
          <div className="text-center mb-10">
            <p className="text-saffron-600 font-semibold text-sm mb-1">🎭 Explore by interest</p>
            <h2 className="section-title">Browse Categories</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/events?category=${cat.value}`}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all border border-gray-100 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ───────────────────────────────────────── */}
      <section className="page-container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-india-green font-semibold text-sm mb-1">📅 Coming up soon</p>
            <h2 className="section-title">Upcoming Events</h2>
          </div>
          <Link to="/events" className="text-saffron-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Browse all <FiArrowRight size={14} />
          </Link>
        </div>
        {loadingUpcoming ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
          </div>
        )}
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="page-container pb-14">
        <div className="bg-gradient-to-r from-saffron-500 to-orange-500 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
              Ready to host your event?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl">
              Join thousands of organizers who trust EventHub to sell tickets, manage attendees, and create memorable events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register?role=organizer" className="bg-white text-saffron-600 font-bold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-center">
                Start Organizing Free
              </Link>
              <Link to="/events" className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-center">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
