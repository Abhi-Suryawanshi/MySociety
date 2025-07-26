import React from 'react';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles, currentUser, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (allowedRoles.includes(currentUser.role)) {
        setAuthorized(true);
      } else {
        // Not authorized, redirect to login or a forbidden page
        onNavigate('/login'); // Or a /forbidden page
      }
    } else {
      // No user, redirect to login
      onNavigate('/login');
    }
    setLoading(false);
  }, [currentUser, allowedRoles, onNavigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700">
        Loading...
      </div>
    );
  }

  return authorized ? children : null;
};

export default ProtectedRoute;