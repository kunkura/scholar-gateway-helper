import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BarChart4, FormInput, CheckCircle, Clock, Search, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Form {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  published: boolean;
  form_type: 'form' | 'poll';
  form_fields: FormField[];
  already_submitted?: boolean;
}

const StudentFormsList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'form' | 'poll' | 'submitted' | 'pending'>('all');
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
      
      // Fetch user's submissions to determine which forms have been completed
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('form_id')
        .eq('user_id', user.id);
        
      if (submissionsError) throw submissionsError;
      
      // Create a set of submitted form IDs for quick lookup
      const submittedFormIds = new Set(submissionsData.map(sub => sub.form_id));
      
      // Mark each form as submitted or not and convert types for form_type and form_fields
      const processedForms = formsData.map(form => ({
        ...form,
        form_type: form.form_type as 'form' | 'poll',
        form_fields: form.form_fields as unknown as FormField[],
        already_submitted: submittedFormIds.has(form.id)
      }));
      
      setForms(processedForms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error fetching forms",
        description: "There was an error loading the available forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = forms
    .filter(form => {
      if (filter === 'all') return true;
      if (filter === 'form') return form.form_type === 'form';
      if (filter === 'poll') return form.form_type === 'poll';
      if (filter === 'submitted') return form.already_submitted === true;
      if (filter === 'pending') return form.already_submitted !== true;
      return true;
    })
    .filter(form => 
      search === '' || 
      form.title.toLowerCase().includes(search.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Available Forms</h1>
          <p className="text-muted-foreground">Complete the forms and polls assigned to you</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search forms..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select
          value={filter}
          onValueChange={(value: 'all' | 'form' | 'poll' | 'submitted' | 'pending') => setFilter(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="form">Forms Only</SelectItem>
            <SelectItem value="poll">Polls Only</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
              <h3 className="text-lg font-medium mb-2">No forms found</h3>
              <p className="text-muted-foreground mb-6">
                {search 
                  ? "No forms match your search criteria" 
                  : "No forms available at the moment"}
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
                    {form.already_submitted ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Submitted
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
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
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>Type:</span>
                    <span className="font-medium text-foreground">
                      {form.form_type === 'form' ? 'Form' : 'Poll'}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  variant={form.already_submitted ? 'secondary' : 'outline'}
                  onClick={() => navigate(`/student/forms/${form.id}`)}
                  disabled={form.already_submitted}
                >
                  {form.already_submitted ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Already Submitted
                    </>
                  ) : (
                    <>
                      <FormInput className="h-4 w-4 mr-2" />
                      Fill Form
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFormsList;
