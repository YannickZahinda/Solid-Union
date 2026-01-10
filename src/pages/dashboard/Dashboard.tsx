import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PlusCircle, 
  ShoppingBag, 
  Home, 
  Bell, 
  MessageSquare,
  TrendingUp,
  Users,
  Package,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface DashboardStats {
  totalListings: number;
  totalViews: number;
  totalMessages: number;
  profileCompletion: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0,
    profileCompletion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('completion_percentage')
        .eq('id', user.id)
        .single();

      // Count user's listings
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalListings: (productsCount || 0) + (propertiesCount || 0),
        totalViews: 0, // You can implement view tracking later
        totalMessages: 0, // Implement messaging system
        profileCompletion: profile?.completion_percentage || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create New Listing",
      description: "Sell a product or property",
      icon: PlusCircle,
      link: "/create-listing",
      color: "bg-gradient-to-br from-blue-500 to-purple-600"
    },
    {
      title: "View My Listings",
      description: "Manage your active listings",
      icon: ShoppingBag,
      link: "/my-listings",
      color: "bg-gradient-to-br from-green-500 to-teal-600"
    },
    {
      title: "Browse Properties",
      description: "Find properties to buy or rent",
      icon: Home,
      link: "/properties",
      color: "bg-gradient-to-br from-orange-500 to-red-600"
    },
    {
      title: "Browse Products",
      description: "Discover products for sale",
      icon: Package,
      link: "/products",
      color: "bg-gradient-to-br from-purple-500 to-pink-600"
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your account.
            </p>
          </div>
          <Button asChild>
            <Link to="/create-listing">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>

        {/* Profile Completion Alert */}
        {stats.profileCompletion < 100 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">
                      Complete your profile
                    </h3>
                    <p className="text-sm text-amber-700">
                      Complete your profile to increase trust and get better recommendations
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Progress value={stats.profileCompletion} className="h-2 w-32" />
                      <span className="text-sm font-medium">{stats.profileCompletion}%</span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" className="border-amber-300 text-amber-700">
                  <Link to="/profile">Complete Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                  <h3 className="text-2xl font-bold">{stats.totalListings}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <h3 className="text-2xl font-bold">{stats.totalViews}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messages</p>
                  <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Complete</p>
                  <h3 className="text-2xl font-bold">{stats.profileCompletion}%</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Link to={action.link} className="block">
                    <div className="space-y-3">
                      <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.totalListings === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium">No activity yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first listing to get started
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/create-listing">Create Listing</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Profile Updated</p>
                          <p className="text-sm text-muted-foreground">Your profile is {stats.profileCompletion}% complete</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">Today</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Tips & Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border">
                <h4 className="font-medium mb-1">📸 Add Profile Picture</h4>
                <p className="text-sm text-muted-foreground">
                  Profiles with photos get 5x more views
                </p>
              </div>
              
              <div className="p-3 rounded-lg border">
                <h4 className="font-medium mb-1">🏷️ Add More Interests</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations based on your interests
                </p>
              </div>
              
              <div className="p-3 rounded-lg border">
                <h4 className="font-medium mb-1">📱 Verify Phone Number</h4>
                <p className="text-sm text-muted-foreground">
                  Build trust with potential buyers/sellers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;