import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  icon: Icon,
  helperText,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine input type (handle password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Has icon on left
  const hasLeftIcon = Icon && type !== 'password';

  // Has icon on right (password eye icon or error icon)
  const hasRightIcon = type === 'password' || error;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Input Field */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 
            border rounded-lg 
            transition-all
            outline-none
            ${hasLeftIcon ? 'pl-11' : ''}
            ${hasRightIcon ? 'pr-11' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
              : 'bg-white text-gray-900'
            }
          `}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Error Icon */}
          {error && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}

          {/* Password Toggle */}
          {type === 'password' && !disabled && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || error) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;