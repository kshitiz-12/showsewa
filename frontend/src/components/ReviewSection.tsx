import { useEffect, useState } from 'react';
import { Star, ThumbsUp, MessageCircle, User, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  review?: string;
  title?: string;
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

interface ReviewSectionProps {
  movieId?: string;
  eventId?: string;
}

export function ReviewSection({ movieId, eventId }: Readonly<ReviewSectionProps>) {
  const { user, isAuthenticated } = useAuth();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    review: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [movieId, eventId]);

  const loadReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (movieId) params.append('movieId', movieId);
      if (eventId) params.append('eventId', eventId);
      params.append('limit', '10');

      const response = await fetch(`http://localhost:5000/api/reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviewData(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || newReview.rating === 0) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          movieId,
          eventId,
          rating: newReview.rating,
          title: newReview.title || undefined,
          review: newReview.review || undefined,
        }),
      });

      if (response.ok) {
        setNewReview({ rating: 0, title: '', review: '' });
        setShowReviewForm(false);
        await loadReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      await loadReviews(); // Refresh to update helpful count
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            disabled={!interactive}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!reviewData) return null;

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(reviewData.averageRating))}
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {reviewData.averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              ({reviewData.totalReviews} reviews)
            </span>
          </div>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Write Review
          </button>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rating Breakdown</h3>
        <div className="space-y-2">
          {reviewData.ratingDistribution.slice().reverse().map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label htmlFor="rating-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating *
              </label>
              <div id="rating-input">
                {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
              </div>
            </div>
            
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (optional)
              </label>
              <input
                id="review-title"
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Summarize your experience..."
              />
            </div>
            
            <div>
              <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review (optional)
              </label>
              <textarea
                id="review-text"
                value={newReview.review}
                onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Share your thoughts about this movie..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || newReview.rating === 0}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewData.reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviewData.reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {review.user.name}
                      </span>
                      {review.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user?.id === review.user.id && (
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {review.title}
                </h4>
              )}

              {review.review && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {review.review}
                </p>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
