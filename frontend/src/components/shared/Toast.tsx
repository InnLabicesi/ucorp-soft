import React from 'react';

export default function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
    >
      <div className="bg-primary text-white px-6 py-3 rounded shadow-lg flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
        <span>{message}</span>
      </div>
    </div>
  );
} 