
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DocumentUploader from '@/components/DocumentUploader';
import PaymentUploader from '@/components/PaymentUploader';

const Profile = () => {
  const { user, profile, signOut, isApproved } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<{[key: string]: boolean}>({
    studentId: false,
    studyPermit: false,
    photo: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setStudentId(profile.student_id || '');
      setPhoneNumber(profile.phone_number || '');
      checkUploadedDocuments();
    }
  }, [profile]);

  const checkUploadedDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('document_type')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const uploaded = {
        studentId: false,
        studyPermit: false,
        photo: false
      };
      
      data.forEach(doc => {
        if (doc.document_type === 'student_id') uploaded.studentId = true;
        if (doc.document_type === 'study_permit') uploaded.studyPermit = true;
        if (doc.document_type === 'photo') uploaded.photo = true;
      });
      
      setRequiredDocuments(uploaded);
    } catch (error) {
      console.error('Error checking documents:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          bio: bio,
          student_id: studentId,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleDocumentUpload = () => {
    checkUploadedDocuments();
  };
  
  const areAllDocumentsUploaded = () => {
    return requiredDocuments.studentId && 
           requiredDocuments.studyPermit && 
           requiredDocuments.photo;
  };
  
  return (
    <div className="min-h-screen bg-secondary/30 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src="" alt={`${firstName} ${lastName}`} />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <CardTitle>{firstName} {lastName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              
              <div className="mt-2">
                {isApproved ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Pending Approval
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Student ID: </span>
                  <span className="font-medium">{studentId || 'Not provided'}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">{phoneNumber || 'Not provided'}</span>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="mb-2 font-medium">Required Documents</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center">
                      <span>Student ID</span>
                      {requiredDocuments.studentId ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Study Permit</span>
                      {requiredDocuments.studyPermit ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Personal Photo</span>
                      {requiredDocuments.photo ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </CardFooter>
          </Card>
          
          {/* Profile Form Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input 
                      id="first-name" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input 
                      id="last-name" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input 
                    id="student-id" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)} 
                    placeholder="e.g., ST12345" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="e.g., +1 (123) 456-7890" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell us about yourself" 
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t px-6 py-4 bg-secondary/10">
              <Button onClick={handleSaveProfile} disabled={isLoading} className="ml-auto">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Document Upload Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Required Documents</h2>
          <p className="text-muted-foreground">
            Please upload the following required documents to complete your registration.
            Your account will be reviewed by an administrator once all documents are submitted.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DocumentUploader
              documentType="student_id"
              onUploadComplete={handleDocumentUpload}
              title="Student ID Card"
              description="Upload a scan or photo of your official student ID card"
            />
            
            <DocumentUploader
              documentType="study_permit"
              onUploadComplete={handleDocumentUpload}
              title="Study Permit"
              description="Upload your study permit or equivalent document"
            />
            
            <DocumentUploader
              documentType="photo"
              onUploadComplete={handleDocumentUpload}
              title="Personal Photo"
              description="Upload a recent passport-style photo of yourself"
            />
          </div>
          
          {!areAllDocumentsUploaded() && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Required documents missing</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    You must upload all required documents to complete your registration.
                    Your account will remain pending until an administrator approves your documents.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Monthly Payment Section - Only show for approved students */}
        {isApproved && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Monthly Subscription</h2>
            <p className="text-muted-foreground">
              Upload your monthly subscription payment proof to maintain your active status.
            </p>
            
            <PaymentUploader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
