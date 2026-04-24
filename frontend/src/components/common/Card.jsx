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
  const baseStyles = 'bg-white rounded-2xl border border-gray-200 transition-all duration-200';

  // Variant styles
  const variants = {
    default: 'bg-white',
    primary: 'bg-primary-50/60 border-primary-100',
    success: 'bg-emerald-50/70 border-emerald-100',
    warning: 'bg-amber-50/70 border-amber-100',
    danger: 'bg-red-50/70 border-red-100',
    info: 'bg-sky-50/70 border-sky-100',
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
    sm: 'shadow-sm shadow-gray-200/70',
    md: 'shadow-md shadow-gray-200/70',
    lg: 'shadow-lg shadow-gray-200/70',
    xl: 'shadow-xl shadow-gray-200/70',
  };

  // Hover effect
  const hoverEffect = hover 
    ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
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
        <div className="mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
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
        <div className="mt-5 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;