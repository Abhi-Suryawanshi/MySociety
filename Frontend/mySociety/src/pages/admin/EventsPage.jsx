import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const EventsPage = ({ showMessage }) => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', eventDate: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getEvents();
      // Sort by event date, newest first
      const sortedData = data.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
      setEvents(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate // Assuming eventDate is already in 'YYYY-MM-DD' format
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.admin.deleteEvent(id);
        showMessage('Event deleted successfully.', 'success');
        fetchEvents();
      } catch (error) {
        showMessage(error.message || 'Failed to delete event.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEvent) {
        await api.admin.updateEvent(editingEvent.id, formData);
        showMessage('Event updated successfully.', 'success');
      } else {
        await api.admin.createEvent(formData);
        showMessage('Event created successfully.', 'success');
      }
      setFormData({ title: '', description: '', eventDate: '' });
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      showMessage(error.message || 'Failed to save event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading events...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Manage Events</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-blue-100">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange}
                      rows="5" className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required></textarea>
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-gray-700 text-sm font-bold mb-2">Event Date:</label>
            <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 shadow-md transform hover:scale-105"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
            </button>
            {editingEvent && (
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({ title: '', description: '', eventDate: '' });
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
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">All Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No events scheduled yet.</p>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 p-6 rounded-xl shadow-sm bg-blue-50 hover:shadow-md transition-all duration-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-3">Date: {event.eventDate}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{event.description}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
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

export default EventsPage;