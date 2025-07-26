import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const MessagesPage = ({ showMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    fetchAllMessages();
  }, []);

  const fetchAllMessages = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getMessages(); // This now fetches all messages (initial and replies)
      // Sort messages by created_at, newest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch messages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    setMarkingRead(true);
    try {
      await api.admin.markMessageAsRead(messageId);
      showMessage('Message marked as read.', 'success');
      fetchAllMessages(); // Re-fetch to update status
    } catch (error) {
      showMessage(error.message || 'Failed to mark message as read.', 'error');
    } finally {
      setMarkingRead(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading messages...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">All Society Messages</h1>

      {messages.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No messages in the system.</p>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Sender</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Recipient (Flat No.)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Content</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Sent On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {message.senderRole === 'ADMIN' ? 'Admin' : (message.resident?.name || 'Resident')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {message.recipientResident?.flatNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{message.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{message.content}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      message.status === 'READ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {message.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {message.status === 'UNREAD' && message.senderRole === 'USER' && ( // Only admin can mark resident messages as read
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        disabled={markingRead}
                      >
                        Mark as Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;