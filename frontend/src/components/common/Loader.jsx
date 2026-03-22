const Loader = ({ 
  size = 'md', 
  color = 'primary',
  fullScreen = false,
  text = '',
  className = '' 
}) => {
  // Size variants
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  // Color variants
  const colors = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
    success: 'border-green-500 border-t-transparent',
    danger: 'border-red-500 border-t-transparent',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div 
        className={`
          ${sizes[size]} 
          ${colors[color]} 
          rounded-full 
          animate-spin
        `}
      ></div>
      {text && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;