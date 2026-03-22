import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-primary-500 hover:text-primary-600 hover:underline focus:ring-primary-500',
  };
  
  // Size styles
  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3 text-lg gap-2.5',
    xl: 'px-10 py-4 text-xl gap-3',
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Combined classes
  const combinedClasses = `
    ${baseStyles} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${widthStyle}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      
      {/* Icon Left */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-5 h-5" />
      )}
      
      {/* Button Text */}
      <span>{children}</span>
      
      {/* Icon Right */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5" />
      )}
    </button>
  );
};

export default Button;