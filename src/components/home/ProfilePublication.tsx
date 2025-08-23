
import { MapPin, Plus, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfilePost, ProfilePublicationProps } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

const ProfilePublication = ({
  posts,
  onProfilePublicationClick,
  onAddToTrip,
  formatTimeAgo,
}: ProfilePublicationProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{t("home.profilePublication.title")}</CardTitle>
        <Button
          onClick={onProfilePublicationClick}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          <Plus size={16} className="mr-1" />
          {t("home.profilePublication.addPost")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <Share size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">{t("home.profilePublication.noPublications")}</p>
            <p className="text-xs text-gray-400">
              {t("home.profilePublication.shareMemories")}
            </p>
          </div>
        ) : (
          posts.slice(0, 3).map((post) => (
            <div key={post.id} className="border rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {post.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
                {post.images.length > 3 && (
                  <div className="relative">
                    <img
                      src={post.images[3]}
                      alt="More images"
                      className="w-full h-20 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{post.images.length - 3}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700">{post.text}</p>
              {post.location && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span>{post.location}</span>
                      {post.tripId && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          {t("home.profilePublication.addedToTrip")}
                        </span>
                      )}
                    </div>
                    {!post.tripId && (
                      <Button
                        onClick={() => onAddToTrip(post)}
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus size={12} className="mr-1" />
                        {t("home.profilePublication.addToTrip")}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          ))
        )}
        {posts.length > 3 && (
          <Button variant="outline" className="w-full">
            {t("home.profilePublication.viewAllPublications")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePublication;
