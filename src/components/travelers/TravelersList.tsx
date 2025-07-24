import { useState } from "react";
import TravelerCard from "./TravelerCard";
import { travelersData } from "@/data/travelers";

const TravelersList = () => {
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);

  const handleFollow = (userId: string) => {
    setFollowingUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-4">
      {travelersData.map((traveler) => (
        <TravelerCard
          key={traveler.id}
          traveler={traveler}
          isFollowing={followingUsers.includes(traveler.id)}
          onFollow={handleFollow}
        />
      ))}
    </div>
  );
};

export default TravelersList;
