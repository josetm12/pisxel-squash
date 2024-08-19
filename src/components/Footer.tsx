import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t-2 flex items-center justify-center text-xs">
      &copy; JTM {new Date().getFullYear()}
    </footer>
  );
}
