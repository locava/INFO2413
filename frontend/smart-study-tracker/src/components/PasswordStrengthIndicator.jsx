import { useState, useEffect } from 'react';
import { validatePassword, getPasswordStrengthInfo, checkRequirements } from '../utils/passwordValidator';
import './PasswordStrengthIndicator.css';

function PasswordStrengthIndicator({ password, showRequirements = true }) {
  const [validation, setValidation] = useState({ isValid: false, errors: [], strength: 0 });
  const [requirements, setRequirements] = useState({});

  useEffect(() => {
    if (password) {
      const result = validatePassword(password);
      setValidation(result);
      setRequirements(checkRequirements(password));
    } else {
      setValidation({ isValid: false, errors: [], strength: 0 });
      setRequirements({});
    }
  }, [password]);

  if (!password) return null;

  const strengthInfo = getPasswordStrengthInfo(validation.strength);

  return (
    <div className="password-strength-indicator">
      {/* Strength Bar */}
      <div className="strength-bar-container">
        <div className="strength-bar-label">
          <span>Password Strength:</span>
          <span style={{ color: strengthInfo.color, fontWeight: 600 }}>
            {strengthInfo.label}
          </span>
        </div>
        <div className="strength-bar-track">
          <div 
            className="strength-bar-fill" 
            style={{ 
              width: `${(validation.strength / 4) * 100}%`,
              backgroundColor: strengthInfo.color
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="password-requirements">
          <div className="requirements-title">Password must contain:</div>
          <ul className="requirements-list">
            <li className={requirements.hasMinLength ? 'met' : 'unmet'}>
              <span className="requirement-icon">
                {requirements.hasMinLength ? '✓' : '○'}
              </span>
              At least 8 characters
            </li>
            <li className={requirements.hasUppercase ? 'met' : 'unmet'}>
              <span className="requirement-icon">
                {requirements.hasUppercase ? '✓' : '○'}
              </span>
              One uppercase letter (A-Z)
            </li>
            <li className={requirements.hasLowercase ? 'met' : 'unmet'}>
              <span className="requirement-icon">
                {requirements.hasLowercase ? '✓' : '○'}
              </span>
              One lowercase letter (a-z)
            </li>
            <li className={requirements.hasNumber ? 'met' : 'unmet'}>
              <span className="requirement-icon">
                {requirements.hasNumber ? '✓' : '○'}
              </span>
              One number (0-9)
            </li>
            <li className={requirements.hasSpecialChar ? 'met' : 'unmet'}>
              <span className="requirement-icon">
                {requirements.hasSpecialChar ? '✓' : '○'}
              </span>
              One special character (!@#$%^&*...)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;

