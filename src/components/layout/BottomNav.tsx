import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, MessageSquare, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";

const BottomNav = () => {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuth(!!user);
      if (user) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("read", false);
        setUnreadCount(count || 0);
      }
    };
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/products", icon: Search, label: "Explorer" },
    {
      href: isAuth ? "/create-listing" : "/login",
      icon: PlusSquare,
      label: "Publier",
      isPrimary: true,
    },
    {
      href: isAuth ? "/messages" : "/login",
      icon: MessageSquare,
      label: "Messages",
      badge: unreadCount,
    },
    {
      href: isAuth ? "/profile" : "/login",
      icon: User,
      label: "Profil",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isPrimary) {
            return (
              <Link key={item.href} to={item.href} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 -mt-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[10px] text-blue-600 font-semibold mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-0.5 relative px-3 py-1"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-blue-600" : "text-gray-500"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
