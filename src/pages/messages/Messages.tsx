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
  Home,
  Smile,
  Paperclip,
  Mic,
  Menu,
  X,
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
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-hide conversation list on mobile when selecting a conversation
  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowConversationList(false);
    }
  }, [selectedConversation, isMobile]);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            selectedConversation &&
            newMsg.conversation_id === selectedConversation
          ) {
            setMessages((prev) => [...prev, newMsg]);
            markAsRead([newMsg.id]);
          }
          fetchConversations(); // Refresh conversation list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, currentUserId]);

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchConversations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get conversations where user is either user1 or user2
      const { data: convos, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          user1:profiles!conversations_user1_id_fkey(id, full_name, avatar_url),
          user2:profiles!conversations_user2_id_fkey(id, full_name, avatar_url)
        `
        )
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Process conversations
      const processedConversations: Conversation[] = await Promise.all(
        (convos || []).map(async (convo) => {
          const otherUser =
            convo.user1_id === user.id ? convo.user2 : convo.user1;

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", convo.id)
            .eq("receiver_id", user.id)
            .eq("read", false);

          // Get listing info if exists
          let listingInfo = {};
          if (convo.listing_id && convo.listing_type) {
            const table =
              convo.listing_type === "product" ? "products" : "properties";
            const { data: listing } = await supabase
              .from(table)
              .select("title, price")
              .eq("id", convo.listing_id)
              .single();

            if (listing) {
              listingInfo = {
                listing_title: listing.title,
                listing_price: listing.price,
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
              full_name: otherUser.full_name || "Unknown User",
              avatar_url: otherUser.avatar_url,
            },
            last_message: lastMsg?.content,
            unread_count: unreadCount || 0,
            ...listingInfo,
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);

      // Mark messages as read
      const unreadIds =
        messagesData
          ?.filter((msg) => msg.receiver_id === user.id && !msg.read)
          .map((msg) => msg.id) || [];

      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      .from("messages")
      .update({ read: true })
      .in("id", messageIds);

    if (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const conversation = conversations.find(
      (c) => c.id === selectedConversation
    );
    if (!conversation) return;

    const receiverId = conversation.other_user.id;

    try {
      // Call the send_message function
      const { data, error } = await supabase.rpc("send_message", {
        p_receiver_id: receiverId,
        p_content: newMessage,
        p_listing_id: conversation.listing_id || null,
        p_listing_type: conversation.listing_type || null,
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
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getConversationUser = (conversationId: string) => {
    return conversations.find((c) => c.id === conversationId)?.other_user;
  };

  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
  };

  const handleBackToConversations = () => {
    if (isMobile) {
      setSelectedConversation(null);
      setShowConversationList(true);
    } else {
      setSelectedConversation(null);
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
    <Layout showFooter={!selectedConversation || !isMobile}>
      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
        {/* Mobile Header */}
        {isMobile && (
          <div className="md:hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-4 py-3 flex items-center justify-between">
            {selectedConversation && !showConversationList ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConversations}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        getConversationUser(selectedConversation)?.avatar_url
                      }
                    />
                    <AvatarFallback>
                      {getConversationUser(
                        selectedConversation
                      )?.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {getConversationUser(selectedConversation)?.full_name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationList(true)}
                  className="h-10 w-10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <h1 className="font-bold text-lg">Messages</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationList(false)}
                  className="h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div
            className={`${
              isMobile ? (showConversationList ? "block" : "hidden") : "block"
            } md:block border-r border-gray-200 h-full`}
          >
            <Card className="h-full rounded-none border-0 shadow-sm md:shadow-none">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 md:bg-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800 hidden md:block">
                    Messages
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowConversationList(false)}
                        className="md:hidden"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search conversations..."
                        className="pl-10 bg-white border-gray-300 focus:border-blue-500 w-full md:w-64"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex hover:bg-white/50"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
                <CardContent className="p-0">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 cursor-pointer transition-all duration-200 ${
                        selectedConversation === conversation.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        fetchMessages(conversation.id);
                        if (isMobile) {
                          setShowConversationList(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="border-2 border-white shadow-md">
                            <AvatarImage
                              src={conversation.other_user.avatar_url}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {conversation.other_user.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold truncate text-gray-800 text-sm md:text-base">
                              {conversation.other_user.full_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message ||
                              "Start a conversation..."}
                          </p>
                          {conversation.listing_title && (
                            <div className="flex items-center justify-between mt-2">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border-0"
                              >
                                <span className="flex items-center">
                                  {conversation.listing_type === "product" ? (
                                    <Package className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Home className="h-3 w-3 mr-1" />
                                  )}
                                  <span className="truncate max-w-[120px] md:max-w-[150px]">
                                    {conversation.listing_title}
                                  </span>
                                </span>
                              </Badge>
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
          <div
            className={`${
              isMobile
                ? selectedConversation && !showConversationList
                  ? "block"
                  : "hidden"
                : "block"
            } md:block col-span-1 md:col-span-2 h-full`}
            ref={chatAreaRef}
          >
            {selectedConversation ? (
              <Card className="h-full rounded-none border-0 shadow-sm md:shadow-none flex flex-col">
                {/* Chat Header - Desktop */}
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 hidden md:flex">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-white/50"
                        onClick={handleBackToConversations}
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </Button>
                      <Avatar className="border-2 border-white shadow-md h-10 w-10 md:h-12 md:w-12">
                        <AvatarImage
                          src={
                            getConversationUser(selectedConversation)
                              ?.avatar_url
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm md:text-base">
                          {getConversationUser(
                            selectedConversation
                          )?.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base md:text-lg font-bold text-gray-800">
                          {getConversationUser(selectedConversation)?.full_name}
                        </CardTitle>
                        <p className="text-xs md:text-sm text-green-600 flex items-center gap-1">
                          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                          Online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 hover:bg-white/50"
                      >
                        <Phone className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 hover:bg-white/50"
                      >
                        <Video className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 hover:bg-white/50"
                      >
                        <Info className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <div className="flex-1 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
                  <ScrollArea className="h-full p-3 md:p-6">
                    <div className="space-y-3 md:space-y-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 md:py-12">
                          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <Send className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
                          </div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                            No messages yet
                          </h3>
                          <p className="text-sm md:text-base text-gray-500 max-w-sm mx-auto px-4">
                            Start the conversation by sending your first message
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isCurrentUser =
                            message.sender_id === currentUserId;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isCurrentUser ? "justify-end" : "justify-start"
                              } animate-in fade-in duration-300`}
                            >
                              <div
                                className={`flex max-w-[90%] md:max-w-[80%] ${
                                  isCurrentUser ? "flex-row-reverse" : ""
                                }`}
                              >
                                {/* Avatar (only for received messages) */}
                                {!isCurrentUser && (
                                  <div className="flex-shrink-0 mr-2 md:mr-3 mt-1">
                                    <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-white shadow-sm">
                                      <AvatarImage
                                        src={
                                          getConversationUser(
                                            selectedConversation
                                          )?.avatar_url
                                        }
                                      />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                        {getConversationUser(
                                          selectedConversation
                                        )?.full_name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}

                                {/* Message Bubble */}
                                <div
                                  className={`flex flex-col ${
                                    isCurrentUser ? "items-end" : "items-start"
                                  }`}
                                >
                                  {/* Sender name for received messages */}
                                  {!isCurrentUser && (
                                    <span className="text-xs font-medium text-gray-600 mb-1 ml-1">
                                      {
                                        getConversationUser(
                                          selectedConversation
                                        )?.full_name
                                      }
                                    </span>
                                  )}

                                  <div
                                    className={`relative rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm max-w-full ${
                                      isCurrentUser
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none md:rounded-br-none"
                                        : "bg-gradient-to-br from-gray-100 to-white text-gray-800 rounded-bl-none md:rounded-bl-none border border-gray-200"
                                    }`}
                                  >
                                    {/* Message content */}
                                    <p className="break-words text-sm md:text-base">
                                      {message.content}
                                    </p>

                                    {/* Timestamp and read status */}
                                    <div
                                      className={`flex items-center justify-end gap-1 md:gap-2 mt-1 md:mt-2 text-xs ${
                                        isCurrentUser
                                          ? "text-blue-100"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      <span>
                                        {formatTime(message.created_at)}
                                      </span>
                                      {isCurrentUser &&
                                        (message.read ? (
                                          <CheckCheck className="h-3 w-3 text-blue-200" />
                                        ) : (
                                          <Check className="h-3 w-3 text-blue-200" />
                                        ))}
                                    </div>

                                    {/* Decorative corner */}
                                    <div
                                      className={`absolute bottom-0 ${
                                        isCurrentUser
                                          ? "right-0 translate-x-1"
                                          : "left-0 -translate-x-1"
                                      }`}
                                    >
                                      <div
                                        className={`w-2 h-2 md:w-3 md:h-3 ${
                                          isCurrentUser
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                            : "bg-gradient-to-br from-gray-100 to-white border-r border-b border-gray-200"
                                        }`}
                                        style={{
                                          clipPath: isCurrentUser
                                            ? "polygon(100% 0, 0 0, 100% 100%)"
                                            : "polygon(0 0, 100% 100%, 0 100%)",
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Avatar for sent messages */}
                                {isCurrentUser && (
                                  <div className="flex-shrink-0 ml-2 md:ml-3 mt-1">
                                    <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-white shadow-sm">
                                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-xs">
                                        You
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-3 md:p-4">
                  <div className="flex items-end gap-2">
                    {/* Attachment buttons */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 rounded-full"
                      >
                        <Paperclip className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 rounded-full"
                      >
                        <Smile className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>

                    {/* Message input */}
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="pr-10 md:pr-12 pl-3 md:pl-4 py-4 md:py-6 rounded-xl md:rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm md:text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 md:h-8 md:w-8"
                      >
                        <Mic className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                      </Button>
                    </div>

                    {/* Send button */}
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>

                  {/* Typing indicator */}
                  {selectedConversation && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <span className="truncate">
                        {getConversationUser(selectedConversation)?.full_name}{" "}
                        is typing...
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 md:mb-8 shadow-lg">
                  <Send className="h-16 w-16 md:h-20 md:w-20 text-blue-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 text-center">
                  Your Messages
                </h3>
                <p className="text-gray-600 text-center mb-6 md:mb-8 max-w-sm md:max-w-md px-4 md:px-0">
                  Select a conversation to start messaging, or browse listings
                  to connect with sellers
                </p>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-xs md:max-w-none px-4 md:px-0">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/products")}
                    className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 w-full"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/properties")}
                    className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
