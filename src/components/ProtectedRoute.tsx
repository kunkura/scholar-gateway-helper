
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin';
  requireApproved?: boolean;
  requireDocuments?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireApproved = false,
  requireDocuments = false,
}) => {
  const { user, isLoading, profile, isAdmin, isStudent, isApproved, hasUploadedDocuments, refreshProfile } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Refresh profile on route changes to ensure we have the latest data
  useEffect(() => {
    if (user && !isLoading) {
      refreshProfile();
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole === 'admin' && !isAdmin) {
    toast({
      title: "Access denied",
      description: "You need admin privileges to access this page",
      variant: "destructive",
    });
    return <Navigate to="/profile" replace />;
  }

  if (requiredRole === 'student' && !isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check document upload requirement
  if (requireDocuments && isStudent && !hasUploadedDocuments) {
    toast({
      title: "Documents required",
      description: "Please upload all required documents before proceeding",
      variant: "destructive",
    });
    return <Navigate to="/profile" replace />;
  }

  // Check approval requirement if specified
  if (requireApproved && !isApproved) {
    toast({
      title: "Account not approved",
      description: "Your account needs to be approved before you can access this feature",
      variant: "destructive",
    });
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
