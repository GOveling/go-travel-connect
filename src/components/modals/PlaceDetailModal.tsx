import { useState } from "react";
import { Star, MapPin, Clock, Globe, Phone, Plus, Edit3, X, ChevronDown, ChevronUp, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePlaceReviews } from "@/hooks/usePlaceReviews";
import { useAuth } from "@/hooks/useAuth";
import useEmblaCarousel from 'embla-carousel-react';

interface PlaceDetailModalProps {
  place: {
    id?: string; // Official Google place_id
    name: string;
    location: string;
    rating?: number; // Optional, no artificial fallback
    image?: string;
    category: string;
    description?: string;
    hours?: string;
    website?: string;
    phone?: string;
    photos?: string[]; // Array of photo URLs
    reviews_count?: number;
    business_status?: string;
    opening_hours?: {
      open_now: boolean;
      weekday_text: string[];
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isFromSavedPlaces?: boolean;
  onAddToTrip?: () => void;
}

const PlaceDetailModal = ({ place, isOpen, onClose, isFromSavedPlaces = false, onAddToTrip }: PlaceDetailModalProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user } = useAuth();

  const [emblaRef, emblaApi] = useEmblaCarousel();

  // Use the official Google place_id
  const placeId = place?.id || place?.name?.toLowerCase().replace(/\s+/g, '-') || '';
  const placeName = place?.name || '';

  const { 
    reviews, 
    loading, 
    submitting, 
    currentPage,
    totalReviews,
    totalPages,
    submitReview,
    nextPage,
    prevPage
  } = usePlaceReviews(placeId, placeName);

  if (!place) return null;

  // Get available photos for carousel
  const availablePhotos = place.photos && place.photos.length > 0 
    ? place.photos 
    : place.image ? [place.image] : [];

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  // AI-generated recommended time based on place category and type
  const getAIRecommendedTime = () => {
    const category = place.category.toLowerCase();
    if (category.includes('tourist') || category.includes('attraction')) {
      return "2-3 hours";
    } else if (category.includes('park')) {
      return "1-2 hours";
    } else if (category.includes('nature')) {
      return "3-4 hours";
    } else if (category.includes('museum')) {
      return "5-6 hours";
    } else if (category.includes('gallery')) {
      return "4-5 hours";
    } else if (category.includes('beach') || category.includes('lake')) {
      return "4-5 hours";
    } else if (category.includes('cafe') || category.includes('restaurant')) {
      return "45-90 minutes";
    } else if (category.includes('hotel') || category.includes('accommodation')) {
      return "Check-in experience";
    } else {
      return "1-2 hours";
    }
  };

  const handleAddToTrip = () => {
    if (onAddToTrip) {
      onAddToTrip();
    } else {
      console.log("Adding to trip:", place.name);
    }
  };

  const handleSubmitReview = async () => {
    const success = await submitReview(userRating, reviewText, isAnonymous);
    if (success) {
      setShowReviewForm(false);
      setReviewText("");
      setUserRating(0);
      setIsAnonymous(false);
    }
  };

  const handleRatingClick = () => {
    setShowReviews(!showReviews);
  };

  // Calculate average rating - avoid artificial fallbacks
  const hasReviews = reviews.length > 0;
  const hasOriginalRating = place.rating && place.rating > 0;
  
  const displayRating = hasReviews 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : hasOriginalRating 
      ? place.rating.toFixed(1)
      : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">{place.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Photo Carousel */}
          {availablePhotos.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                <div className="flex">
                  {availablePhotos.map((photo, index) => (
                    <div key={index} className="flex-shrink-0 w-full relative">
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg overflow-hidden">
                        {typeof photo === 'string' && (photo.startsWith('http') || photo.startsWith('https')) ? (
                          <img 
                            src={photo} 
                            alt={`${place.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-6xl">📍</span></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-6xl">{photo || "📍"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel Controls */}
              {availablePhotos.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 border-white/50"
                    onClick={scrollPrev}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 border-white/50"
                    onClick={scrollNext}
                  >
                    <ChevronRight size={16} />
                  </Button>
                  
                  {/* Photo counter */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {availablePhotos.length} photos
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-6xl">📍</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {displayRating ? (
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={handleRatingClick}
                >
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{displayRating}</span>
                  <span className="text-sm text-gray-500">
                    ({hasReviews ? `${reviews.length} reviews` : 'Google rating'})
                  </span>
                  {showReviews ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-2">
                  No rating available
                </div>
              )}
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {place.category}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin size={16} />
              <span>{place.location}</span>
            </div>

            {/* AI Recommended Time */}
            <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 p-3 rounded-lg">
              <Bot size={16} />
              <div>
                <span className="font-medium text-sm">AI Recommended Time</span>
                <p className="text-sm">{getAIRecommendedTime()}</p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {showReviews && (
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Global Reviews</h4>
                  <span className="text-sm text-gray-500">{totalReviews} reviews</span>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-500">Loading reviews...</span>
                  </div>
                ) : reviews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{review.user_avatar}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{review.user_name}</span>
                                <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    size={12}
                                    className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft size={14} />
                          Previous
                        </Button>
                        
                        <span className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-500">No reviews yet. Be the first to review!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">About</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {place.description || "A wonderful place to visit with amazing experiences and beautiful scenery. Perfect for travelers looking to explore and create memorable moments."}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Clock size={16} className="text-gray-500" />
              <div>
                <span className="font-medium text-sm">Hours</span>
                <p className="text-gray-600 text-sm">{place.hours || "9:00 AM - 6:00 PM"}</p>
              </div>
            </div>

            {place.website && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Globe size={16} className="text-gray-500" />
                  <div className="flex-1">
                    <span className="font-medium text-sm">Website</span>
                    <div className="mt-2">
                      <a 
                        href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline cursor-pointer block mb-2"
                      >
                        Visit Website →
                      </a>
                      {/* Website Preview */}
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <iframe
                          src={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                          className="w-full h-48 border-0"
                          title={`${place.name} website preview`}
                          loading="lazy"
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                          onError={(e) => {
                            // Hide iframe if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            {!isFromSavedPlaces && (
              <Button 
                onClick={handleAddToTrip}
                className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
              >
                <Plus size={16} className="mr-2" />
                Add to Trip
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className={`${isFromSavedPlaces ? 'w-full' : 'flex-1'} border-purple-200 text-purple-700 hover:bg-purple-50`}
            >
              <Edit3 size={16} className="mr-2" />
              Write Review
            </Button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="border-purple-200">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">Write a Review</h4>
                
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">Please sign in to write a review.</p>
                  </div>
                )}

                {user && (
                  <>
                    {/* Star Rating */}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <Star 
                            size={20}
                            className={star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Review Text */}
                    <Textarea
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />

                    {/* Anonymous Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                      <Label>Post anonymously</Label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSubmitReview}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-orange-500"
                        disabled={!reviewText.trim() || userRating === 0 || submitting}
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDetailModal;
