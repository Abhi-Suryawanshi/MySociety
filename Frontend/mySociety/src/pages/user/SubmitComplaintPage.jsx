import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const SubmitComplaintPage = ({ residentId, showMessage }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]); // State to hold past complaints
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (residentId) {
      fetchMyComplaints();
    } else {
      setLoadingHistory(false);
      showMessage('Resident ID not found. Please log in as a resident.', 'error');
    }
  }, [residentId]);

  const fetchMyComplaints = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.resident.getResidentComplaints(residentId);
      // Sort complaints by creation date, newest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch your complaints history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!residentId) {
      showMessage('Resident ID is missing. Please log in as a resident.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.resident.submitComplaint(residentId, { subject, description });
      showMessage('Complaint submitted successfully!', 'success');
      setSubject('');
      setDescription('');
      fetchMyComplaints(); // Refresh the list of complaints
    } catch (error) {
      showMessage(error.message || 'Failed to submit complaint.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Submit & Track Complaints</h1>

      {/* Complaint Submission Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">Submit New Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>

      {/* Complaint History */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 max-w-full mx-auto">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">My Previous Complaints</h2>
        {loadingHistory ? (
          <p className="text-center text-gray-600 py-4">Loading your complaints history...</p>
        ) : complaints.length === 0 ? (
          <p className="text-gray-600 text-center py-4">You have not submitted any complaints yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Submitted On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{complaint.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(complaint.createdAt).toLocaleDateString()}
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

export default SubmitComplaintPage;