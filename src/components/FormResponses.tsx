
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Users, BarChart4, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
}

interface Submission {
  id: string;
  form_id: string;
  user_id: string;
  submitted_at: string;
  responses: Record<string, any>;
  user_name?: string;
  user_email?: string;
}

const FormResponses = () => {
  const { formId } = useParams<{ formId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'individual' | 'summary'>('individual');

  useEffect(() => {
    if (formId) {
      fetchFormAndResponses();
    }
  }, [formId]);

  const fetchFormAndResponses = async () => {
    setLoading(true);
    try {
      // Fetch the form details
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
        
      if (formError) throw formError;
      
      setForm(formData);
      
      // Fetch submissions for this form
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            student_id
          )
        `)
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });
        
      if (submissionsError) throw submissionsError;
      
      // Process submissions to include user information
      const processedSubmissions = submissionsData.map((submission) => {
        const profile = submission.profiles as any;
        return {
          ...submission,
          user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown User',
          user_email: profile ? profile.student_id : 'No Student ID'
        };
      });
      
      setSubmissions(processedSubmissions);
    } catch (error) {
      console.error('Error fetching form and responses:', error);
      toast({
        title: "Error",
        description: "There was an error loading the form and responses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadResponses = () => {
    if (!form || submissions.length === 0) return;
    
    try {
      // Create CSV header row
      const fields = form.form_fields.map(field => field.label);
      const headerRow = ['Student Name', 'Student ID', 'Submission Date', ...fields];
      
      // Create CSV content rows
      const dataRows = submissions.map(submission => {
        const submissionDate = new Date(submission.submitted_at).toLocaleString();
        
        // Extract responses in the same order as fields
        const responseValues = form.form_fields.map(field => {
          const response = submission.responses[field.id];
          
          // Handle different response types
          if (Array.isArray(response)) {
            return response.join(', ');
          } else if (response === undefined || response === null) {
            return '';
          } else {
            return response.toString();
          }
        });
        
        return [submission.user_name, submission.user_email, submissionDate, ...responseValues];
      });
      
      // Combine all rows and format as CSV
      const csvContent = [
        headerRow.join(','),
        ...dataRows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `${form.title} - Responses.csv`);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading responses:', error);
      toast({
        title: "Error",
        description: "There was an error downloading the responses",
        variant: "destructive",
      });
    }
  };

  // Function to calculate summary statistics for each question
  const calculateSummaryStats = () => {
    if (!form || submissions.length === 0) return [];
    
    return form.form_fields.map(field => {
      // Get all responses for this field
      const responses = submissions.map(sub => sub.responses[field.id]);
      
      // Calculate stats based on field type
      switch (field.type) {
        case 'radio':
        case 'select': {
          const options = field.options || [];
          const counts: Record<string, number> = {};
          
          // Initialize counts
          options.forEach(opt => { counts[opt] = 0; });
          
          // Count occurrences
          responses.forEach(resp => {
            if (resp) counts[resp] = (counts[resp] || 0) + 1;
          });
          
          // Calculate percentages
          const total = responses.filter(Boolean).length;
          const stats = options.map(opt => ({
            option: opt,
            count: counts[opt] || 0,
            percentage: total > 0 ? Math.round((counts[opt] || 0) / total * 100) : 0
          }));
          
          return { field, stats, type: 'choice' };
        }
        
        case 'checkbox': {
          const options = field.options || [];
          const counts: Record<string, number> = {};
          
          // Initialize counts
          options.forEach(opt => { counts[opt] = 0; });
          
          // Count occurrences (for checkboxes, responses are arrays)
          responses.forEach(resp => {
            if (Array.isArray(resp)) {
              resp.forEach(item => {
                counts[item] = (counts[item] || 0) + 1;
              });
            }
          });
          
          // Calculate percentages based on number of submissions (not total selections)
          const total = submissions.length;
          const stats = options.map(opt => ({
            option: opt,
            count: counts[opt] || 0,
            percentage: total > 0 ? Math.round((counts[opt] || 0) / total * 100) : 0
          }));
          
          return { field, stats, type: 'choice' };
        }
        
        case 'text':
        case 'textarea':
        case 'date':
        default:
          // For text-based responses, just count how many provided an answer
          const answered = responses.filter(Boolean).length;
          const total = submissions.length;
          
          return {
            field,
            stats: {
              answered,
              skipped: total - answered,
              percentageAnswered: total > 0 ? Math.round(answered / total * 100) : 0
            },
            type: 'text',
            responses: responses.filter(Boolean)
          };
      }
    });
  };

  const summaryStats = calculateSummaryStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Loading...</h1>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary/50 w-1/3 rounded"></div>
          <div className="h-4 bg-secondary/30 w-2/3 rounded"></div>
          <div className="h-32 bg-secondary/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Form not found</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Form not found</h2>
              <p className="text-muted-foreground mb-6">
                The form you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate('/admin/forms')}>
                Back to Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{form.title}</h1>
              <Badge variant={form.published ? "default" : "outline"}>
                {form.published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {form.description && (
              <p className="text-sm text-muted-foreground">{form.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/forms/${form.id}/edit`)}
            className="w-full md:w-auto"
          >
            Edit Form
          </Button>
          <Button 
            variant="outline" 
            onClick={downloadResponses}
            className="w-full md:w-auto"
            disabled={submissions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-medium">{submissions.length}</span>
            <span className="text-muted-foreground">Responses</span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            {form.form_type === 'form' ? (
              <FileText className="h-5 w-5 text-muted-foreground" />
            ) : (
              <BarChart4 className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">
              {form.form_type === 'form' ? 'Form' : 'Poll'}
            </span>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Individual Responses</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Summary</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-6 pt-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-medium mb-2">No responses yet</h2>
                  <p className="text-muted-foreground">
                    There are no responses to this form yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <CardTitle className="text-base">{submission.user_name}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </div>
                    </div>
                    <CardDescription>
                      Student ID: {submission.user_email}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {form.form_fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <div className="text-sm font-medium">{field.label}</div>
                        <div className="text-sm">
                          {renderResponse(field, submission.responses[field.id])}
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-6 pt-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BarChart4 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-medium mb-2">No data to summarize</h2>
                  <p className="text-muted-foreground">
                    There are no responses to this form yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {summaryStats.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.field.label}</CardTitle>
                    <CardDescription>
                      {item.type === 'choice' 
                        ? `${submissions.length} responses`
                        : `${item.stats.answered} answered, ${item.stats.skipped} skipped`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {item.type === 'choice' && (
                      <div className="space-y-3">
                        {item.stats.map((stat, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{stat.option}</span>
                              <span className="font-medium">{stat.count} ({stat.percentage}%)</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full" 
                                style={{ width: `${stat.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {item.type === 'text' && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Response rate</span>
                          <span className="font-medium">{item.stats.percentageAnswered}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${item.stats.percentageAnswered}%` }}
                          ></div>
                        </div>
                        
                        {item.field.type !== 'date' && (
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium">Responses:</h4>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                              {item.responses.map((resp, i) => (
                                <div key={i} className="text-sm p-2 bg-secondary/30 rounded-md">
                                  {resp}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to render individual responses based on field type
const renderResponse = (field: FormField, response: any) => {
  if (response === undefined || response === null) {
    return <span className="text-muted-foreground italic">No answer</span>;
  }
  
  switch (field.type) {
    case 'checkbox':
      if (Array.isArray(response)) {
        return response.map((item, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{item}</span>
          </div>
        ));
      }
      return String(response);
      
    case 'radio':
    case 'select':
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{response}</span>
        </div>
      );
      
    case 'date':
      try {
        return new Date(response).toLocaleDateString();
      } catch (e) {
        return String(response);
      }
      
    case 'text':
    case 'textarea':
    default:
      return String(response);
  }
};

export default FormResponses;
