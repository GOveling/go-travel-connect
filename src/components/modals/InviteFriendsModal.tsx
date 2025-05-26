
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Share2, Send, Copy, Check, X } from "lucide-react";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
}

interface Collaborator {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const InviteFriendsModal = ({ isOpen, onClose, trip }: InviteFriendsModalProps) => {
  const [activeTab, setActiveTab] = useState("invite");
  const [inviteEmail, setInviteEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize collaborators with mock data if trip doesn't have collaborators
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    trip?.collaborators || [
      {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar: "A",
        role: "owner"
      },
      {
        id: 2,
        name: "Bob Smith",
        email: "bob@example.com",
        avatar: "B",
        role: "editor"
      },
      {
        id: 3,
        name: "Carol Davis",
        email: "carol@example.com",
        avatar: "C",
        role: "viewer"
      }
    ]
  );

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      console.log(`Inviting ${inviteEmail} to trip: ${trip?.name}`);
      setInviteEmail("");
      // Here you would typically send an invitation
    }
  };

  const handleCopyLink = () => {
    const shareLink = `https://yourapp.com/trips/${trip?.id}/join`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Functions for collaborator management
  const handleRoleChange = (collaboratorId: number, newRole: string) => {
    setCollaborators(collaborators.map(collaborator => 
      collaborator.id === collaboratorId 
        ? { ...collaborator, role: newRole }
        : collaborator
    ));
  };

  const handleDeleteCollaborator = (collaboratorId: number) => {
    setCollaborators(collaborators.filter(collaborator => collaborator.id !== collaboratorId));
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="text-blue-600" size={24} />
            <span>Manage Trip Collaboration - {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {[
            { id: "invite", label: "Invite Friends", icon: Users },
            { id: "share", label: "Share Itinerary", icon: Share2 }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex-1 ${activeTab === tab.id ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Invite Friends Tab */}
        {activeTab === "invite" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invite by Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Friend's Email</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleInvite}>
                      <Send size={16} className="mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Trip Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={`https://yourapp.com/trips/${trip.id}/join`}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                    {linkCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Anyone with this link can join your trip as a collaborator.
                </p>
              </CardContent>
            </Card>

            {/* Current Collaborators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                          {collaborator.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="text-sm text-gray-600">{collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {collaborator.role !== "owner" ? (
                          <>
                            <Select 
                              value={collaborator.role} 
                              onValueChange={(value) => handleRoleChange(collaborator.id, value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {collaborator.name} from this trip? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCollaborator(collaborator.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {collaborator.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Itinerary Tab */}
        {activeTab === "share" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.dates}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.travelers} travelers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.budget}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{trip.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <textarea
                    id="message"
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    placeholder="Add a personal message to share with your itinerary..."
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Share2 size={16} className="mr-2" />
                    Share via Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Copy size={16} className="mr-2" />
                    Copy Itinerary Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsModal;
