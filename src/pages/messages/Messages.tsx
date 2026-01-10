import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  ChevronLeft,
  User,
  Check,
  CheckCheck,
  Clock,
  Package,
  Home
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  listing_id?: string;
  listing_type?: string;
  last_message_at: string;
  created_at: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  last_message?: string;
  unread_count: number;
  listing_title?: string;
  listing_price?: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Set up real-time subscription for messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user?.id;
          })()}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedConversation && newMsg.conversation_id === selectedConversation) {
            setMessages(prev => [...prev, newMsg]);
            markAsRead([newMsg.id]);
          }
          fetchConversations(); // Refresh conversation list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get conversations where user is either user1 or user2
      const { data: convos, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(id, full_name, avatar_url),
          user2:profiles!conversations_user2_id_fkey(id, full_name, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Process conversations
      const processedConversations: Conversation[] = await Promise.all(
        (convos || []).map(async (convo) => {
          const otherUser = convo.user1_id === user.id ? convo.user2 : convo.user1;
          
          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .eq('receiver_id', user.id)
            .eq('read', false);

          // Get listing info if exists
          let listingInfo = {};
          if (convo.listing_id && convo.listing_type) {
            const table = convo.listing_type === 'product' ? 'products' : 'properties';
            const { data: listing } = await supabase
              .from(table)
              .select('title, price')
              .eq('id', convo.listing_id)
              .single();
            
            if (listing) {
              listingInfo = {
                listing_title: listing.title,
                listing_price: listing.price
              };
            }
          }

          return {
            id: convo.id,
            user1_id: convo.user1_id,
            user2_id: convo.user2_id,
            listing_id: convo.listing_id,
            listing_type: convo.listing_type,
            last_message_at: convo.last_message_at,
            created_at: convo.created_at,
            other_user: {
              id: otherUser.id,
              full_name: otherUser.full_name || 'Unknown User',
              avatar_url: otherUser.avatar_url
            },
            last_message: lastMsg?.content,
            unread_count: unreadCount || 0,
            ...listingInfo
          };
        })
      );

      setConversations(processedConversations);
      
      // Fetch messages for selected conversation
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching conversations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);

      // Mark messages as read
      const unreadIds = messagesData
        ?.filter(msg => msg.receiver_id === user.id && !msg.read)
        .map(msg => msg.id) || [];

      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.other_user.id;

    try {
      // Call the send_message function
      const { data, error } = await supabase.rpc('send_message', {
        p_receiver_id: receiverId,
        p_content: newMessage,
        p_listing_id: conversation.listing_id || null,
        p_listing_type: conversation.listing_type || null
      });

      if (error) throw error;

      setNewMessage("");
      
      // Refresh messages
      fetchMessages(selectedConversation);
      
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getConversationUser = (conversationId: string) => {
    return conversations.find(c => c.id === conversationId)?.other_user;
  };

  const startNewConversation = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === userId) return;

    try {
      // Get or create conversation
      const { data: conversation, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: user.id,
        p_user2_id: userId
      });

      if (error) throw error;

      setSelectedConversation(conversation);
      fetchMessages(conversation);
    } catch (error: any) {
      toast({
        title: "Error starting conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading messages...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className={`border-r ${selectedConversation ? 'hidden md:block' : 'block'}`}>
            <Card className="h-full rounded-none border-0">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Messages</CardTitle>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <CardContent className="p-0">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        fetchMessages(conversation.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conversation.other_user.avatar_url} />
                          <AvatarFallback>
                            {conversation.other_user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold truncate">
                              {conversation.other_user.full_name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                          {conversation.listing_title && (
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs">
                                <span className="flex items-center">
                                  {conversation.listing_type === 'product' ? (
                                    <Package className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Home className="h-3 w-3 mr-1" />
                                  )}
                                  {conversation.listing_title} • ${conversation.listing_price}
                                </span>
                              </Badge>
                              {conversation.unread_count > 0 && (
                                <Badge className="ml-2">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Area */}
          <div className={`col-span-2 ${selectedConversation ? 'block' : 'hidden md:block'}`}>
            {selectedConversation ? (
              <Card className="h-full rounded-none border-0 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Avatar>
                        <AvatarImage src={getConversationUser(selectedConversation)?.avatar_url} />
                        <AvatarFallback>
                          {getConversationUser(selectedConversation)?.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {getConversationUser(selectedConversation)?.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const currentUser = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('currentUser') || '{}') : null;
                      const isCurrentUser = message.sender_id === currentUser?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted rounded-tl-none'
                            }`}
                          >
                            <p>{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span>{formatTime(message.created_at)}</span>
                              {isCurrentUser && (
                                message.read ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Send className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Select a conversation to start messaging, or start a new conversation from a listing
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Browse Products to Message Sellers
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;