import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const ResidentsPage = ({ showMessage }) => {
  const [residents, setResidents] = useState([]);
  const [editingResident, setEditingResident] = useState(null); // null for add, object for edit
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', flatNumber: '', maintenanceCharge: '',
    username: '', password: '' // For creating new user
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getResidents();
      setResidents(data);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch residents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (resident) => {
    setEditingResident(resident);
    setFormData({
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      flatNumber: resident.flatNumber,
      maintenanceCharge: resident.maintenanceCharge.toString(),
      username: '', // Not editable via this form for existing users
      password: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resident and their associated user account? This action cannot be undone.')) {
      try {
        await api.admin.deleteResident(id);
        showMessage('Resident deleted successfully.', 'success');
        fetchResidents();
      } catch (error) {
        showMessage(error.message || 'Failed to delete resident.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingResident) {
        // Update existing resident
        await api.admin.updateResident(editingResident.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          flatNumber: formData.flatNumber,
          maintenanceCharge: parseFloat(formData.maintenanceCharge)
        });
        showMessage('Resident updated successfully.', 'success');
      } else {
        // Create new resident and user
        await api.admin.createResident({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          flatNumber: formData.flatNumber,
          maintenanceCharge: parseFloat(formData.maintenanceCharge),
          username: formData.username,
          password: formData.password
        });
        showMessage('Resident and user created successfully.', 'success');
      }
      setFormData({ name: '', email: '', phone: '', flatNumber: '', maintenanceCharge: '', username: '', password: '' });
      setEditingResident(null);
      fetchResidents();
    } catch (error) {
      showMessage(error.message || 'Failed to save resident. Ensure flat number and email are unique.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading residents...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Manage Residents</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-blue-100">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">
          {editingResident ? 'Edit Resident Details' : 'Add New Resident'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label htmlFor="flatNumber" className="block text-gray-700 text-sm font-bold mb-2">Flat Number:</label>
            <input type="text" id="flatNumber" name="flatNumber" value={formData.flatNumber} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label htmlFor="maintenanceCharge" className="block text-gray-700 text-sm font-bold mb-2">Maintenance Charge (₹):</label>
            <input type="number" id="maintenanceCharge" name="maintenanceCharge" value={formData.maintenanceCharge} onChange={handleChange}
                   className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" step="0.01" required />
          </div>
          {!editingResident && (
            <>
              <div>
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Resident Username:</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange}
                       className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required={!editingResident} />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Resident Password:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                       className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" required={!editingResident} />
              </div>
            </>
          )}
          <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 shadow-md transform hover:scale-105"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingResident ? 'Update Resident' : 'Add Resident')}
            </button>
            {editingResident && (
              <button
                type="button"
                onClick={() => {
                  setEditingResident(null);
                  setFormData({ name: '', email: '', phone: '', flatNumber: '', maintenanceCharge: '', username: '', password: '' });
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
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">Current Residents</h2>
        {residents.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No residents registered yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Flat Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Maintenance (₹)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {residents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resident.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resident.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resident.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resident.flatNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{resident.maintenanceCharge.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(resident)}
                        className="text-indigo-600 hover:text-indigo-800 mr-4 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resident.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        Delete
                      </button>
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

export default ResidentsPage;