
import React from 'react';
import FormsList from '@/components/FormsList';

const FormsPage = () => {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">نماذج المسؤول</h1>
      <FormsList />
    </div>
  );
};

export default FormsPage;
