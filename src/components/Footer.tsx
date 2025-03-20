
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary/50 pt-16 pb-8 border-t">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-primary font-medium text-xl">
              <GraduationCap className="w-6 h-6" />
              <span>Student Portal</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A comprehensive platform connecting students and administrators for seamless educational experiences.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Platform</h3>
            <ul className="space-y-2">
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/features" label="Features" />
              <FooterLink to="/pricing" label="Pricing" />
              <FooterLink to="/contact" label="Contact" />
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Resources</h3>
            <ul className="space-y-2">
              <FooterLink to="/blog" label="Blog" />
              <FooterLink to="/documentation" label="Documentation" />
              <FooterLink to="/guides" label="Guides" />
              <FooterLink to="/support" label="Support" />
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Legal</h3>
            <ul className="space-y-2">
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/terms" label="Terms of Service" />
              <FooterLink to="/cookies" label="Cookie Policy" />
              <FooterLink to="/compliance" label="Compliance" />
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Student Portal. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed with precision and care.</p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }: { to: string; label: string }) => {
  return (
    <li>
      <Link 
        to={to} 
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
      </Link>
    </li>
  );
};

const SocialLink = ({ 
  href, 
  icon 
}: { 
  href: string; 
  icon: React.ReactNode 
}) => {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full",
        "text-muted-foreground bg-background border",
        "hover:text-primary hover:border-primary transition-colors"
      )}
    >
      {icon}
    </a>
  );
};

export default Footer;
