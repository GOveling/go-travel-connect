
export interface InstaTripImage {
  id: string;
  src: string;
  addedAt: number;
  text?: string;
  location?: string;
  tripId?: number;
}

export interface ProfilePost {
  id: string;
  images: string[];
  text: string;
  createdAt: number;
  location?: string;
  tripId?: number;
}

export interface FriendPublication {
  id: string;
  friendName: string;
  friendAvatar?: string;
  images: string[];
  text: string;
  createdAt: number;
  location?: string;
  likes: number;
  comments: number;
  liked: boolean;
}
