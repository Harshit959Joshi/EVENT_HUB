import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiStar } from 'react-icons/fi';
import { formatDate, formatTime, formatPrice, getCategoryMeta, getTicketStatus, truncate } from '../../utils/helpers';

const EventCard = ({ event, index = 0 }) => {
  const cat = getCategoryMeta(event.category);
  const ticketStatus = getTicketStatus(event.ticketsSold, event.ticketsTotal);
  const available = event.ticketsTotal - event.ticketsSold;
  const isSoldOut = available === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link to={`/events/${event._id}`} className="block group">
        <div className="card overflow-hidden h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = `https://via.placeholder.com/400x200/FF9933/ffffff?text=${encodeURIComponent(event.title.slice(0, 15))}`; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-saffron-100 to-saffron-200 flex items-center justify-center">
                <span className="text-5xl">{cat.icon}</span>
              </div>
            )}
            {/* Overlays */}
            <div className="absolute top-3 left-3">
              <span className={`badge-category ${cat.color} shadow-sm`}>
                {cat.icon} {cat.label}
              </span>
            </div>
            {event.isFeatured && (
              <div className="absolute top-3 right-3 bg-saffron-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                ⭐ Featured
              </div>
            )}
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-full text-sm">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-display font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-saffron-600 transition-colors line-clamp-2">
              {event.title}
            </h3>

            <p className="text-gray-500 text-sm mb-3 flex-1 line-clamp-2">
              {truncate(event.description, 100)}
            </p>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <FiCalendar size={13} className="text-saffron-500 flex-shrink-0" />
                <span>{formatDate(event.date)} · {formatTime(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <FiMapPin size={13} className="text-saffron-500 flex-shrink-0" />
                <span className="truncate">{event.location?.venue}, {event.location?.city}</span>
              </div>
              {event.rating?.count > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-700">{event.rating.average}</span>
                  <span className="text-gray-400">({event.rating.count})</span>
                </div>
              )}
            </div>

            {/* Ticket progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className={`font-medium ${ticketStatus.color} px-2 py-0.5 rounded-full`}>
                  {ticketStatus.label}
                </span>
                <span>{event.ticketsSold}/{event.ticketsTotal} sold</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isSoldOut ? 'bg-red-400' : ticketStatus.urgent ? 'bg-orange-400' : 'bg-india-green'
                  }`}
                  style={{ width: `${Math.min((event.ticketsSold / event.ticketsTotal) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-display font-bold text-saffron-600">
                  {formatPrice(event.price)}
                </span>
                {!event.isFree && <span className="text-xs text-gray-400 ml-1">/ ticket</span>}
              </div>
              <span className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                isSoldOut
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-saffron-500 text-white group-hover:bg-saffron-600 shadow-saffron'
              }`}>
                {isSoldOut ? 'Sold Out' : 'Book Now'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
