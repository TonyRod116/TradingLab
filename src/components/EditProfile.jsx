import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import './EditProfile.css';

const EditProfile = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bio: '',
    profile_image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/users/login/');
      return;
    }
    
    // Load current profile data
    const loadProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/users/profile/edit/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            bio: data.bio || '',
            profile_image: null
          });
          if (data.profile_image) {
            setPreviewImage(data.profile_image);
          }
        }
      } catch (err) {
        setError('Failed to load profile data');
      }
    };
    
    loadProfile();
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bio', formData.bio);
      
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }
      
      const response = await fetch(`http://localhost:8000/users/profile/edit/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formDataToSend
      });
      
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate(`/users/profile/${currentUser.id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="edit-profile-page">
      <Header />
      <div className="edit-profile-container">
        <div className="edit-profile-header">
          <h1>Edit Profile</h1>
          <p>Update your profile information</p>
        </div>
        
        {error && (
          <div className="edit-profile-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="edit-profile-success">
            {success}
          </div>
        )}
        
        <form className="edit-profile-form" onSubmit={handleSubmit}>
          {/* Profile Image Section */}
          <div className="form-group">
            <label htmlFor="profile_image">Profile Image</label>
            <div className="image-upload-section">
              <div className="current-image">
                {previewImage ? (
                  <img src={previewImage} alt="Profile preview" />
                ) : (
                  <div className="image-placeholder">
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profile_image"
                name="profile_image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              <p className="image-help">Click to upload a new image (JPG, PNG, GIF)</p>
            </div>
          </div>
          
          {/* Bio Section */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              maxLength="500"
              disabled={loading}
            />
            <div className="char-count">
              {formData.bio.length}/500 characters
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-cancel"
              onClick={() => navigate(`/users/profile/${currentUser.id}`)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
