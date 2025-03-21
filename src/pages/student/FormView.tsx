
import React from 'react';
import StudentForm from '@/components/StudentForm';

const StudentFormViewPage = () => {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">عرض النموذج</h1>
      <StudentForm />
    </div>
  );
};

export default StudentFormViewPage;
