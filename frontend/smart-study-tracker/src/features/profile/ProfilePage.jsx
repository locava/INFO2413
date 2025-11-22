import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Load user data when page opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear success/error message when user types
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
        // Refresh page to update the Header name
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Edit Profile</h1>
          <p className="page-subtitle">Update your personal information</p>
        </div>
      </div>

      {/* Content Container */}
      <div className="profile-container">
        <div className="profile-form-card">
          
          {/* Messages Area */}
          {message.text && (
            <div className={`message-banner ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* The Form using your UI Components */}
          <form className="profile-form" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />

            {/* Form Actions (Buttons) */}
            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                fullWidth // Makes button nice and wide on mobile
              >
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;