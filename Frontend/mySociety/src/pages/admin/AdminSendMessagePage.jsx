import React, { useState } from 'react';
import { api } from '../../utils/api';

const AdminSendMessagePage = ({ showMessage }) => {
  const [flatNumber, setFlatNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.admin.sendMessageToResident({ flatNumber, subject, content });
      showMessage('Message sent to resident successfully!', 'success');
      setFlatNumber('');
      setSubject('');
      setContent('');
    } catch (error) {
      showMessage(error.message || 'Failed to send message. Please check flat number.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Send Message to Resident</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 max-w-xl mx-auto">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">Compose New Message</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="flatNumber" className="block text-gray-700 text-sm font-bold mb-2">Recipient Flat Number:</label>
            <input
              type="text"
              id="flatNumber"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">Subject:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Message Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="7"
              className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 shadow-md transform hover:scale-105"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSendMessagePage;