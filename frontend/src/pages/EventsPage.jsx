import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import { EventCardSkeleton, EmptyState } from '../components/common';
import { eventsAPI } from '../services/api';
import { FiGrid, FiList } from 'react-icons/fi';

const EventsPage = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  // Initialize from URL search params
  useEffect(() => {
    const params = {};
    ['search', 'category', 'city', 'isFree', 'isFeatured'].forEach(k => {
      if (searchParams.get(k)) params[k] = searchParams.get(k);
    });
    setActiveFilters(params);
    fetchEvents({ ...params, page: 1 });
  }, [searchParams.toString()]);

  const fetchEvents = async (params = {}) => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll({ ...params, limit: 12 });

      // ✅ Ensure events is always an array
      setEvents(res?.events || []);

      // ✅ Defensive pagination
      setPagination({
        total: res?.total || (res?.events?.length || 0),
        pages: res?.pages || 1,
        page: res?.page || 1,
      });
    } catch (err) {
      console.error(err);
      setEvents([]); // fallback if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    fetchEvents({ ...filters, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEvents({ ...activeFilters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-gray-900 mb-2">Browse Events</h1>
        <p className="text-gray-500">
          {loading ? 'Searching...' : `${pagination.total} event${pagination.total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filters */}
      <EventFilters onFilter={handleFilter} loading={loading} />

      {/* View mode toggle + pagination info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-saffron-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-saffron-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiList size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Page {pagination.page} of {pagination.pages}
        </p>
      </div>

      {/* Events Grid / List */}
      {loading ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]' // min-height ensures skeleton is visible
          : 'flex flex-col gap-4 min-h-[400px]'
        }>
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : (events?.length || 0) === 0 ? (
        <EmptyState
          icon="🎭"
          title="No events found"
          message="Try adjusting your filters or search query to find events near you."
          actionTo="/events"
          actionLabel="Clear filters"
        />
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
        }>
          {events?.map((event, i) => (
            <EventCard key={event._id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
          >
            ← Prev
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === currentPage ? 'bg-saffron-500 text-white shadow-saffron' : 'btn-secondary'}`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
