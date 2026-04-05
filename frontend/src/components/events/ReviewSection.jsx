import React, { useState } from 'react';
import { FiStar, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { reviewsAPI } from '../../services/api';
import { useReviews } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onChange?.(star)}
        className={`text-2xl transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <FiStar
          size={20}
          className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      </button>
    ))}
  </div>
);

const ReviewSection = ({ eventId }) => {
  const { user, isAuthenticated } = useAuth();
  const { reviews, loading, setReviews } = useReviews(eventId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === n).length / reviews.length) * 100 : 0,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating.'); return; }
    if (comment.trim().length < 10) { toast.error('Comment must be at least 10 characters.'); return; }
    setSubmitting(true);
    try {
      const res = await reviewsAPI.create({ eventId, rating, comment });
      setReviews(prev => [res.review, ...prev]);
      setRating(0); setComment(''); setShowForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsAPI.delete(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-gray-900">
          Reviews & Ratings
        </h2>
        {isAuthenticated && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-outline-saffron text-sm py-2">
            Write a Review
          </button>
        )}
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-saffron-50 to-orange-50 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6">
          <div className="text-center">
            <div className="text-6xl font-display font-bold text-saffron-600">{avgRating}</div>
            <StarRating value={Math.round(avgRating)} readonly />
            <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-2">
            {ratingDist.map(({ n, count, pct }) => (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-500">{n}</span>
                <FiStar size={12} className="fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-5 text-gray-500 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">Share your experience</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="label">Your Review</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Share what you loved (or didn't) about this event..."
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex gap-3">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">💬</div>
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{review.user?.name}</span>
                      {review.isVerifiedAttendee && (
                        <span className="flex items-center gap-1 text-xs text-india-green bg-green-50 px-2 py-0.5 rounded-full">
                          <FiCheckCircle size={10} /> Verified Attendee
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                    </div>
                    <StarRating value={review.rating} readonly />
                    {review.title && <p className="font-medium text-gray-800 text-sm mt-1">{review.title}</p>}
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
                {(user?._id === review.user?._id || user?.role === 'admin') && (
                  <button onClick={() => handleDelete(review._id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <FiTrash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
