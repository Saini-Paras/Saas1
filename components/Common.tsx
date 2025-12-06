import React from 'react';
import { CheckCircle, Upload, LucideIcon } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-neutral-800 rounded-md p-5 md:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] ${className}`}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = "", variant = "primary", ...props }, ref) => {
  const baseStyle = "px-4 py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] border";
  const variants = {
    primary: "bg-[#146ef5] hover:bg-[#115ac9] text-white border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-[#252525] dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-[#2a2a2a] disabled:opacity-50",
    outline: "bg-transparent text-gray-700 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-50",
    danger: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30 disabled:opacity-50",
    ghost: "bg-transparent border-transparent text-gray-500 hover:text-black hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5"
  };

  return (
    <button ref={ref} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className = "", icon: Icon, ...props }, ref) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && <label className="text-[11px] font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 dark:text-neutral-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input
        ref={ref}
        className={`bg-white dark:bg-[#171717] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-neutral-200 rounded-md py-2.5 text-sm focus:outline-none focus:border-accent-500 dark:focus:border-accent-500 focus:ring-1 focus:ring-accent-500 dark:focus:ring-accent-500 transition-all placeholder:text-gray-400 dark:placeholder:text-neutral-600 w-full ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
        {...props}
      />
    </div>
  </div>
));
Input.displayName = "Input";

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, children, className = "", ...props }, ref) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && <label className="text-[11px] font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">{label}</label>}
        <div className="relative">
            <select
                ref={ref}
                className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 dark:focus:border-accent-500 focus:ring-1 focus:ring-accent-500 dark:focus:ring-accent-500 transition-all w-full appearance-none"
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-neutral-600">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    </div>
));
Select.displayName = "Select";

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, className = "", ...props }, ref) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && <label className="text-[11px] font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">{label}</label>}
    <textarea
      ref={ref}
      className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 dark:focus:border-accent-500 focus:ring-1 focus:ring-accent-500 dark:focus:ring-accent-500 transition-all placeholder:text-gray-400 dark:placeholder:text-neutral-600 resize-y font-mono leading-relaxed"
      {...props}
    />
  </div>
));
TextArea.displayName = "TextArea";

// --- FileUpload ---
interface FileUploadProps {
  label: string;
  accept: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onFileSelect, file }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      <input
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className={`
        border border-dashed rounded-lg p-8 text-center transition-all duration-300
        ${file 
            ? 'border-blue-200 bg-blue-50 dark:border-green-800/50 dark:bg-green-950/10' 
            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 dark:border-neutral-800 dark:bg-[#171717] dark:group-hover:border-neutral-600 dark:group-hover:bg-[#1f1f1f]'}
      `}>
        {file ? (
          <div className="flex items-center justify-center gap-2 text-accent-600 dark:text-green-400">
            <CheckCircle size={18} />
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-300">
            <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-full border border-gray-200 dark:border-neutral-800 group-hover:border-blue-200 dark:group-hover:border-neutral-700 transition-colors shadow-sm">
                 <Upload size={20} />
            </div>
            <span className="text-sm font-medium">Click to upload {accept}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);