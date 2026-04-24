import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variants = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:ring-primary-400',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300',
    outline: 'border border-primary-200 text-primary-700 hover:bg-primary-50 focus:ring-primary-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    link: 'text-primary-500 hover:text-primary-600 hover:underline focus:ring-primary-500',
  };
  
  // Size styles
  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-3.5 text-lg gap-3',
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