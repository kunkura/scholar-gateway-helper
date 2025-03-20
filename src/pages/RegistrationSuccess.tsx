
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';

const RegistrationSuccess = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/3 -left-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
      </div>
      
      <Link to="/" className="inline-flex items-center gap-2 text-primary font-medium text-xl mb-6">
        <GraduationCap className="w-6 h-6" />
        <span>Student Portal</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg animate-scale-in border-border/50">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Registration Successful</CardTitle>
          <CardDescription>
            Your application has been submitted for review
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p>
            Thank you for registering with the Student Portal. Your application has been received and is now pending approval from our administrative team.
          </p>
          
          <div className="bg-secondary/80 rounded-lg p-4 text-left">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Our administrators will review your submitted documents.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>You'll receive an email notification when your account is approved.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Once approved, you'll have full access to your student portal.</span>
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground">
            This process typically takes 1-2 business days. You can check your registration status at any time by signing in to your account.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button asChild className="w-full">
            <Link to="/login" className="flex items-center justify-center">
              Sign In to Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
