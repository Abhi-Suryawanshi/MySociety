import React from 'react';

const Navbar = ({ isLoggedIn, userRole, onLogout, onNavigate }) => {
  return (
    <nav className="bg-gradient-to-r from-orange-700 to-blue-900 p-4 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-3xl font-extrabold tracking-wide cursor-pointer" onClick={() => onNavigate('/')}>
          MySociety
        </div>
        <ul className="flex space-x-4">
          {isLoggedIn ? (
            <>
              {userRole === 'ADMIN' && (
                <>
                  <li>
                    <button onClick={() => onNavigate('/admin/residents')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Residents</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/admin/complaints')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Complaints</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/admin/announcements')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Announcements</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/admin/events')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Events</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/admin/messages')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Messages</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/admin/send-message')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Send Message</button>
                  </li>
                </>
              )}
              {userRole === 'USER' && (
                <>
                  <li>
                    <button onClick={() => onNavigate('/user/maintenance')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Maintenance</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/user/complaints')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Complaints</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/user/announcements')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Announcements</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/user/events')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Events</button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('/user/messages')} className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition duration-300 transform hover:scale-105">Messages</button>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={onLogout}
                  className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition duration-300 shadow-md transform hover:scale-105"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;