const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  icon: Icon,
  removable = false,
  onRemove,
  className = '',
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium transition-all';

  // Variant styles
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    // Solid variants
    'primary-solid': 'bg-primary-500 text-white',
    'success-solid': 'bg-green-500 text-white',
    'warning-solid': 'bg-yellow-500 text-white',
    'danger-solid': 'bg-red-500 text-white',
    'info-solid': 'bg-blue-500 text-white',
    // Outline variants
    'primary-outline': 'border-2 border-primary-500 text-primary-700 bg-transparent',
    'success-outline': 'border-2 border-green-500 text-green-700 bg-transparent',
    'warning-outline': 'border-2 border-yellow-500 text-yellow-700 bg-transparent',
    'danger-outline': 'border-2 border-red-500 text-red-700 bg-transparent',
  };

  // Size styles
  const sizes = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-base gap-2',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Combined classes
  const combinedClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${roundedStyles[rounded]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={combinedClasses}>
      {/* Icon */}
      {Icon && (
        <Icon className="w-3.5 h-3.5" />
      )}

      {/* Text */}
      <span>{children}</span>

      {/* Remove button */}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;