
import { useState } from "react";
import { Star, MapPin, Clock, Globe, Phone, Plus, Edit3, X, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface PlaceDetailModalProps {
  place: {
    name: string;
    location: string;
    rating: number;
    image: string;
    category: string;
    description?: string;
    hours?: string;
    website?: string;
    phone?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isFromSavedPlaces?: boolean;
  onAddToTrip?: () => void;
}

// Mock reviews data - in a real app, this would come from an API
const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Sarah Johnson",
    userAvatar: "👩‍💼",
    rating: 5,
    comment: "Absolutely breathtaking! The sunset views are incredible and worth every minute of the visit. Perfect spot for photography.",
    date: "2024-01-15",
    helpful: 12
  },
  {
    id: "2",
    userName: "Miguel Rodriguez",
    userAvatar: "👨‍🎨",
    rating: 4,
    comment: "Beautiful place but can get very crowded during peak hours. I recommend visiting early morning for the best experience.",
    date: "2024-01-10",
    helpful: 8
  },
  {
    id: "3",
    userName: "Emma Chen",
    userAvatar: "👩‍🔬",
    rating: 5,
    comment: "A must-visit destination! The atmosphere is magical and the views are unforgettable. Bring a camera!",
    date: "2024-01-08",
    helpful: 15
  },
  {
    id: "4",
    userName: "Alex Thompson",
    userAvatar: "👨‍💻",
    rating: 4,
    comment: "Great place with amazing scenery. The facilities are well-maintained and staff is friendly.",
    date: "2024-01-05",
    helpful: 6
  }
];

const PlaceDetailModal = ({ place, isOpen, onClose, isFromSavedPlaces = false, onAddToTrip }: PlaceDetailModalProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);

  if (!place) return null;

  // AI-generated recommended time based on place category and type
  const getAIRecommendedTime = () => {
    const category = place.category.toLowerCase();
    if (category.includes('tourist') || category.includes('attraction')) {
      return "2-3 hours";
    } else if (category.includes('park') || category.includes('nature')) {
      return "1-2 hours";
    } else if (category.includes('cafe') || category.includes('restaurant')) {
      return "45-90 minutes";
    } else if (category.includes('hotel') || category.includes('accommodation')) {
      return "Check-in experience";
    } else if (category.includes('museum') || category.includes('gallery')) {
      return "1.5-2.5 hours";
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

  const handleSubmitReview = () => {
    // TODO: Implement review submission
    console.log("Submitting review:", { text: reviewText, rating: userRating });
    setShowReviewForm(false);
    setReviewText("");
    setUserRating(0);
  };

  const handleRatingClick = () => {
    setShowReviews(!showReviews);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">{place.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Place Image */}
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-6xl">{place.image}</span>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={handleRatingClick}
              >
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{place.rating}</span>
                <span className="text-sm text-gray-500">({mockReviews.length} reviews)</span>
                {showReviews ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
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
                  <span className="text-sm text-gray-500">{mockReviews.length} reviews</span>
                </div>
                
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{review.userAvatar}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{review.userName}</span>
                            <span className="text-xs text-gray-500">{review.date}</span>
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
                          <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex items-center space-x-2">
                            <button className="text-xs text-gray-500 hover:text-purple-600">
                              👍 Helpful ({review.helpful})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="flex items-center space-x-3">
                <Globe size={16} className="text-gray-500" />
                <div>
                  <span className="font-medium text-sm">Website</span>
                  <p className="text-blue-600 text-sm hover:underline cursor-pointer">
                    {place.website}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Phone size={16} className="text-gray-500" />
              <div>
                <span className="font-medium text-sm">Contact</span>
                <p className="text-gray-600 text-sm">{place.phone || "+1 (555) 123-4567"}</p>
              </div>
            </div>
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

                {/* Submit Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSubmitReview}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-orange-500"
                    disabled={!reviewText.trim() || userRating === 0}
                  >
                    Submit Review
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDetailModal;
