import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Products from "./pages/products/Products";
import Properties from "./pages/properties/Properties";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

import ProtectedRoute from "./components/ProtectedRoute";

// Updated pages
import Dashboard from "./pages/dashboard/Dashboard";
import CompleteProfile from "./pages/auth/CompleteProfile";
import CreateListing from "./pages/listing/CreateListing";
import MyListings from "./pages/listing/MyListings";
import Messages from "./pages/messages/Messages";
import Profile from "./pages/profile/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireProfileComplete={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute requireProfileComplete={false}>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-listing"
          element={
            <ProtectedRoute requireProfileComplete={true}>
              <CreateListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings"
          element={
            <ProtectedRoute requireProfileComplete={true}>
              <MyListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute requireProfileComplete={true}>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute requireProfileComplete={true}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
