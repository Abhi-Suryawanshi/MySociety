// This file centralizes API calls for easier management and potential token injection.

const API_BASE_URL = 'http://localhost:8080/api'; // Your Spring Boot backend URL

// A callback function to be called when an unauthorized response is received.
// This will typically be set by the main App component to trigger a global logout.
let onUnauthorizedCallback = null;

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const fetchData = async (url, method = 'GET', body = null, authRequired = true) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authRequired && getAuthHeaders())
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);

    // If authentication is required and the response is 401 (Unauthorized) or 403 (Forbidden),
    // trigger the global unauthorized callback (e.g., to log out the user).
    if (authRequired && (response.status === 401 || response.status === 403)) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      // Re-throw the error to ensure the calling component also handles it
      // and doesn't proceed with potentially stale data.
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Authentication required or access denied.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Something went wrong');
    }
    // Handle no content responses (e.g., 204 No Content)
    if (response.status === 204) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const api = {
  // Function to register the unauthorized handler from the App component
  setOnUnauthorizedHandler: (handler) => {
    onUnauthorizedCallback = handler;
  },

  // Auth
  login: (credentials) => fetchData('/auth/login', 'POST', credentials, false),
  logout: () => fetchData('/auth/logout', 'POST', null, true),

  // Admin Endpoints
  admin: {
    getResidents: () => fetchData('/admin/residents'),
    createResident: (residentData) => fetchData('/admin/residents', 'POST', residentData),
    updateResident: (id, residentData) => fetchData(`/admin/residents/${id}`, 'PUT', residentData),
    deleteResident: (id) => fetchData(`/admin/residents/${id}`, 'DELETE'),

    getComplaints: () => fetchData('/admin/complaints'),
    updateComplaintStatus: (id, status) => fetchData(`/admin/complaints/${id}/status`, 'PUT', { status }),

    getAnnouncements: () => fetchData('/admin/announcements'),
    createAnnouncement: (announcementData) => fetchData('/admin/announcements', 'POST', announcementData),
    updateAnnouncement: (id, announcementData) => fetchData(`/admin/announcements/${id}`, 'PUT', announcementData),
    deleteAnnouncement: (id) => fetchData(`/admin/announcements/${id}`, 'DELETE'),

    getEvents: () => fetchData('/admin/events'),
    createEvent: (eventData) => fetchData('/admin/events', 'POST', eventData),
    updateEvent: (id, eventData) => fetchData(`/admin/events/${id}`, 'PUT', eventData),
    deleteEvent: (id) => fetchData(`/admin/events/${id}`, 'DELETE'),

    getMessages: () => fetchData('/admin/messages'), // Get all messages (might be initial or replies)
    markMessageAsRead: (id) => fetchData(`/admin/messages/${id}/read`, 'PUT'),
    // New: Admin sends initial message to a resident by flat number
    sendMessageToResident: (messageData) => fetchData('/admin/messages/send-to-resident', 'POST', messageData),
  },

  // Resident Endpoints
  resident: {
    getResidentDetails: (residentId) => fetchData(`/resident/${residentId}`),
    markMaintenancePaid: (residentId) => fetchData(`/resident/${residentId}/maintenance/markPaid`, 'PUT'),
    submitComplaint: (residentId, complaintData) => fetchData(`/resident/${residentId}/complaints`, 'POST', complaintData),
    getResidentComplaints: (residentId) => fetchData(`/resident/${residentId}/complaints`),
    getAnnouncements: () => fetchData('/resident/announcements'), // No residentId in path as it's general
    getEvents: () => fetchData('/resident/events'), // No residentId in path as it's general
    // New: Get all message conversations for a resident
    getConversations: (residentId) => fetchData(`/resident/${residentId}/messages/conversations`),
    // New: Resident replies to an admin message
    replyToMessage: (residentId, replyData) => fetchData(`/resident/${residentId}/messages/reply`, 'POST', replyData),
    markMessageAsRead: (messageId) => fetchData(`/resident/messages/${messageId}/read`, 'PUT'), // Resident can mark messages sent to them as read
  }
};