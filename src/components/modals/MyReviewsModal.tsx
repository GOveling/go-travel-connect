
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Star, MapPin, Calendar, User, X } from "lucide-react";
import { useMyReviews } from "@/hooks/useMyReviews";
import { format } from "date-fns";

interface MyReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyReviewsModal = ({ isOpen, onClose }: MyReviewsModalProps) => {
  const { reviews, loading, updateReview, deleteReview } = useMyReviews();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
    anonymous: false
  });

  // Filter reviews based on search criteria
  const filteredReviews = reviews.filter(review => {
    const matchesPlace = review.place_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesComment = review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = searchDate ? 
      format(new Date(review.created_at), 'yyyy-MM-dd') === searchDate : true;
    
    return (matchesPlace || matchesComment) && matchesDate;
  });

  const startEdit = (review: any) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      anonymous: review.anonymous || false
    });
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    
    const success = await updateReview(editingReview.id, {
      rating: editForm.rating,
      comment: editForm.comment,
      anonymous: editForm.anonymous
    });
    
    if (success) {
      setEditingReview(null);
      setEditForm({ rating: 5, comment: "", anonymous: false });
    }
  };

  const handleDelete = async (reviewId: string) => {
    await deleteReview(reviewId);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchDate("");
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>My Reviews</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="text-purple-600" size={24} />
            <span>My Reviews ({reviews.length})</span>
          </DialogTitle>
        </DialogHeader>

        {/* Search Section */}
        <div className="space-y-4 border-b pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by place or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={clearSearch} className="flex items-center space-x-2">
              <X size={16} />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-auto space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {reviews.length === 0 ? "You haven't written any reviews yet" : "No reviews match your search criteria"}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {editingReview?.id === review.id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{review.place_name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span>Editing review</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleUpdate}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingReview(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setEditForm({ ...editForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                size={20}
                                className={star <= editForm.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({editForm.rating}/5)</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="space-y-2">
                        <Label>Comment</Label>
                        <Textarea
                          value={editForm.comment}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          placeholder="Share your experience..."
                          className="resize-none"
                          rows={3}
                        />
                      </div>

                      {/* Anonymous Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editForm.anonymous}
                          onCheckedChange={(checked) => setEditForm({ ...editForm, anonymous: checked })}
                        />
                        <Label>Post anonymously</Label>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{review.place_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span>{review.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(review)}>
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this review? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(review.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <p className="text-gray-700">{review.comment}</p>

                      <div className="flex items-center space-x-2">
                        {review.anonymous && (
                          <Badge variant="secondary" className="text-xs">
                            <User size={10} className="mr-1" />
                            Anonymous
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          <MapPin size={10} className="mr-1" />
                          {review.place_name}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyReviewsModal;
