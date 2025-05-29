
import CommunityStats from "../travelers/CommunityStats";
import TravelersList from "../travelers/TravelersList";
import LoadMoreButton from "../travelers/LoadMoreButton";

const TravelersSection = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Travel Community</h3>
        <p className="text-gray-600">Connect with fellow travelers and discover new adventures</p>
      </div>

      {/* Community Stats */}
      <CommunityStats />

      {/* Travelers List */}
      <TravelersList />

      {/* Load More */}
      <LoadMoreButton />
    </div>
  );
};

export default TravelersSection;
