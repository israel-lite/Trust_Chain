import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrustChainLogo from '../assets/Trust_Chain_Logo.png';

const Logo = ({ size = 'md', showText = true, className = '', clickable = true }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogoClick = () => {
    if (!clickable) return;
    
    // If user is logged in, go to dashboard, otherwise go to landing page
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={TrustChainLogo} 
        alt="TrustChain Logo" 
        className={`${sizeClasses[size]} rounded-lg object-cover ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={handleLogoClick}
      />
      {showText && (
        <span className={`${textSizes[size]} font-bold text-white ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleLogoClick}>
          TrustChain
        </span>
      )}
    </div>
  );

  // If not clickable, just return the content
  if (!clickable) {
    return logoContent;
  }

  // If clickable, wrap in div for navigation
  return logoContent;
};

export default Logo;
