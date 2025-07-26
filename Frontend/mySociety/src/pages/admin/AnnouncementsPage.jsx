import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const AnnouncementsPage = ({ showMessage }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAnnouncements();
      // Sort by announcement date, newest first
      const sortedData = data.sort((a, b) => new Date(b.announcementDate) - new Date(a.announcementDate));
      setAnnouncements(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({ title: announcement.title, content: announcement.content });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      try {
        await api.admin.deleteAnnouncement(id);
        showMessage('Announcement deleted successfully.', 'success');
        fetchAnnouncements();
      } catch (error) {
        showMessage(error.message || 'Failed to delete announcement.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAnnouncement) {
        await api.admin.updateAnnouncement(editingAnnouncement.id, formData);
        showMessage('Announcement updated successfully.', 'success');
      } else {
        await api.admin.createAnnouncement(formData);
        showMessage('Announcement created successfully.', 'success');
      }
      setFormData({ title: '', content: '' });
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      showMessage(error.message || 'Failed to save announcement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading announcements...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Manage Announcements</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-blue-100">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">
          {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
            <textarea id="content" name="content" value={formData.content} onChange={handleChange}
                      rows="7" className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required></textarea>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 shadow-md transform hover:scale-105"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingAnnouncement ? 'Update Announcement' : 'Create Announcement')}
            </button>
            {editingAnnouncement && (
              <button
                type="button"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setFormData({ title: '', content: '' });
                }}
                className="px-6 py-3 bg-gray-400 text-white rounded-full hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition duration-300 shadow-md transform hover:scale-105"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">All Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No announcements posted yet.</p>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border border-gray-200 p-6 rounded-xl shadow-sm bg-blue-50 hover:shadow-md transition-all duration-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{announcement.title}</h3>
                <p className="text-sm text-gray-500 mb-3">Date: {announcement.announcementDate}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{announcement.content}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;