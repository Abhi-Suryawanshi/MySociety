import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ResidentsPage from './pages/admin/ResidentsPage';
import ComplaintsPage from './pages/admin/ComplaintsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import EventsPage from './pages/admin/EventsPage';
import MessagesPage from './pages/admin/MessagesPage'; // Admin views all messages (initial & replies)
import AdminSendMessagePage from './pages/admin/AdminSendMessagePage'; // New page for admin to send messages
import MyMaintenancePage from './pages/user/MyMaintenancePage';
import SubmitComplaintPage from './pages/user/SubmitComplaintPage'; // This will now include history
import ViewAnnouncementsPage from './pages/user/ViewAnnouncementsPage';
import ViewEventsPage from './pages/user/ViewEventsPage';
import MessagesPageResident from './pages/user/MessagesPageResident'; // Consolidated resident messages page
import ProtectedRoute from './components/ProtectedRoute';
import MessageModal from './components/MessageModal';
import { api } from './utils/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(window.location.pathname);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  // Set up the global unauthorized handler when the component mounts
  useEffect(() => {
    api.setOnUnauthorizedHandler(handleLogout);

    // Handle browser back/forward button
    const handlePopState = () => {
      setCurrentPage(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Check for stored token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const residentId = localStorage.getItem('residentId');
    const flatNumber = localStorage.getItem('flatNumber');

    if (token && role && userId) {
      setCurrentUser({ token, role, userId: parseInt(userId), residentId: residentId ? parseInt(residentId) : null, flatNumber });
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('token', user.token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('userId', user.userId);
    if (user.residentId) {
      localStorage.setItem('residentId', user.residentId);
      localStorage.setItem('flatNumber', user.flatNumber);
    }
    // Redirect to appropriate dashboard
    if (user.role === 'ADMIN') {
      handleNavigate('/admin');
    } else {
      handleNavigate('/user');
    }
    showMessage('Login successful!', 'success');
  };

  const handleLogout = async () => {
    try {
      if (currentUser && currentUser.token) {
        await api.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      showMessage('Logout failed on server. Local logout performed.', 'error');
    } finally {
      setCurrentUser(null);
      localStorage.clear();
      handleNavigate('/login'); // Use handleNavigate to update history
      showMessage('Logged out successfully.', 'success');
    }
  };

  const handleNavigate = (path) => {
    setCurrentPage(path);
    // Only push state if the path is different to avoid duplicate history entries
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  // Simple Router based on currentPage state
  const renderPage = () => {
    if (!currentUser && currentPage !== '/login') {
      return <Login onLogin={handleLogin} onNavigate={handleNavigate} showMessage={showMessage} />;
    }

    switch (currentPage) {
      case '/login':
        return <Login onLogin={handleLogin} onNavigate={handleNavigate} showMessage={showMessage} />;
      case '/admin':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <AdminDashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case '/admin/residents':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <ResidentsPage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/admin/complaints':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <ComplaintsPage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/admin/announcements':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <AnnouncementsPage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/admin/events':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <EventsPage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/admin/messages':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <MessagesPage showMessage={showMessage} /> {/* Admin views all messages */}
          </ProtectedRoute>
        );
      case '/admin/send-message': // New route for admin to send messages
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser} onNavigate={handleNavigate}>
            <AdminSendMessagePage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/user':
        return (
          <ProtectedRoute allowedRoles={['USER']} currentUser={currentUser} onNavigate={handleNavigate}>
            <UserDashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case '/user/maintenance':
        return (
          <ProtectedRoute allowedRoles={['USER']} currentUser={currentUser} onNavigate={handleNavigate}>
            <MyMaintenancePage residentId={currentUser?.residentId} flatNumber={currentUser?.flatNumber} showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/user/complaints': // This page now handles both submission and viewing
        return (
          <ProtectedRoute allowedRoles={['USER']} currentUser={currentUser} onNavigate={handleNavigate}>
            <SubmitComplaintPage residentId={currentUser?.residentId} showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/user/announcements':
        return (
          <ProtectedRoute allowedRoles={['USER']} currentUser={currentUser} onNavigate={handleNavigate}>
            <ViewAnnouncementsPage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/user/events':
        return (
          <ProtectedRoute allowedRoles={['USER']} currentUser={currentUser} onNavigate={handleNavigate}>
            <ViewEventsPage showMessage={showMessage} />
          </ProtectedRoute>
        );
      case '/user/messages': // Consolidated resident messages page
        return (
          <ProtectedRoute allowedRoles={['USER']} currentUser={currentUser} onNavigate={handleNavigate}>
            <MessagesPageResident residentId={currentUser?.residentId} residentUserId={currentUser?.userId} showMessage={showMessage} />
          </ProtectedRoute>
        );
      default:
        // Default to dashboard or login if path is unknown or root
        if (currentUser?.role === 'ADMIN') return <AdminDashboard onNavigate={handleNavigate} />;
        if (currentUser?.role === 'USER') return <UserDashboard onNavigate={handleNavigate} />;
        return <Login onLogin={handleLogin} onNavigate={handleNavigate} showMessage={showMessage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isLoggedIn={!!currentUser}
        userRole={currentUser?.role}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <main className="flex-grow container mx-auto p-4 bg-gray-50">
        {renderPage()}
      </main>
      <MessageModal message={message} type={messageType} onClose={clearMessage} />
    </div>
  );
}

export default App;