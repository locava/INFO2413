import './Select.css';

function Select({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option',
  required = false,
  error,
  ...props 
}) {
  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`select-field ${error ? 'select-error' : ''}`}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

export default Select;

