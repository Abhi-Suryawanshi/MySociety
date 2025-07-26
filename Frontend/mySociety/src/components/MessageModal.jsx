import React, { useEffect, useRef } from 'react';

const MessageModal = ({ message, type, onClose }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (message) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Set a new timer to close the toast after 3 seconds
      timerRef.current = setTimeout(() => {
        onClose();
      }, 3000);
    }

    // Cleanup function to clear the timer if the component unmounts or message changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  const borderColor = type === 'error' ? 'border-red-700' : 'border-green-700';
  const icon = type === 'error' ? '❌' : '✅'; // Using emojis for simple icons

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInFromRight">
      <div className={`flex items-center p-4 rounded-lg shadow-xl text-white border-b-4 ${bgColor} ${borderColor} transition-all duration-300 ease-out`}>
        <span className="text-2xl mr-3">{icon}</span>
        <div className="flex-grow">
          <p className="font-semibold text-lg">{type === 'error' ? 'Error!' : 'Success!'}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 focus:outline-none text-xl">
          &times;
        </button>
      </div>
    </div>
  );
};

export default MessageModal;