import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const ComplaintsPage = ({ showMessage }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getComplaints();
      // Sort complaints by creation date, newest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(sortedData);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.admin.updateComplaintStatus(complaintId, newStatus);
      showMessage('Complaint status updated successfully.', 'success');
      fetchComplaints(); // Re-fetch to update the list
    } catch (error) {
      showMessage(error.message || 'Failed to update complaint status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading complaints...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Manage Complaints</h1>

      {complaints.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No complaints submitted yet.</p>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Resident</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Flat No.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Submitted On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.resident.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.resident.flatNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.subject}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {complaint.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(complaint.id, 'RESOLVED')}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        disabled={updatingStatus}
                      >
                        Mark Resolved
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

export default ComplaintsPage;