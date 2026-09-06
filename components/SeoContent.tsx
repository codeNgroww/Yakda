import React from 'react';

interface SeoContentProps {
  title?: string | null;
  description?: string | null;
  h1?: string | null;
  className?: string;
}

export default function SeoContent({ title, description, h1, className = '' }: SeoContentProps) {
  if (!title && !description && !h1) return null;

  return (
    <div className={`prose prose-sm md:prose-base max-w-none text-on-surface-variant ${className}`}>
      {h1 && <h1 className="text-2xl md:text-3xl font-black text-[#1A2A4E] mb-4">{h1}</h1>}
      {description && <p className="text-sm md:text-base leading-relaxed">{description}</p>}
    </div>
  );
}
