import { useState } from "react";
import { X, UserPlus, Share2, DollarSign, Vote, Users, Mail, Link, Copy, Check, Globe, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  image: string;
}

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

const InviteFriendsModal = ({ isOpen, onClose, trip }: InviteFriendsModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("invite");
  const [inviteEmails, setInviteEmails] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [shareSettings, setShareSettings] = useState({
    allowEditing: true,
    allowInviting: false,
    publicLink: false
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [costSplitItems, setCostSplitItems] = useState([
    { id: 1, name: "Flights", amount: 800, splitType: "equal", paidBy: "You" },
    { id: 2, name: "Hotel", amount: 1200, splitType: "equal", paidBy: "Alice" },
    { id: 3, name: "Car Rental", amount: 300, splitType: "custom", paidBy: "Bob" }
  ]);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "" });
  const [groupDecisions, setGroupDecisions] = useState([
    { 
      id: 1, 
      title: "Which restaurant for dinner on Day 2?", 
      options: ["Le Bernardin", "Eleven Madison Park", "Per Se"], 
      votes: { "Le Bernardin": 2, "Eleven Madison Park": 1, "Per Se": 1 },
      status: "active",
      endDate: "Dec 10, 2024"
    },
    { 
      id: 2, 
      title: "Activity for Saturday morning?", 
      options: ["Central Park Walk", "Museum Visit", "Shopping"], 
      votes: { "Central Park Walk": 3, "Museum Visit": 1, "Shopping": 0 },
      status: "completed",
      endDate: "Dec 8, 2024"
    }
  ]);
  const [newDecision, setNewDecision] = useState({
    title: "",
    options: ["", ""],
    endDate: ""
  });

  if (!trip) return null;

  const mockCollaborators = [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", avatar: "AJ", role: "editor", status: "joined" },
    { id: "2", name: "Bob Smith", email: "bob@example.com", avatar: "BS", role: "editor", status: "pending" },
    { id: "3", name: "Carol Davis", email: "carol@example.com", avatar: "CD", role: "viewer", status: "joined" }
  ];

  const handleSendInvites = () => {
    if (!inviteEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
    toast({
      title: "Invitations Sent!",
      description: `Sent ${emails.length} invitation${emails.length > 1 ? 's' : ''} for ${trip.name}`
    });
    setInviteEmails("");
    setPersonalMessage("");
  };

  const handleCopyLink = () => {
    const shareLink = `https://travelapp.com/trip/${trip.id}/join?token=abc123`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Share link has been copied to clipboard"
    });
  };

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    
    const expense = {
      id: Date.now(),
      name: newExpense.name,
      amount: parseFloat(newExpense.amount),
      splitType: "equal",
      paidBy: "You"
    };
    
    setCostSplitItems([...costSplitItems, expense]);
    setNewExpense({ name: "", amount: "" });
    toast({
      title: "Expense Added",
      description: `${newExpense.name} has been added to the trip expenses`
    });
  };

  const handleCreateDecision = () => {
    if (!newDecision.title || newDecision.options.some(opt => !opt.trim())) return;
    
    const validOptions = newDecision.options.filter(opt => opt.trim());
    const initialVotes: Record<string, number> = {};
    validOptions.forEach(option => {
      initialVotes[option] = 0;
    });
    
    const decision = {
      id: Date.now(),
      title: newDecision.title,
      options: validOptions,
      votes: initialVotes,
      status: "active",
      endDate: newDecision.endDate
    };
    
    setGroupDecisions([decision, ...groupDecisions]);
    setNewDecision({ title: "", options: ["", ""], endDate: "" });
    toast({
      title: "Decision Created",
      description: "Group members can now vote on this decision"
    });
  };

  const getTotalExpenses = () => {
    return costSplitItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getMyShare = () => {
    const collaboratorCount = mockCollaborators.filter(c => c.status === "joined").length + 1; // +1 for current user
    return getTotalExpenses() / collaboratorCount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
            <Users className="text-blue-600" size={24} />
            <span>Invite Friends to {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invite">Invite & Share</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="costs">Split Costs</TabsTrigger>
            <TabsTrigger value="decisions">Group Decisions</TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-6 mt-6">
            {/* Email Invitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail size={20} className="text-blue-600" />
                  <span>Send Email Invitations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emails">Email Addresses (comma separated)</Label>
                  <Input
                    id="emails"
                    placeholder="friend1@email.com, friend2@email.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Hey! Want to join me on this amazing trip?"
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSendInvites} className="bg-gradient-to-r from-blue-500 to-orange-500">
                  <UserPlus size={16} className="mr-2" />
                  Send Invitations
                </Button>
              </CardContent>
            </Card>

            {/* Share Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link size={20} className="text-green-600" />
                  <span>Share Trip Link</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Allow editing permissions</Label>
                    <Switch
                      checked={shareSettings.allowEditing}
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, allowEditing: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow inviting others</Label>
                    <Switch
                      checked={shareSettings.allowInviting}
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, allowInviting: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Public link (anyone with link can view)</Label>
                    <Switch
                      checked={shareSettings.publicLink}
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, publicLink: checked})}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {shareSettings.publicLink ? <Globe size={16} className="text-green-600" /> : <Lock size={16} className="text-gray-600" />}
                    <span className="text-sm text-gray-700">
                      {shareSettings.publicLink ? "Public link" : "Private link"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className={linkCopied ? "text-green-600" : ""}
                  >
                    {linkCopied ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4 mt-6">
            <div className="space-y-4">
              {mockCollaborators.map((collaborator) => (
                <Card key={collaborator.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                          {collaborator.avatar}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{collaborator.name}</h5>
                          <p className="text-gray-600 text-sm">{collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={collaborator.status === "joined" ? "default" : "secondary"}>
                          {collaborator.status}
                        </Badge>
                        <Badge variant="outline">{collaborator.role}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6 mt-6">
            {/* Cost Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">${getTotalExpenses()}</p>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">${getMyShare().toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Your Share</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{mockCollaborators.filter(c => c.status === "joined").length + 1}</p>
                    <p className="text-sm text-gray-600">People</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add New Expense */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign size={20} className="text-green-600" />
                  <span>Add New Expense</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expenseName">Expense Name</Label>
                    <Input
                      id="expenseName"
                      placeholder="e.g., Restaurant dinner"
                      value={newExpense.name}
                      onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseAmount">Amount ($)</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleAddExpense} className="bg-green-600 hover:bg-green-700">
                  Add Expense
                </Button>
              </CardContent>
            </Card>

            {/* Expenses List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Current Expenses</h4>
              {costSplitItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">{item.name}</h5>
                        <p className="text-sm text-gray-600">Paid by {item.paidBy}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">${item.amount}</p>
                        <p className="text-sm text-gray-600">Split {item.splitType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="decisions" className="space-y-6 mt-6">
            {/* Create New Decision */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Vote size={20} className="text-purple-600" />
                  <span>Create Group Decision</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="decisionTitle">Decision Title</Label>
                  <Input
                    id="decisionTitle"
                    placeholder="What should we decide on?"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision({...newDecision, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {newDecision.options.map((option, index) => (
                    <Input
                      key={index}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newDecision.options];
                        newOptions[index] = e.target.value;
                        setNewDecision({...newDecision, options: newOptions});
                      }}
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewDecision({...newDecision, options: [...newDecision.options, ""]})}
                  >
                    Add Option
                  </Button>
                </div>
                <div>
                  <Label htmlFor="endDate">Voting End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newDecision.endDate}
                    onChange={(e) => setNewDecision({...newDecision, endDate: e.target.value})}
                  />
                </div>
                <Button onClick={handleCreateDecision} className="bg-purple-600 hover:bg-purple-700">
                  Create Decision
                </Button>
              </CardContent>
            </Card>

            {/* Existing Decisions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Group Decisions</h4>
              {groupDecisions.map((decision) => (
                <Card key={decision.id} className={`border-l-4 ${decision.status === 'active' ? 'border-l-purple-500' : 'border-l-gray-400'}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-800">{decision.title}</h5>
                        <Badge variant={decision.status === 'active' ? 'default' : 'secondary'}>
                          {decision.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {decision.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{option}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{decision.votes[option] || 0} votes</span>
                              {decision.status === 'active' && (
                                <Button size="sm" variant="outline">Vote</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">Ends: {decision.endDate}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsModal;
