import React from 'react';

interface FormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChange
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 uppercase">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
      />
    </div>
  );
};
