import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const ViewEventsPage = ({ showMessage }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.resident.getEvents();
      // Sort by event date, newest first
      const sortedData = data.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
      setEvents(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading events...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Upcoming Society Events</h1>

      {events.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No upcoming events scheduled.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200">
              <h3 className="text-2xl font-bold text-blue-700 mb-3">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-4">Date: {event.eventDate}</p>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewEventsPage;