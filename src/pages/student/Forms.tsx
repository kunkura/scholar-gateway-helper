
import React from 'react';
import StudentFormsList from '@/components/StudentFormsList';

const StudentFormsPage = () => {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">نماذج الطلاب</h1>
      <StudentFormsList />
    </div>
  );
};

export default StudentFormsPage;
