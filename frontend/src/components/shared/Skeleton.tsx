import React from 'react';

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-secondary/20 rounded ${className}`}></div>
  );
} 