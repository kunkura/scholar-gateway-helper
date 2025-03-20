
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  role: 'student' | 'admin';
  first_name: string | null;
  last_name: string | null;
  approved: boolean | null;
  student_id: string | null;
  phone_number: string | null;
  bio: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isApproved: boolean;
  hasUploadedDocuments: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUploadedDocuments, setHasUploadedDocuments] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isStudent) {
      checkDocuments();
    }
  }, [user, profile]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      console.log('Fetched profile:', data);
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
      if (isStudent) {
        await checkDocuments();
      }
    }
  };

  const checkDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('document_type')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error checking documents:', error);
        throw error;
      }
      
      const hasStudentId = data.some(doc => doc.document_type === 'student_id');
      const hasStudyPermit = data.some(doc => doc.document_type === 'study_permit');
      const hasPhoto = data.some(doc => doc.document_type === 'photo');
      
      setHasUploadedDocuments(hasStudentId && hasStudyPermit && hasPhoto);
    } catch (error) {
      console.error('Error in checkDocuments:', error);
      setHasUploadedDocuments(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Signing in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful:', !!data.user);
      
      // Redirect based on role after profile fetch
      if (data.user) {
        await fetchUserProfile(data.user.id);
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        });
      }
    } catch (error: any) {
      console.error('Sign in catch error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Signing up with:', email, firstName, lastName);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up response:', data);
      
      // Check if email confirmation is required
      if (data.user && data.session) {
        // User is automatically signed in (no email confirmation required)
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully. You are now logged in.",
        });
        
        // Let the auth state listener handle the session update
        // We don't need to manually set the user and session here
      } else {
        // Email confirmation is required
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account",
        });
        
        navigate('/registration-success');
      }
    } catch (error: any) {
      console.error('Sign up catch error:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isStudent = profile?.role === 'student';
  const isApproved = !!profile?.approved;

  const value = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isStudent,
    isApproved,
    hasUploadedDocuments,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
