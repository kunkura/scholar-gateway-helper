
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bell, 
  ChevronDown, 
  FileText, 
  LogOut, 
  Settings, 
  CheckCircle, 
  DownloadCloud, 
  Info, 
  HelpCircle, 
  User, 
  AlertTriangle, 
  FileCheck,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock student data
const studentData = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  studentId: 'ST10023',
  status: 'pending', // pending, approved, rejected
  registrationDate: '2023-06-15',
  documents: [
    { id: 1, name: 'ID Card.pdf', type: 'identity', status: 'uploaded', date: '2023-06-15' },
    { id: 2, name: 'Transcript.pdf', type: 'transcript', status: 'uploaded', date: '2023-06-15' },
    { id: 3, name: 'Certificate.pdf', type: 'additional', status: 'uploaded', date: '2023-06-15' },
  ],
  notes: [
    { id: 1, date: '2023-06-15', text: 'Your registration has been received and is pending admin approval.' },
  ]
};

const Profile = () => {
  const [student, setStudent] = useState(studentData);
  const [progress, setProgress] = useState(30);
  
  useEffect(() => {
    // Calculate progress based on status
    if (student.status === 'pending') {
      setProgress(30);
    } else if (student.status === 'approved') {
      setProgress(100);
    } else if (student.status === 'rejected') {
      setProgress(0);
    }
  }, [student.status]);
  
  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-medium text-xl">
            <GraduationCap className="h-6 w-6" />
            <span>Student Portal</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
              {student.notes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs flex items-center justify-center rounded-full">
                  {student.notes.length}
                </span>
              )}
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={student.name} />
                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{student.name}</span>
                <span className="text-xs text-muted-foreground">{student.email}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Profile */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src="" alt={student.name} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <CardDescription>{student.email}</CardDescription>
                  <div className="mt-2">
                    <Badge 
                      className={cn(
                        student.status === 'pending' && "bg-orange-100 text-orange-600 hover:bg-orange-100",
                        student.status === 'approved' && "bg-green-100 text-green-600 hover:bg-green-100",
                        student.status === 'rejected' && "bg-red-100 text-red-600 hover:bg-red-100"
                      )}
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Registration Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-3">Student Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-medium">{student.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium capitalize">{student.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registered</span>
                        <span className="font-medium">{new Date(student.registrationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Info className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right Column - Registration Status and Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Alert */}
            {student.status === 'pending' && (
              <Alert className="bg-orange-50 text-orange-800 border-orange-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration Pending</AlertTitle>
                <AlertDescription>
                  Your registration is currently being reviewed. This process typically takes 1-2 business days.
                </AlertDescription>
              </Alert>
            )}
            
            {student.status === 'approved' && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Registration Approved</AlertTitle>
                <AlertDescription>
                  Your student account has been approved. You now have full access to all features.
                </AlertDescription>
              </Alert>
            )}
            
            {student.status === 'rejected' && (
              <Alert className="bg-red-50 text-red-800 border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration Rejected</AlertTitle>
                <AlertDescription>
                  Your registration has been rejected. Please check the notes section for details and resubmit your application.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Main Content Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>
                  View your registration status and submitted documents
                </CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="documents" className="w-full">
                <div className="px-6">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="documents" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Courses
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="documents" className="p-6 pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">Identity Document</CardTitle>
                              <CardDescription>Required for verification</CardDescription>
                            </div>
                            <FileCheck className="h-5 w-5 text-green-500" />
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {student.documents.find(doc => doc.type === 'identity') ? (
                            <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">{student.documents.find(doc => doc.type === 'identity')?.name}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <DownloadCloud className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Button variant="outline">Upload Document</Button>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                          Uploaded on {new Date(student.documents.find(doc => doc.type === 'identity')?.date || '').toLocaleDateString()}
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">Academic Transcript</CardTitle>
                              <CardDescription>Required for verification</CardDescription>
                            </div>
                            <FileCheck className="h-5 w-5 text-green-500" />
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {student.documents.find(doc => doc.type === 'transcript') ? (
                            <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">{student.documents.find(doc => doc.type === 'transcript')?.name}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <DownloadCloud className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Button variant="outline">Upload Document</Button>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                          Uploaded on {new Date(student.documents.find(doc => doc.type === 'transcript')?.date || '').toLocaleDateString()}
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">Additional Documents</CardTitle>
                            <CardDescription>Optional supporting documents</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {student.documents.filter(doc => doc.type === 'additional').length > 0 ? (
                          <div className="space-y-2">
                            {student.documents
                              .filter(doc => doc.type === 'additional')
                              .map(doc => (
                                <div key={doc.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 text-primary mr-2" />
                                    <span className="text-sm">{doc.name}</span>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <DownloadCloud className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <p className="text-muted-foreground text-sm mb-2">No additional documents uploaded</p>
                            <Button variant="outline">Upload Document</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="p-6">
                  <div className="space-y-4">
                    {student.notes.length > 0 ? (
                      student.notes.map(note => (
                        <div key={note.id} className="bg-secondary/50 p-4 rounded-lg">
                          <div className="flex items-start mb-2">
                            <Info className="h-5 w-5 text-primary mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">System Notification</p>
                              <p className="text-xs text-muted-foreground">{new Date(note.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="text-sm">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <Info className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <h3 className="text-lg font-medium mb-1">No Notes Yet</h3>
                        <p className="text-muted-foreground">
                          Notes from administrators will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="courses" className="p-6">
                  {student.status === 'approved' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Available Courses</CardTitle>
                            <CardDescription>Courses you can enroll in</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="p-3 border rounded-md hover:border-primary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                                <h4 className="font-medium">Introduction to Computer Science</h4>
                                <p className="text-xs text-muted-foreground">CS101 • 3 Credits</p>
                              </div>
                              <div className="p-3 border rounded-md hover:border-primary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                                <h4 className="font-medium">Calculus I</h4>
                                <p className="text-xs text-muted-foreground">MATH201 • 4 Credits</p>
                              </div>
                              <div className="p-3 border rounded-md hover:border-primary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                                <h4 className="font-medium">Introduction to Psychology</h4>
                                <p className="text-xs text-muted-foreground">PSY101 • 3 Credits</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">My Courses</CardTitle>
                            <CardDescription>Courses you are enrolled in</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col items-center justify-center h-[150px] text-center">
                              <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                              <h3 className="text-lg font-medium mb-1">No Courses Yet</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                You haven't enrolled in any courses
                              </p>
                              <Button>Browse Courses</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-10">
                      <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Account Not Yet Approved</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You need to wait for your account to be approved before you can access and enroll in courses.
                      </p>
                      <Button variant="outline">Check Registration Status</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
