import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { CATEGORIES, INDIAN_CITIES } from '../../utils/helpers';

const EventFilters = ({ onFilter, loading }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState('');

  const hasActiveFilters = search || category || city || isFree || startDate;

  const handleFilter = () => {
    onFilter({ search, category, city, isFree: isFree || undefined, startDate: startDate || undefined });
  };

  const handleReset = () => {
    setSearch(''); setCategory(''); setCity(''); setIsFree(false); setStartDate('');
    onFilter({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-8">
      {/* Main search bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFilter()}
            placeholder="Search events, venues, artists..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={handleFilter} disabled={loading} className="btn-primary px-6">
          Search
        </button>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className={`btn-secondary px-4 flex items-center gap-2 ${showAdvanced ? 'bg-saffron-50 text-saffron-600 border-saffron-200' : ''}`}>
          <FiFilter size={14} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="w-2 h-2 bg-saffron-500 rounded-full" />}
        </button>
      </div>

      {/* Category quick pills */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => { setCategory(''); onFilter({ search, city, isFree: isFree || undefined }); }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-saffron-500 text-white shadow-saffron' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => {
              setCategory(cat.value);
              onFilter({ search, category: cat.value, city, isFree: isFree || undefined });
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat.value ? 'bg-saffron-500 text-white shadow-saffron' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <div>
            <label className="label">City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="input-field">
              <option value="">All Cities</option>
              {INDIAN_CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setIsFree(!isFree)}
                className={`w-10 h-6 rounded-full transition-colors relative ${isFree ? 'bg-india-green' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${isFree ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Free events only</span>
            </label>
          </div>
        </div>
      )}

      {/* Active filters + Reset */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Active:</span>
          {search && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">"Search: {search}"</span>}
          {category && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full capitalize">{category}</span>}
          {city && <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">{city}</span>}
          {isFree && <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">Free Only</span>}
          <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium ml-1">
            <FiX size={12} /> Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
