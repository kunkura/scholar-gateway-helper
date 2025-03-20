
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = containerRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,122,255,0.05)_0%,rgba(0,0,0,0)_100%)] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 py-28 md:py-36 lg:py-48">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="inline-block animate-on-scroll opacity-0" style={{ animationDelay: '100ms' }}>
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Student Portal Platform
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-on-scroll opacity-0" style={{ animationDelay: '200ms' }}>
                Streamlined <br className="hidden sm:block" />
                <span className="text-primary">Education Management</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mt-4 animate-on-scroll opacity-0" style={{ animationDelay: '300ms' }}>
                A comprehensive platform connecting students and administrators for seamless educational experiences.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 animate-on-scroll opacity-0" style={{ animationDelay: '400ms' }}>
              <Button size="lg" asChild>
                <Link to="/register" className="group">
                  Get Started 
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
            
            <div className="pt-4 animate-on-scroll opacity-0" style={{ animationDelay: '500ms' }}>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-8 text-sm">
                <FeatureCheck text="Easy registration" />
                <FeatureCheck text="Document uploads" />
                <FeatureCheck text="Admin approvals" />
              </div>
            </div>
          </div>
          
          {/* Image/Visual */}
          <div className="relative animate-on-scroll opacity-0" style={{ animationDelay: '600ms' }}>
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 z-10 pointer-events-none"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border shadow-lg transform transition-all hover:scale-[1.01] duration-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-500"></div>
                    <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    <div className="ml-auto text-xs text-gray-400">Student Portal</div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-100 rounded-md w-2/3"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded-md w-full"></div>
                      <div className="h-3 bg-gray-100 rounded-md w-5/6"></div>
                      <div className="h-3 bg-gray-100 rounded-md w-4/6"></div>
                    </div>
                    <div className="h-10 bg-primary/10 rounded-md w-1/3 ml-auto flex items-center justify-center">
                      <span className="text-xs text-primary font-medium">Submit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <FloatingElement 
              className="absolute -top-4 -right-4 md:top-8 md:-right-8 w-20 h-20 bg-blue-100 opacity-80"
              delay={800}
            />
            <FloatingElement 
              className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 w-24 h-24 bg-primary/10 rounded-full"
              delay={1000}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCheck = ({ text }: { text: string }) => (
  <div className="flex items-center">
    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
    <span>{text}</span>
  </div>
);

const FloatingElement = ({ 
  className, 
  delay = 0 
}: { 
  className: string; 
  delay?: number 
}) => {
  return (
    <div 
      className={cn(
        "rounded-lg animate-on-scroll opacity-0",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'float 6s ease-in-out infinite'
      }}
    />
  );
};

export default Hero;
