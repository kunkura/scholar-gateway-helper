
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, FileText, BarChart4, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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

const StudentForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic form schema based on form fields
  const createFormSchema = (formFields: FormField[]) => {
    const schemaFields: Record<string, any> = {};
    
    formFields.forEach(field => {
      let fieldSchema;
      
      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = field.required 
            ? z.string().min(1, { message: "This field is required" })
            : z.string().optional();
          break;
          
        case 'select':
        case 'radio':
          fieldSchema = field.required
            ? z.string().min(1, { message: "Please select an option" })
            : z.string().optional();
          break;
          
        case 'checkbox':
          fieldSchema = field.required
            ? z.array(z.string()).min(1, { message: "Please select at least one option" })
            : z.array(z.string()).optional();
          break;
          
        case 'date':
          fieldSchema = field.required
            ? z.string().min(1, { message: "Please select a date" })
            : z.string().optional();
          break;
          
        default:
          fieldSchema = z.any();
      }
      
      schemaFields[field.id] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  useEffect(() => {
    if (formId) {
      fetchFormAndCheckSubmission();
    }
  }, [formId]);

  const fetchFormAndCheckSubmission = async () => {
    setLoading(true);
    try {
      // Fetch the form details
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('published', true)
        .single();
        
      if (formError) throw formError;
      
      setForm(formData);
      
      // Check if user has already submitted this form
      if (user) {
        const { data: submissionData, error: submissionError } = await supabase
          .from('form_submissions')
          .select('id')
          .eq('form_id', formId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (submissionError) throw submissionError;
        
        if (submissionData) {
          setAlreadySubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      toast({
        title: "Error",
        description: "There was an error loading the form",
        variant: "destructive",
      });
      
      // Navigate back on error
      navigate('/student/forms');
    } finally {
      setLoading(false);
    }
  };

  // Generate form methods based on the form fields
  const formSchema = form ? createFormSchema(form.form_fields) : z.object({});
  const formMethods = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: form?.form_fields.reduce((acc, field) => {
      if (field.type === 'checkbox') {
        acc[field.id] = [];
      } else {
        acc[field.id] = '';
      }
      return acc;
    }, {} as Record<string, any>) || {},
  });

  const onSubmit = async (data: Record<string, any>) => {
    if (!form || !user) return;
    
    setSubmitting(true);
    try {
      // Prepare the submission
      const submission = {
        form_id: form.id,
        user_id: user.id,
        responses: data
      };
      
      // Submit the form
      const { error } = await supabase
        .from('form_submissions')
        .insert(submission);
        
      if (error) throw error;
      
      setSubmitted(true);
      
      toast({
        title: "Success!",
        description: "Your response has been submitted",
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error submitting your response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Loading...</h1>
        </div>
        
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Form not found</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Form not available</h2>
              <p className="text-muted-foreground mb-6">
                The form you're looking for doesn't exist or is not currently published.
              </p>
              <Button onClick={() => navigate('/student/forms')}>
                Back to Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted || alreadySubmitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{form.title}</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Response submitted</h2>
              <p className="text-muted-foreground mb-6">
                Your response has been recorded. Thank you for your feedback!
              </p>
              <Button onClick={() => navigate('/student/forms')}>
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/forms')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{form.title}</h1>
          {form.form_type === 'form' ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <BarChart4 className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{form.title}</CardTitle>
          {form.description && (
            <p className="text-muted-foreground mt-2">{form.description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
            {form.form_fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <Controller
                    name={field.id}
                    control={formMethods.control}
                    render={({ field: formField, fieldState }) => (
                      <div>
                        <Input
                          placeholder={field.placeholder}
                          {...formField}
                          className={fieldState.error ? "border-red-500" : ""}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Controller
                    name={field.id}
                    control={formMethods.control}
                    render={({ field: formField, fieldState }) => (
                      <div>
                        <Textarea
                          placeholder={field.placeholder}
                          rows={3}
                          {...formField}
                          className={fieldState.error ? "border-red-500" : ""}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <Controller
                    name={field.id}
                    control={formMethods.control}
                    render={({ field: formField, fieldState }) => (
                      <div>
                        <Select
                          onValueChange={formField.onChange}
                          value={formField.value}
                        >
                          <SelectTrigger className={fieldState.error ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options!.map((option, i) => (
                              <SelectItem key={i} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                {field.type === 'radio' && field.options && (
                  <Controller
                    name={field.id}
                    control={formMethods.control}
                    render={({ field: formField, fieldState }) => (
                      <div>
                        <RadioGroup
                          value={formField.value}
                          onValueChange={formField.onChange}
                          className="space-y-2"
                        >
                          {field.options!.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`${field.id}-${i}`} />
                              <label
                                htmlFor={`${field.id}-${i}`}
                                className="text-sm leading-none"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                {field.type === 'checkbox' && field.options && (
                  <Controller
                    name={field.id}
                    control={formMethods.control}
                    render={({ field: formField, fieldState }) => (
                      <div>
                        <div className="space-y-2">
                          {field.options!.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${field.id}-${i}`}
                                checked={formField.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  const currentValue = formField.value || [];
                                  if (checked) {
                                    formField.onChange([...currentValue, option]);
                                  } else {
                                    formField.onChange(
                                      currentValue.filter((value: string) => value !== option)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`${field.id}-${i}`}
                                className="text-sm leading-none"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                {field.type === 'date' && (
                  <Controller
                    name={field.id}
                    control={formMethods.control}
                    render={({ field: formField, fieldState }) => (
                      <div>
                        <Input
                          type="date"
                          {...formField}
                          className={fieldState.error ? "border-red-500" : ""}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
            ))}
            
            <CardFooter className="px-0 pt-6">
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentForm;
