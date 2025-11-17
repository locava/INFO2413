import './Textarea.css';

function Textarea({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 4,
  required = false,
  error,
  ...props 
}) {
  return (
    <div className="textarea-wrapper">
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`textarea-field ${error ? 'textarea-error' : ''}`}
        required={required}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

export default Textarea;

