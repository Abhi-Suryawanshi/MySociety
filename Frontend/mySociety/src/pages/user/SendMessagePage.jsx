import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const SendMessagePage = ({ residentId, residentUserId, adminUserId, showMessage }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState([]); // State to hold past messages (sent and received)
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (residentUserId) {
      fetchMyMessages();
    } else {
      setLoadingHistory(false);
      showMessage('User ID not found. Please log in as a resident.', 'error');
    }
  }, [residentUserId]); // Depend on residentUserId to re-fetch if user changes

  const fetchMyMessages = async () => {
    setLoadingHistory(true);
    try {
      // Fetch messages where the current user is either the sender or receiver
      const data = await api.resident.getMessagesForUser(residentId); // Use residentId for path, but userId for query
      // Sort messages by creation date, newest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch your messages history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!residentUserId || !adminUserId) {
      showMessage('User or Admin ID is missing. Cannot send message.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Resident sends to Admin
      await api.resident.sendMessage(residentId, subject, content); // residentId is used in path
      showMessage('Message sent to admin successfully!', 'success');
      setSubject('');
      setContent('');
      fetchMyMessages(); // Refresh the list of messages
    } catch (error) {
      showMessage(error.message || 'Failed to send message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Send & View Messages</h1>

      {/* Message Submission Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-xl mx-auto mb-8 transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Send New Message to Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">Subject:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Message Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="6"
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 shadow-md transform hover:scale-105"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Message History */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-full mx-auto">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">My Messages (Sent & Received)</h2>
        {loadingHistory ? (
          <p className="text-center text-gray-600 py-8">Loading your messages history...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-600 text-center">You have no messages yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th> {/* Added Type column */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {message.senderUser?.id === residentUserId ? 'Sent' : 'Received'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{message.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{message.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        message.status === 'READ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMessagePage;