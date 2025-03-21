
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BarChart4, CheckCircle2, Clock, Search, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Form {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  published: boolean;
  form_type: 'form' | 'poll';
  form_fields: any[];
  already_submitted: boolean;
}

const StudentFormsList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all published forms
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
        
      if (formsError) throw formsError;
      
      if (!formsData || formsData.length === 0) {
        setForms([]);
        setLoading(false);
        return;
      }
      
      // Fetch the user's submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('form_id')
        .eq('user_id', user.id);
        
      if (submissionsError) throw submissionsError;
      
      // Create a set of submitted form IDs for quick lookup
      const submittedFormIds = new Set(submissionsData?.map(sub => sub.form_id) || []);
      
      // Mark forms as submitted or not
      const processedForms = formsData.map(form => ({
        ...form,
        already_submitted: submittedFormIds.has(form.id)
      }));
      
      setForms(processedForms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error fetching forms",
        description: "There was an error loading forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter forms based on search and active tab
  const filteredForms = forms
    .filter(form => 
      search === '' || 
      form.title.toLowerCase().includes(search.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(search.toLowerCase()))
    )
    .filter(form => {
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return !form.already_submitted;
      if (activeTab === 'completed') return form.already_submitted;
      return true;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Forms & Polls</h1>
          <p className="text-muted-foreground">View and respond to forms and polls</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search forms..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(v: string) => setActiveTab(v as 'all' | 'pending' | 'completed')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <ClipboardList className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-secondary/50"></CardHeader>
                  <CardContent className="py-4">
                    <div className="h-4 bg-secondary/50 w-3/4 rounded mb-2"></div>
                    <div className="h-3 bg-secondary/30 w-1/2 rounded"></div>
                  </CardContent>
                  <CardFooter className="h-10 bg-secondary/20"></CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredForms.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No forms available</h3>
                  <p className="text-muted-foreground">
                    {search 
                      ? "No forms match your search criteria" 
                      : activeTab === 'pending'
                      ? "You have completed all available forms"
                      : activeTab === 'completed'
                      ? "You haven't completed any forms yet"
                      : "There are no forms available at this time"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForms.map((form) => (
                <Card key={form.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {form.form_type === 'form' ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <BarChart4 className="h-5 w-5 text-primary" />
                        )}
                        <Badge variant={form.already_submitted ? "outline" : "default"}>
                          {form.already_submitted ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg mt-2">{form.title}</CardTitle>
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {form.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>Questions:</span>
                        <span className="font-medium text-foreground">{form.form_fields.length}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {new Date(form.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      variant={form.already_submitted ? "outline" : "default"}
                      onClick={() => navigate(`/student/forms/${form.id}`)}
                    >
                      {form.already_submitted
                        ? "View Submission"
                        : form.form_type === 'form'
                        ? "Fill Form"
                        : "Answer Poll"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentFormsList;
