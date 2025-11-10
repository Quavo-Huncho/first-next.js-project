"use client";

export default function Input({ 
  type = "text", 
  placeholder = "", 
  value, 
  onChange, 
  name,
  required = false,
  className = "" 
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`
        w-full px-4 py-3 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
        outline-none transition-all duration-200
        ${className}
      `}
    />
  );
}
