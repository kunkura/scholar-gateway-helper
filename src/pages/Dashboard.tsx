
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { 
  Bell, 
  ChevronDown, 
  FileText, 
  LogOut, 
  Search, 
  Settings, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  DownloadCloud,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('pending');
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
  const [rejectedStudents, setRejectedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentDocuments, setStudentDocuments] = useState<any[]>([]);
  
  useEffect(() => {
    fetchStudents();
  }, [currentTab]);
  
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentDocuments(selectedStudent.id);
    } else {
      setStudentDocuments([]);
    }
  }, [selectedStudent]);
  
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch all student profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
        
      if (error) throw error;
      
      // Get user emails
      const userIds = profiles.map(profile => profile.id);
      const { data: users, error: usersError } = await supabase
        .from('auth')
        .select('id, email')
        .in('id', userIds);
        
      if (usersError) {
        console.error("Error fetching user emails:", usersError);
      }
      
      // Combine profile data with email
      const studentsWithEmails = profiles.map(profile => {
        const userEmail = users?.find(u => u.id === profile.id)?.email || 'Email not found';
        return {
          ...profile,
          email: userEmail,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User'
        };
      });
      
      // Filter students by status
      const pending = studentsWithEmails.filter(s => s.approved === false || s.approved === null);
      const approved = studentsWithEmails.filter(s => s.approved === true);
      
      setPendingStudents(pending);
      setApprovedStudents(approved);
      setRejectedStudents([]); // We don't have rejected status yet
      
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStudentDocuments = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', studentId);
        
      if (error) throw error;
      
      setStudentDocuments(data || []);
    } catch (error) {
      console.error('Error fetching student documents:', error);
      setStudentDocuments([]);
    }
  };
  
  // Function to handle student selection for detail view
  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
  };
  
  // Function to approve a student
  const handleApproveStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', studentId);
        
      if (error) throw error;
      
      // Update local state
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      const approvedStudent = pendingStudents.find(s => s.id === studentId);
      if (approvedStudent) {
        approvedStudent.approved = true;
        setApprovedStudents(prev => [...prev, approvedStudent]);
      }
      
      toast({
        title: "Student approved",
        description: "The student has been successfully approved",
      });
      
      // Reset selection after approval
      setSelectedStudent(null);
    } catch (error: any) {
      toast({
        title: "Error approving student",
        description: error.message || "There was an error approving the student",
        variant: "destructive",
      });
    }
  };
  
  // Function to reject a student
  const handleRejectStudent = (studentId: string) => {
    // In a real application, this would call a Supabase function to update the student status
    toast({
      title: "Student rejected",
      description: "The student has been rejected",
    });
    
    // Reset selection after rejection
    setSelectedStudent(null);
  };

  const viewDocumentUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('student_documents')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds
        
      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast({
        title: "Error viewing document",
        description: "There was an error opening the document",
        variant: "destructive",
      });
    }
  };
  
  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('student_documents')
        .download(filePath);
        
      if (error) throw error;
      
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error downloading document",
        description: "There was an error downloading the document",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const filteredPendingStudents = pendingStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.student_id && student.student_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredApprovedStudents = approvedStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.student_id && student.student_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-medium text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            <span>Admin Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs flex items-center justify-center rounded-full">
                {pendingStudents.length}
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <div className="flex flex-col gap-6">
          {/* Dashboard Title and Stats */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Student Registration Dashboard</h1>
              <p className="text-muted-foreground">Manage and approve student registrations</p>
            </div>
            
            <div className="flex gap-4">
              <Card className="w-full md:w-40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{pendingStudents.length}</p>
                    </div>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-full md:w-40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">{approvedStudents.length}</p>
                    </div>
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-full md:w-40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold">{rejectedStudents.length}</p>
                    </div>
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                      <XCircle className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email or student ID..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
          
          {/* Student List and Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Student Registrations</CardTitle>
                  <CardDescription>Manage student registrations and approvals</CardDescription>
                </CardHeader>
                
                <Tabs 
                  defaultValue="pending" 
                  value={currentTab}
                  onValueChange={setCurrentTab}
                  className="w-full"
                >
                  <div className="px-6">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="pending" className="flex items-center gap-2">
                        <span>Pending</span>
                        <Badge variant="outline" className="ml-1">{pendingStudents.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="approved" className="flex items-center gap-2">
                        <span>Approved</span>
                        <Badge variant="outline" className="ml-1">{approvedStudents.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="rejected" className="flex items-center gap-2">
                        <span>Rejected</span>
                        <Badge variant="outline" className="ml-1">{rejectedStudents.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="pending" className="m-0">
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Loading students...</p>
                        </div>
                      ) : filteredPendingStudents.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No pending registrations</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredPendingStudents.map(student => (
                            <StudentCard 
                              key={student.id} 
                              student={student} 
                              onClick={() => handleStudentSelect(student)}
                              isSelected={selectedStudent?.id === student.id}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>
                  
                  <TabsContent value="approved" className="m-0">
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Loading students...</p>
                        </div>
                      ) : filteredApprovedStudents.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No approved registrations</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredApprovedStudents.map(student => (
                            <StudentCard 
                              key={student.id} 
                              student={student} 
                              onClick={() => handleStudentSelect(student)}
                              isSelected={selectedStudent?.id === student.id}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>
                  
                  <TabsContent value="rejected" className="m-0">
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No rejected registrations</p>
                      </div>
                    </CardContent>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
            
            {/* Detail View */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Student Details</CardTitle>
                  <CardDescription>View and manage student information</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {selectedStudent ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="" alt={selectedStudent.name} />
                          <AvatarFallback>{selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-medium">{selectedStudent.name}</h3>
                        <p className="text-muted-foreground">{selectedStudent.email}</p>
                        <div className="flex items-center mt-2">
                          <Badge 
                            className={cn(
                              selectedStudent.approved === false || selectedStudent.approved === null
                                ? "bg-orange-100 text-orange-600 hover:bg-orange-100"
                                : "bg-green-100 text-green-600 hover:bg-green-100"
                            )}
                          >
                            {selectedStudent.approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Student ID</h4>
                          <p>{selectedStudent.student_id || 'Not provided'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Phone Number</h4>
                          <p>{selectedStudent.phone_number || 'Not provided'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Registration Date</h4>
                          <p>{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        {selectedStudent.bio && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Bio</h4>
                            <p className="text-sm">{selectedStudent.bio}</p>
                          </div>
                        )}
                        
                        {studentDocuments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Documents</h4>
                            <div className="space-y-2">
                              {studentDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 text-primary mr-2" />
                                    <div>
                                      <span className="text-sm">{doc.name}</span>
                                      <p className="text-xs text-muted-foreground">
                                        {doc.document_type === 'student_id' && 'Student ID'}
                                        {doc.document_type === 'study_permit' && 'Study Permit'}
                                        {doc.document_type === 'photo' && 'Personal Photo'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => viewDocumentUrl(doc.file_path)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => downloadDocument(doc.file_path, doc.name)}
                                    >
                                      <DownloadCloud className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {studentDocuments.length === 0 && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                            <div className="flex">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                              <p className="text-sm text-amber-800">
                                No documents uploaded yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-[400px]">
                      <User className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Student Selected</h3>
                      <p className="text-muted-foreground">
                        Select a student from the list to view their details
                      </p>
                    </div>
                  )}
                </CardContent>
                
                {selectedStudent && (selectedStudent.approved === false || selectedStudent.approved === null) && (
                  <CardFooter className="flex justify-between gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleRejectStudent(selectedStudent.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => handleApproveStudent(selectedStudent.id)}
                      disabled={studentDocuments.length < 3}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Card Component for the list
const StudentCard = ({ 
  student, 
  onClick, 
  isSelected 
}: { 
  student: any; 
  onClick: () => void; 
  isSelected: boolean 
}) => {
  return (
    <div 
      className={cn(
        "border rounded-md p-4 cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "hover:border-primary/30 hover:bg-secondary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="" alt={student.name} />
            <AvatarFallback>{student.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{student.name}</h3>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
        </div>
        <Badge 
          className={cn(
            "ml-auto",
            student.approved 
              ? "bg-green-100 text-green-600 hover:bg-green-100" 
              : "bg-orange-100 text-orange-600 hover:bg-orange-100"
          )}
        >
          {student.approved ? 'Approved' : 'Pending'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
        <div>
          <span className="text-muted-foreground">ID:</span> {student.student_id || 'N/A'}
        </div>
        <div>
          <span className="text-muted-foreground">Created:</span> {new Date(student.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
