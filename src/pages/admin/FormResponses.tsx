
import React from 'react';
import FormResponses from '@/components/FormResponses';

const FormResponsesPage = () => {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">ردود النماذج</h1>
      <FormResponses />
    </div>
  );
};

export default FormResponsesPage;
