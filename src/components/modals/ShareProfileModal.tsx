import { useState } from "react";
import {
  Share,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Link,
  QrCode,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareProfileModal = ({ isOpen, onClose }: ShareProfileModalProps) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = "https://travelapp.com/profile/johndoe";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      bg: "bg-blue-50",
      action: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
          "_blank"
        ),
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      bg: "bg-sky-50",
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check out my travel profile!`,
          "_blank"
        ),
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bg: "bg-pink-50",
      action: () =>
        console.log("Instagram sharing - copy link to share in stories"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="text-purple-600" size={24} />
            <span>Share Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Preview */}
          <Card className="bg-gradient-to-r from-purple-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
                JD
              </div>
              <h3 className="font-semibold text-gray-800">John Doe</h3>
              <p className="text-sm text-gray-600">Travel Enthusiast</p>
              <div className="flex justify-center space-x-4 mt-2 text-sm">
                <span>
                  <strong>8</strong> Countries
                </span>
                <span>
                  <strong>24</strong> Cities
                </span>
                <span>
                  <strong>15</strong> Reviews
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="profile-link">Profile Link</Label>
            <div className="flex space-x-2">
              <Input
                id="profile-link"
                value={profileUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className={copied ? "text-green-600 border-green-200" : ""}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Social Media Share */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.name}
                    variant="outline"
                    onClick={option.action}
                    className={`flex flex-col items-center p-4 h-auto ${option.bg} border-gray-200 hover:border-gray-300`}
                  >
                    <Icon size={24} className={option.color} />
                    <span className="text-xs mt-1 text-gray-700">
                      {option.name}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* QR Code */}
          <Card className="border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <QrCode className="text-purple-600" size={16} />
                <h4 className="font-medium text-gray-800">QR Code</h4>
              </div>
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <QrCode size={48} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Let others scan this QR code to view your profile
              </p>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Privacy:</strong> Only your public travel stats and
              achievements will be visible to others.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileModal;
