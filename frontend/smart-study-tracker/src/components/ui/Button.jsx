import './Button.css';

function Button({ 
  children, 
  type = 'button', 
  variant = 'primary',
  onClick, 
  disabled = false,
  fullWidth = false,
  ...props 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

