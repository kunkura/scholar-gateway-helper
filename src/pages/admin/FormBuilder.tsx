
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FormBuilder from '@/components/FormBuilder';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<any>(null);
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
      
      setForm(data);
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
