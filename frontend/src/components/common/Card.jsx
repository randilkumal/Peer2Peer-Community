const Card = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'default',
  hover = false,
  shadow = 'sm',
  className = '',
  headerAction,
  footer,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white rounded-lg border transition-all';

  // Variant styles
  const variants = {
    default: 'border-gray-200',
    primary: 'border-primary-200 bg-primary-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  // Shadow styles
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Hover effect
  const hoverEffect = hover 
    ? 'hover:shadow-md hover:border-gray-300 cursor-pointer' 
    : '';

  // Combined classes
  const combinedClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${paddings[padding]}
    ${shadows[shadow]}
    ${hoverEffect}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={combinedClasses} {...props}>
      {/* Header Section */}
      {(title || subtitle || headerAction) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="ml-4">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {children}
      </div>

      {/* Footer Section */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;