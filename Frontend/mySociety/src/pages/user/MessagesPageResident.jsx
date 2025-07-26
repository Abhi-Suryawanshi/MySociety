import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const MessagesPageResident = ({ residentId, residentUserId, showMessage }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingToMessageId, setReplyingToMessageId] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (residentId && residentUserId) {
      fetchConversations();
    } else {
      setLoading(false);
      showMessage('Resident ID or User ID not found. Please log in as a resident.', 'error');
    }
  }, [residentId, residentUserId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await api.resident.getConversations(residentId);
      setConversations(data);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch your messages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e, parentMessageId) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      showMessage('Reply content cannot be empty.', 'error');
      return;
    }
    setSubmittingReply(true);
    try {
      await api.resident.replyToMessage(residentId, {
        parentMessageId: parentMessageId,
        content: replyContent
      });
      showMessage('Reply sent successfully!', 'success');
      setReplyContent('');
      setReplyingToMessageId(null); // Close reply box
      fetchConversations(); // Refresh conversations
    } catch (error) {
      showMessage(error.message || 'Failed to send reply.', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.resident.markMessageAsRead(messageId);
      showMessage('Message marked as read.', 'success');
      fetchConversations(); // Refresh conversations
    } catch (error) {
      showMessage(error.message || 'Failed to mark message as read.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading messages...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No messages from admin yet.</p>
      ) : (
        <div className="space-y-8">
          {conversations.map((thread, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
              <h2 className="text-3xl font-semibold text-blue-700 mb-4">{thread[0].subject}</h2>
              <div className="space-y-4">
                {thread.map((message) => (
                  <div key={message.id} className={`p-4 rounded-lg shadow-sm ${
                    message.senderRole === 'ADMIN' ? 'bg-blue-50 border-l-4 border-blue-300' : 'bg-gray-50 border-l-4 border-gray-300 ml-8'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-800">
                        {message.senderRole === 'ADMIN' ? 'Admin' : 'You'}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({new Date(message.createdAt).toLocaleString()})
                        </span>
                      </p>
                      {message.status === 'UNREAD' && message.recipientResident?.id === residentId && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors duration-200"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{message.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form - only if the last message in the thread is from Admin to this resident */}
              {thread[thread.length - 1].senderRole === 'ADMIN' && thread[thread.length - 1].recipientResident?.id === residentId && (
                <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Reply to this conversation:</h3>
                  <form onSubmit={(e) => handleReplySubmit(e, thread[0].id)} className="space-y-4">
                    <div>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows="4"
                        placeholder="Type your reply here..."
                        className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 shadow-md transform hover:scale-105"
                        disabled={submittingReply}
                      >
                        {submittingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPageResident;