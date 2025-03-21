
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FormBuilder from '@/components/FormBuilder';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  created_by: string;
  published: boolean;
  form_type: 'form' | 'poll';
  form_fields: FormField[];
}

const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(formId !== 'new');

  useEffect(() => {
    if (formId && formId !== 'new') {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
        
      if (error) throw error;
      
      // Convert form_fields from Json to FormField[] and form_type to the correct union type
      setForm({
        ...data,
        form_type: data.form_type as 'form' | 'poll',
        form_fields: data.form_fields as unknown as FormField[]
      });
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <FormBuilder editForm={form} />
    </div>
  );
};

export default FormBuilderPage;
