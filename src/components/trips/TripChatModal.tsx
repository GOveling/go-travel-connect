import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Users, MapPin } from 'lucide-react';
import { TripLocationsModal } from '@/components/modals/TripLocationsModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TripMessage {
  id: string;
  trip_id: string;
  user_id: string;
  message: string;
  message_type: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface TripChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  collaborators: any[];
}

export const TripChatModal: React.FC<TripChatModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripName,
  collaborators,
}) => {
  const [messages, setMessages] = useState<TripMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!tripId) return;
    
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('trip_messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles using the secure function
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profileData } = await supabase
            .rpc('get_collaborator_profile_safe', { p_user_id: message.user_id });
          
          const userProfile = profileData?.[0];
          
          return {
            ...message,
            user_profile: userProfile ? {
              full_name: userProfile.full_name,
              avatar_url: userProfile.avatar_url,
            } : null,
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('trip_messages')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text',
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!isOpen || !tripId) return;

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`trip_chat_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_messages',
          filter: `trip_id=eq.${tripId}`,
        },
        async (payload) => {
          // Fetch user profile using the secure function
          const { data: profileData } = await supabase
            .rpc('get_collaborator_profile_safe', { p_user_id: payload.new.user_id });

          const userProfile = profileData?.[0];

          const newMessage = {
            ...payload.new,
            user_profile: userProfile ? {
              full_name: userProfile.full_name,
              avatar_url: userProfile.avatar_url,
            } : null,
          } as TripMessage;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Set up presence to track online users
    const presenceChannel = supabase.channel(`trip_presence_${tripId}`, {
      config: { presence: { key: `user_${Math.random()}` } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat().map((user: any) => user.user_id);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await presenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [isOpen, tripId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Grupal - {tripName}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationsModal(true)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Compartir Ubicación
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{collaborators.length + 1} viajeros</span>
              {onlineUsers.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {onlineUsers.length} en línea
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-1">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mb-2" />
                <p>No hay mensajes aún</p>
                <p className="text-xs">¡Sé el primero en escribir algo!</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.user_profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(message.user_profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.user_profile?.full_name || 'Usuario'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || loading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Nested Locations Modal */}
      <TripLocationsModal
        isOpen={showLocationsModal}
        onClose={() => setShowLocationsModal(false)}
        tripId={tripId}
        collaborators={collaborators}
      />
    </>
  );
};