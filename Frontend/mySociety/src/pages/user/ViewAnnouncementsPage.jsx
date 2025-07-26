import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const ViewAnnouncementsPage = ({ showMessage }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.resident.getAnnouncements();
      // Sort by announcement date, newest first
      const sortedData = data.sort((a, b) => new Date(b.announcementDate) - new Date(a.announcementDate));
      setAnnouncements(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading announcements...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Society Announcements</h1>

      {announcements.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No announcements posted yet.</p>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200">
              <h3 className="text-2xl font-bold text-blue-700 mb-3">{announcement.title}</h3>
              <p className="text-sm text-gray-500 mb-4">Date: {announcement.announcementDate}</p>
              <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAnnouncementsPage;