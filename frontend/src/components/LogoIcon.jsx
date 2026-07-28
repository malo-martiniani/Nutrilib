import React from 'react';

export default function LogoIcon({ className = "w-8 h-8 object-contain", ...props }) {
  return (
    <img 
      src="/logo.png" 
      alt="Nutrilib Logo" 
      className={`object-contain inline-block shrink-0 ${className}`} 
      {...props} 
    />
  );
}
