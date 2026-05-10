import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase";

export interface Subscription {
  id: string;
  plan: "standard" | "pro";
  status: "pending" | "active" | "cancelled" | "expired";
  expires_at: string;
  amount: number;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSubscription(data);
        setIsSubscribed(true);
      } else {
        setSubscription(null);
        setIsSubscribed(false);
      }
    } catch {
      setSubscription(null);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return { subscription, isSubscribed, loading, refetch: checkSubscription };
};
