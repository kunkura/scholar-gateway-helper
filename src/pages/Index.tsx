
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';

const Index = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Features</h2>
          <p className="text-muted-foreground">
            Our platform offers a complete set of tools for educational institutions to manage student registrations and approvals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FileCheck className="h-6 w-6" />}
            title="Document Uploads"
            description="Students can easily upload all required documents for verification during the registration process."
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Admin Approvals"
            description="Administrators can review and approve student registrations with a streamlined workflow."
          />
          <FeatureCard 
            icon={<BookOpen className="h-6 w-6" />}
            title="Course Management"
            description="Once approved, students can browse, register, and manage their course selections."
          />
          <FeatureCard 
            icon={<Clock className="h-6 w-6" />}
            title="Real-time Updates"
            description="Get instant notifications about application status changes and approvals."
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6" />}
            title="Role-based Access"
            description="Different permissions and interfaces for students and administrators."
          />
          <FeatureCard 
            icon={<CheckCircle className="h-6 w-6" />}
            title="Verification System"
            description="Secure verification process ensures authenticity of student documents."
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <Card className="overflow-hidden border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 h-full">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const HowItWorksSection = () => {
  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">
            Our simple three-step process gets you from registration to approved student status.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            number={1}
            title="Register Account"
            description="Create your student account with basic information to get started."
          />
          <StepCard 
            number={2}
            title="Upload Documents"
            description="Submit all required verification documents and credentials."
          />
          <StepCard 
            number={3}
            title="Get Approved"
            description="Administrators review and approve your account for full access."
          />
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="relative">
      <div className="bg-white rounded-xl p-8 border border-border/50 h-full flex flex-col">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg mb-4">
          {number}
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        {number < 3 && (
          <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
            <ArrowRight className="h-8 w-8 text-primary/30" />
          </div>
        )}
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">What Users Say</h2>
          <p className="text-muted-foreground">
            See what students and administrators think about our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="The registration process was so smooth! I got approved within 24 hours and could start my classes right away."
            name="Sarah Johnson"
            role="Student"
          />
          <TestimonialCard 
            quote="As an administrator, this platform has significantly reduced the time we spend processing student applications."
            name="Michael Chen"
            role="Admin Officer"
            featured={true}
          />
          <TestimonialCard 
            quote="Document verification used to be a nightmare. Now it's just a few clicks and we can ensure everything is legitimate."
            name="David Smith"
            role="Registrar"
          />
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ 
  quote, 
  name, 
  role, 
  featured = false 
}: { 
  quote: string; 
  name: string; 
  role: string; 
  featured?: boolean;
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden border h-full transition-all duration-300",
        featured 
          ? "border-primary/30 shadow-lg" 
          : "border-border/50 hover:border-primary/20 hover:shadow-md"
      )}
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <div className="text-4xl text-primary/30 mb-4">"</div>
          <p className="italic text-foreground mb-6">{quote}</p>
        </div>
        <div className="flex items-center mt-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-medium">
            {name.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-6 bg-primary/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join our platform today and experience the smooth process of student registration and approval.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/register">Create Student Account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Index;
