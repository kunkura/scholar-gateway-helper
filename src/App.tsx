
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import NotFound from "./pages/NotFound";

// Admin pages
import FormsPage from "./pages/admin/FormsPage";
import FormBuilder from "./pages/admin/FormBuilder";
import FormResponses from "./pages/admin/FormResponses";

// Student pages
import StudentForms from "./pages/student/Forms";
import StudentFormView from "./pages/student/FormView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            
            {/* Admin routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/forms" element={
              <ProtectedRoute requiredRole="admin">
                <FormsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/forms/new" element={
              <ProtectedRoute requiredRole="admin">
                <FormBuilder />
              </ProtectedRoute>
            } />
            <Route path="/admin/forms/:formId/edit" element={
              <ProtectedRoute requiredRole="admin">
                <FormBuilder />
              </ProtectedRoute>
            } />
            <Route path="/admin/forms/:formId/responses" element={
              <ProtectedRoute requiredRole="admin">
                <FormResponses />
              </ProtectedRoute>
            } />
            
            {/* Student routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/student/forms" element={
              <ProtectedRoute requiredRole="student">
                <StudentForms />
              </ProtectedRoute>
            } />
            <Route path="/student/forms/:formId" element={
              <ProtectedRoute requiredRole="student">
                <StudentFormView />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
