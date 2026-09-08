'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface InlineEditableProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  isEditMode?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export function InlineEditable({
  value,
  onChange,
  placeholder = 'Nhấp để chỉnh sửa...',
  multiline = false,
  className = '',
  isEditMode = true,
  as: Component = 'span',
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [isEditing, multiline]);

  const handleCommit = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setTempValue(value ?? '');
      setIsEditing(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!isEditMode) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue}
          onChange={handleTextareaInput}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-blue-50/50 text-gray-900 border-2 border-blue-500 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none font-inherit leading-inherit transition ${className}`}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full bg-blue-50/50 text-gray-900 border-2 border-blue-500 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30 font-inherit leading-inherit transition ${className}`}
      />
    );
  }

  const isEmpty = !value || value.trim().length === 0;

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={`group/inline relative cursor-text transition-all rounded px-1 -mx-1 ${
        isEmpty
          ? 'italic text-gray-400 border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40'
          : 'hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-300'
      } ${className}`}
      title="Nhấp để chỉnh sửa trực tiếp"
    >
      {isEmpty ? placeholder : value}
      <span className="opacity-0 group-hover/inline:opacity-100 transition-opacity ml-1.5 inline-flex items-center text-blue-500 align-middle">
        <Pencil className="w-3 h-3" />
      </span>
    </Component>
  );
}
