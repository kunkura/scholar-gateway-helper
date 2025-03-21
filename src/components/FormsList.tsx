
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, BarChart4, Eye, Edit, Trash2, PlusCircle, Check, X, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Form {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  published: boolean;
  form_type: 'form' | 'poll';
  form_fields: any[];
  submission_count?: number;
}

const FormsList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'form' | 'poll'>('all');
  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      // Fetch all forms
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (formsError) throw formsError;
      
      // Fetch submission counts for each form
      const formsWithCounts = await Promise.all(
        formsData.map(async (form) => {
          const { count, error: countError } = await supabase
            .from('form_submissions')
            .select('id', { count: 'exact', head: true })
            .eq('form_id', form.id);
            
          return {
            ...form,
            submission_count: count || 0
          };
        })
      );
      
      setForms(formsWithCounts);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error fetching forms",
        description: "There was an error loading your forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (formId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ published: !currentStatus })
        .eq('id', formId);
        
      if (error) throw error;
      
      // Update local state
      setForms(forms.map(form => 
        form.id === formId ? { ...form, published: !currentStatus } : form
      ));
      
      toast({
        title: currentStatus ? "Form unpublished" : "Form published",
        description: currentStatus 
          ? "Form is now hidden from students" 
          : "Form is now visible to students",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error updating the form",
        variant: "destructive",
      });
    }
  };

  const deleteForm = async () => {
    if (!selectedForm) return;
    
    try {
      // Delete the form
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', selectedForm.id);
        
      if (error) throw error;
      
      // Update local state
      setForms(forms.filter(form => form.id !== selectedForm.id));
      
      toast({
        title: "Form deleted",
        description: "The form has been permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting form",
        description: error.message || "There was an error deleting the form",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedForm(null);
    }
  };

  const filteredForms = forms
    .filter(form => filter === 'all' || form.form_type === filter)
    .filter(form => 
      search === '' || 
      form.title.toLowerCase().includes(search.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Forms & Polls</h1>
          <p className="text-muted-foreground">Create and manage forms and polls for students</p>
        </div>
        
        <Button 
          onClick={() => navigate('/admin/forms/new')}
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create New
        </Button>
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
          onValueChange={(value: 'all' | 'form' | 'poll') => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="form">Forms Only</SelectItem>
            <SelectItem value="poll">Polls Only</SelectItem>
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
                  : "You haven't created any forms yet"}
              </p>
              <Button 
                onClick={() => navigate('/admin/forms/new')}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create New Form
              </Button>
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
                    <Badge variant={form.published ? "default" : "outline"}>
                      {form.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      
                      <DropdownMenuItem onClick={() => navigate(`/admin/forms/${form.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => navigate(`/admin/forms/${form.id}/responses`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Responses
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => togglePublishStatus(form.id, form.published)}>
                        {form.published ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          setSelectedForm(form);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    <span>Responses:</span>
                    <span className="font-medium text-foreground">{form.submission_count}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/admin/forms/${form.id}/responses`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Responses
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form and all associated responses.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteForm}
              className="bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormsList;
