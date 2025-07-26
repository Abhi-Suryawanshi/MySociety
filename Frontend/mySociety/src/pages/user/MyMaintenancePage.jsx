import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const MyMaintenancePage = ({ residentId, flatNumber, showMessage }) => {
  const [residentDetails, setResidentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    if (residentId) {
      fetchResidentDetails();
    } else {
      setLoading(false);
      showMessage('Resident ID not found. Please log in as a resident.', 'error');
    }
  }, [residentId]);

  const fetchResidentDetails = async () => {
    setLoading(true);
    try {
      const data = await api.resident.getResidentDetails(residentId);
      setResidentDetails(data);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch resident details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (window.confirm('Are you sure you want to mark your maintenance as paid? (This is a simulated action)')) {
      setMarkingPaid(true);
      try {
        await api.resident.markMaintenancePaid(residentId);
        showMessage('Maintenance marked as paid (simulated).', 'success');
        // In a real app, you'd update a 'paid' status in the DB and re-fetch.
        // For this example, we just show a message.
      } catch (error) {
        showMessage(error.message || 'Failed to mark maintenance as paid.', 'error');
      } finally {
        setMarkingPaid(false);
      }
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading maintenance details...</div>;
  }

  if (!residentDetails) {
    return <div className="text-center text-red-600 py-10">Could not load resident details.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Maintenance</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 max-w-lg mx-auto">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6 text-center">Flat {residentDetails.flatNumber}</h2>
        <div className="space-y-4 text-gray-700 text-lg">
          <p><strong>Name:</strong> {residentDetails.name}</p>
          <p><strong>Email:</strong> {residentDetails.email}</p>
          <p><strong>Phone:</strong> {residentDetails.phone}</p>
          <p className="text-3xl font-extrabold text-green-700 mt-6">
            Due Amount: ₹{residentDetails.maintenanceCharge.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 italic mt-2">
            (Note: In this simplified version, marking as paid is a simulated action. A real system would integrate with payment gateways or require admin verification.)
          </p>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={handleMarkAsPaid}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 shadow-lg transform hover:scale-105 text-xl font-semibold"
            disabled={markingPaid}
          >
            {markingPaid ? 'Marking...' : 'Mark as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyMaintenancePage;