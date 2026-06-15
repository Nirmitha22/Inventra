import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ModuleProvider } from "@/context/ModuleContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Scanner from "@/pages/Scanner";
import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Categories from "@/pages/Categories";
import Locations from "@/pages/Locations";
import Suppliers from "@/pages/Suppliers";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ModuleSelect from "@/pages/ModuleSelect";
import NotFound from "@/pages/NotFound";
import BillingHistoryPage from "@/pages/BillingHistoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ModuleProvider>
            <NotificationProvider>
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Authenticated module picker */}
              <Route
                path="/module-select"
                element={
                  <ProtectedRoute requireModule={false}>
                    <ModuleSelect />
                  </ProtectedRoute>
                }
              />

              {/* Protected app routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/scanner" element={<Scanner />} />
                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/locations" element={<Locations />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/billing-history" element={<BillingHistoryPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </NotificationProvider>
        </ModuleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
