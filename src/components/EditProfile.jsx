import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '../config/api.js';
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
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/users/login/');
      return;
    }
    
    loadProfile();
  }, [isAuthenticated, navigate]);
  
  const loadProfile = useCallback(async () => {
    try {
      // Check if token is available
      const token = localStorage.getItem('access_token');

      
      const response = await axios.get(getApiUrl(API_ENDPOINTS.PROFILE), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = response.data;
      

      
      setFormData({
        bio: data.bio || '',
        profile_image: null
      });
      
      if (data.profile_image) {
        setPreviewImage(data.profile_image);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Failed to load profile data', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  }, []);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }
    
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

  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setLoading(true);

    
    try {
      let cloudinaryUrl = null;
      
      // If there's a new image, upload to Cloudinary first
      if (formData.profile_image) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', formData.profile_image);
        cloudinaryFormData.append('upload_preset', 'tradinglab');
        
        // Create axios instance without interceptors for Cloudinary
        const cloudinaryAxios = axios.create();
        
        try {
          const cloudinaryResponse = await cloudinaryAxios.post(
            'https://api.cloudinary.com/v1_1/dgu3pco4q/image/upload',
            cloudinaryFormData
          );
          
          cloudinaryUrl = cloudinaryResponse.data.secure_url;
        } catch (cloudinaryError) {
          const errorMessage = cloudinaryError.response?.data?.error?.message || 
                             cloudinaryError.response?.data?.error || 
                             'Unknown Cloudinary error';
          
          toast.error(`Failed to upload image: ${errorMessage}`, {
            position: "top-right",
            autoClose: 4000,
          });
          setLoading(false);
          return;
        }
      }
      
      // Prepare data for backend
      const backendData = new FormData();
      
      if (formData.bio) {
        backendData.append('bio', formData.bio);
      }
      
      if (cloudinaryUrl) {
        backendData.append('profile_image', cloudinaryUrl);
      }
      
      // Send to backend
      const response = await axios.put(
        getApiUrl(API_ENDPOINTS.PROFILE),
        backendData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate(`/users/profile/${currentUser.id}`);
      }, 1500);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [formData.bio, formData.profile_image, navigate, currentUser.id]);
  
  const handleCancel = useCallback(() => {
    navigate(`/users/profile/${currentUser.id}`);
  }, [navigate, currentUser.id]);
  
  const renderImageUpload = () => (
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
        <p className="image-help">Click to upload a new image (JPG, PNG, GIF, max 5MB)</p>
      </div>
    </div>
  );
  
  const renderBioSection = () => (
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
  );
  
  const renderActionButtons = () => (
    <div className="form-actions">
      <button 
        type="button" 
        className="btn btn-cancel"
        onClick={handleCancel}
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
  );
  
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
          <div className="edit-profile-error">{error}</div>
        )}
        
        {success && (
          <div className="edit-profile-success">{success}</div>
        )}
        
        <form className="edit-profile-form" onSubmit={handleSubmit}>
          {renderImageUpload()}
          {renderBioSection()}
          {renderActionButtons()}
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
