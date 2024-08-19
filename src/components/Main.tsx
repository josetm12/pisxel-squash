import React from 'react';
import UploadForm from '@/components/UploadForm';

export default function Main() {
  return (
    <main className="bg-pattern px-10 md:px-15 lg:px-40 py-5 md:py-10 overflow-y-auto">
      <UploadForm />
    </main>
  );
}
