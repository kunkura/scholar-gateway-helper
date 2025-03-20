
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, FileText, GraduationCap, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    bio: '',
    phoneNumber: '',
    identityDoc: null as File | null,
    transcriptDoc: null as File | null,
    additionalDocs: [] as File[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (fieldName === 'additionalDocs') {
        setFormData({
          ...formData,
          additionalDocs: [...formData.additionalDocs, ...Array.from(files)]
        });
      } else {
        setFormData({
          ...formData,
          [fieldName]: files[0]
        });
      }
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.studentId) {
      setError('Please enter your student ID');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.identityDoc || !formData.transcriptDoc) {
      setError('Please upload the required documents');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevious = () => {
    setError('');
    setStep(step === 3 ? 2 : 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep3()) {
      return;
    }
    
    setIsLoading(true);

    // Simulating registration process (will be replaced with Supabase auth)
    try {
      setTimeout(() => {
        toast({
          title: "Registration submitted",
          description: "Your account is pending admin approval",
        });
        setIsLoading(false);
        navigate('/registration-success');
      }, 1500);
    } catch (error) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
      </div>
      
      <Link to="/" className="inline-flex items-center gap-2 text-primary font-medium text-xl mb-6">
        <GraduationCap className="w-6 h-6" />
        <span>Student Portal</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg animate-scale-in border-border/50 mb-6">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>
            Create your account to get started with the student portal
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <StepIndicator step={1} currentStep={step} label="Account" />
              <StepDivider active={step >= 2} />
              <StepIndicator step={2} currentStep={step} label="Profile" />
              <StepDivider active={step >= 3} />
              <StepIndicator step={3} currentStep={step} label="Documents" />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start mb-4">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Account Information */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}
            
            {/* Step 2: Profile Information */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g. ST12345"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Brief Bio (Optional)</Label>
                  <Textarea 
                    id="bio" 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a bit about yourself..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </>
            )}
            
            {/* Step 3: Document Uploads */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="identityDoc">ID Document (Required)</Label>
                  <DocumentUpload 
                    id="identityDoc"
                    name="identityDoc"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'identityDoc')}
                    file={formData.identityDoc}
                    description="Upload a scanned copy of your ID card or passport"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transcriptDoc">Academic Transcript (Required)</Label>
                  <DocumentUpload 
                    id="transcriptDoc"
                    name="transcriptDoc"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'transcriptDoc')}
                    file={formData.transcriptDoc}
                    description="Upload your most recent academic transcript"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalDocs">Additional Documents (Optional)</Label>
                  <DocumentUpload 
                    id="additionalDocs"
                    name="additionalDocs"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'additionalDocs')}
                    multiple
                    description="Upload any additional relevant documents"
                    fileList={formData.additionalDocs}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>All documents will be reviewed by our admin team for verification.</p>
                </div>
              </>
            )}
            
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Registration"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="block text-center pt-0">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ 
  step, 
  currentStep, 
  label 
}: { 
  step: number; 
  currentStep: number; 
  label: string 
}) => {
  const isActive = currentStep >= step;
  const isCurrentStep = currentStep === step;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 transition-all",
          isActive 
            ? "bg-primary text-white" 
            : "bg-muted text-muted-foreground",
          isCurrentStep && "ring-4 ring-primary/20"
        )}
      >
        {step}
      </div>
      <span className={cn(
        "text-xs font-medium",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};

// Step Divider Component
const StepDivider = ({ active }: { active: boolean }) => {
  return (
    <div className="flex-1 h-0.5 mx-2">
      <div 
        className={cn(
          "h-full transition-all",
          active ? "bg-primary" : "bg-muted"
        )}
      />
    </div>
  );
};

// Document Upload Component
const DocumentUpload = ({ 
  id, 
  name, 
  accept, 
  onChange, 
  file, 
  fileList, 
  description, 
  multiple, 
  required 
}: { 
  id: string; 
  name: string; 
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  file?: File | null;
  fileList?: File[];
  description?: string;
  multiple?: boolean;
  required?: boolean;
}) => {
  return (
    <div className="border rounded-md">
      <label 
        htmlFor={id}
        className={cn(
          "flex flex-col items-center justify-center p-4 text-center cursor-pointer",
          "hover:bg-secondary transition-colors"
        )}
      >
        <Input 
          id={id} 
          name={name}
          type="file" 
          accept={accept}
          onChange={onChange}
          multiple={multiple}
          className="sr-only"
          required={required}
        />
        
        {!file && (!fileList || fileList.length === 0) ? (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm font-medium">
              {multiple ? 'Upload files' : 'Upload file'}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {accept.split(',').join(', ')}
            </p>
          </>
        ) : (
          <div className="w-full">
            {file && (
              <div className="flex items-center p-2 bg-secondary/50 rounded mb-2">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm truncate">{file.name}</span>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            )}
            
            {fileList && fileList.length > 0 && (
              <div className="space-y-2">
                {fileList.map((file, index) => (
                  <div key={index} className="flex items-center p-2 bg-secondary/50 rounded">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm truncate">{file.name}</span>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs text-primary mt-2">
              {multiple ? 'Click to add more files' : 'Click to replace file'}
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default Register;
