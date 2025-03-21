
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash2, Save, Eye, CheckCircle2, CircleDashed, FileText, BarChart4 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Defining field types for the form builder
export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';

// Interface for form fields
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For select and radio fields
  placeholder?: string;
}

// Schema for the form creation/editing
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  formType: z.enum(['form', 'poll']),
  published: z.boolean().default(false),
});

const FormBuilder: React.FC<{ editForm?: any }> = ({ editForm }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fields, setFields] = useState<FormField[]>(editForm?.form_fields || []);
  const [activeTab, setActiveTab] = useState('edit');
  const { user } = useContext(AuthContext);
  
  // Initialize the form with edit data if available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editForm?.title || '',
      description: editForm?.description || '',
      formType: editForm?.form_type || 'form',
      published: editForm?.published || false,
    },
  });

  // Function to add a new field
  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
      placeholder: type === 'text' || type === 'textarea' ? 'Enter your answer here' : undefined,
    };
    setFields([...fields, newField]);
  };

  // Function to update a field
  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  // Function to remove a field
  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  // Function to handle option changes for select and radio fields
  const handleOptionChange = (fieldId: string, index: number, value: string) => {
    setFields(fields.map(field => {
      if (field.id === fieldId && field.options) {
        const newOptions = [...field.options];
        newOptions[index] = value;
        return { ...field, options: newOptions };
      }
      return field;
    }));
  };

  // Function to add an option to a select or radio field
  const addOption = (fieldId: string) => {
    setFields(fields.map(field => {
      if (field.id === fieldId && field.options) {
        return { ...field, options: [...field.options, `Option ${field.options.length + 1}`] };
      }
      return field;
    }));
  };

  // Function to remove an option from a select or radio field
  const removeOption = (fieldId: string, index: number) => {
    setFields(fields.map(field => {
      if (field.id === fieldId && field.options && field.options.length > 2) {
        const newOptions = [...field.options];
        newOptions.splice(index, 1);
        return { ...field, options: newOptions };
      }
      return field;
    }));
  };

  // Submit handler for the form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question to your form",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare the form data
      const formData = {
        title: values.title,
        description: values.description || '',
        form_type: values.formType,
        published: values.published,
        form_fields: fields as unknown as Json, // Cast to Json for Supabase
        created_by: user?.id
      };

      if (editForm) {
        // Update existing form
        const { error } = await supabase
          .from('forms')
          .update(formData)
          .eq('id', editForm.id);
          
        if (error) throw error;
        
        toast({
          title: "Form updated",
          description: "Your form has been updated successfully",
        });
      } else {
        // Create new form
        const { error } = await supabase
          .from('forms')
          .insert(formData);
          
        if (error) throw error;
        
        toast({
          title: "Form created",
          description: "Your form has been created successfully",
        });
      }
      
      // Redirect to forms list
      navigate('/admin/forms');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error saving your form",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Edit Form</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter form title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="formType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select form type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="form" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Form</span>
                          </SelectItem>
                          <SelectItem value="poll" className="flex items-center gap-2">
                            <BarChart4 className="h-4 w-4" />
                            <span>Poll</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Forms collect detailed information. Polls are for quick opinion gathering.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter form description" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description to help users understand the purpose of this form.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <div className="flex gap-2">
                    <Select onValueChange={(value: FieldType) => addField(value as FieldType)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Add question" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="textarea">Paragraph</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="checkbox">Checkboxes</SelectItem>
                        <SelectItem value="radio">Multiple Choice</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {fields.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No questions added yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select a question type from the dropdown above to add your first question
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="relative">
                        <Badge 
                          className="absolute top-2 right-2" 
                          variant="outline"
                        >
                          {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                        </Badge>
                        
                        <CardHeader className="pb-2">
                          <div className="space-y-2">
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="font-medium text-base border-0 px-0 h-auto focus-visible:ring-0"
                              placeholder="Question text"
                            />
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                id={`required-${field.id}`}
                              />
                              <label 
                                htmlFor={`required-${field.id}`}
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                Required
                              </label>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {(field.type === 'text' || field.type === 'textarea' || field.type === 'date') && (
                            <Input
                              value={field.placeholder}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="text-sm border-dashed"
                              placeholder="Placeholder text (optional)"
                            />
                          )}
                          
                          {(field.type === 'select' || field.type === 'radio') && field.options && (
                            <div className="space-y-2">
                              {field.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <Input
                                      value={option}
                                      onChange={(e) => handleOptionChange(field.id, optionIndex, e.target.value)}
                                      className="text-sm"
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(field.id, optionIndex)}
                                    disabled={field.options!.length <= 2}
                                    className="h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(field.id)}
                                className="mt-2"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          )}
                          
                          {field.type === 'checkbox' && (
                            <div className="space-y-2">
                              {field.options ? (
                                field.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(field.id, optionIndex, e.target.value)}
                                        className="text-sm"
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption(field.id, optionIndex)}
                                      disabled={field.options!.length <= 2}
                                      className="h-8 w-8"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <>
                                  {updateField(field.id, { options: ['Option 1', 'Option 2'] })}
                                  <div className="text-sm text-muted-foreground">Loading options...</div>
                                </>
                              )}
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(field.id)}
                                className="mt-2"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                          
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFields = [...fields];
                                const temp = newFields[index];
                                newFields[index] = newFields[index - 1];
                                newFields[index - 1] = temp;
                                setFields(newFields);
                              }}
                            >
                              Move Up
                            </Button>
                          )}
                          
                          {index < fields.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFields = [...fields];
                                const temp = newFields[index];
                                newFields[index] = newFields[index + 1];
                                newFields[index + 1] = temp;
                                setFields(newFields);
                              }}
                            >
                              Move Down
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish Form
                      </FormLabel>
                      <FormDescription>
                        When published, this form will be visible to students
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/forms')}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editForm ? 'Update Form' : 'Save Form'}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{form.getValues('title') || 'Untitled Form'}</CardTitle>
              {form.getValues('description') && (
                <p className="text-muted-foreground mt-2">{form.getValues('description')}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {fields.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No questions added yet. Switch to Edit Form tab to add questions.
                  </AlertDescription>
                </Alert>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <Input placeholder={field.placeholder} disabled />
                    )}
                    
                    {field.type === 'textarea' && (
                      <Textarea placeholder={field.placeholder} disabled rows={3} />
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option, i) => (
                            <SelectItem key={i} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {field.type === 'checkbox' && field.options && (
                      <div className="space-y-2">
                        {field.options.map((option, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`preview-${field.id}-${i}`} disabled />
                            <label
                              htmlFor={`preview-${field.id}-${i}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {field.type === 'radio' && field.options && (
                      <RadioGroup className="space-y-2" disabled>
                        {field.options.map((option, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`preview-${field.id}-${i}`} disabled />
                            <label
                              htmlFor={`preview-${field.id}-${i}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {field.type === 'date' && (
                      <Input type="date" disabled />
                    )}
                  </div>
                ))
              )}
            </CardContent>
            
            {fields.length > 0 && (
              <CardFooter>
                <Button disabled className="ml-auto">Submit</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormBuilder;
