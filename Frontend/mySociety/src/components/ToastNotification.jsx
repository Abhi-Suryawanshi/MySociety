import React, { useEffect, useState } from 'react';

const ToastNotification = ({ message, type, id, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the toast
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow time for fade-out animation before removing from DOM
      setTimeout(() => onClose(id), 500); // Match fade-out duration
    }, 3500); // Display for 3.5 seconds before starting fade-out

    return () => clearTimeout(timer);
  }, [message, type, id, onClose]);

  if (!isVisible && message === null) return null; // Don't render if no message or fading out

  return (
    <div className={`toast ${type} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
      <span className="toast-message">{message}</span>
      <button onClick={() => { setIsVisible(false); setTimeout(() => onClose(id), 500); }} className="toast-close-button">
        &times;
      </button>
    </div>
  );
};

export default ToastNotification;