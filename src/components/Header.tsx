import React from 'react';
import { ImageUp } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex gap-4 items-center justify-center border-b-2">
      <ImageUp className="h-10 w-10" />
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-500 to-violet-500">
        PIXEL SQUASH
      </h1>
    </header>
  );
}
