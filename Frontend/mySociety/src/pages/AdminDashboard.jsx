import React from 'react';

const AdminDashboard = ({ onNavigate }) => {
  return (
    <div className="container mx-auto p-8 bg-white rounded-xl shadow-2xl my-8">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-10 text-center tracking-tight">Admin Dashboard</h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
        Welcome, Admin! 
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DashboardCard
          title="Manage Residents"
          description="Add, view, update, or delete resident details and assign flats with maintenance charges."
          onClick={() => onNavigate('/admin/residents')}
          icon="🏡"
        />
        <DashboardCard
          title="Manage Complaints"
          description="Oversee all submitted complaints, track their status, and ensure timely resolution."
          onClick={() => onNavigate('/admin/complaints')}
          icon="📝"
        />
        <DashboardCard
          title="Manage Announcements"
          description="Create, edit, or remove important announcements and circulars for the entire society."
          onClick={() => onNavigate('/admin/announcements')}
          icon="📢"
        />
        <DashboardCard
          title="Manage Events"
          description="Plan, add, update, or delete upcoming events like meetings, celebrations, and community gatherings."
          onClick={() => onNavigate('/admin/events')}
          icon="🗓️"
        />
        <DashboardCard
          title="View All Messages"
          description="Review all messages sent by residents and track their read status."
          onClick={() => onNavigate('/admin/messages')}
          icon="✉️"
        />
        <DashboardCard
          title="Send Message to Resident"
          description="Initiate direct communication with individual residents by specifying their flat number."
          onClick={() => onNavigate('/admin/send-message')}
          icon="💬"
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, onClick, icon }) => (
  <div
    onClick={onClick}
    className="bg-white p-7 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-blue-100 transform hover:-translate-y-2 flex flex-col items-center text-center"
  >
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-blue-800 mb-3">{title}</h3>
    <p className="text-gray-600 text-base mb-5">{description}</p>
    <button className="mt-auto px-6 py-3 bg-gradient-to-r from-red-600 to-blue-700 text-white rounded-full hover:from-pink-700 hover:to-blue-800 transition duration-300 shadow-lg transform hover:scale-105">
      Go to {title.split(' ')[1]}
    </button>
  </div>
);

export default AdminDashboard;