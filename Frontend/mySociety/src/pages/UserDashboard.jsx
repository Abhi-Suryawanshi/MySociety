import React from 'react';

const UserDashboard = ({ onNavigate }) => {
  return (
    <div className="container mx-auto p-8 bg-white rounded-xl shadow-2xl my-8">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-10 text-center tracking-tight">Resident Dashboard</h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
        Welcome ! 
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DashboardCard
          title="My Maintenance"
          description="View your current and past maintenance dues and easily mark payments."
          onClick={() => onNavigate('/user/maintenance')}
          icon="💰"
        />
        <DashboardCard
          title="Complaints"
          description="Submit new complaints and track the real-time status of all your previously lodged issues."
          onClick={() => onNavigate('/user/complaints')}
          icon="📝"
        />
        <DashboardCard
          title="Announcements"
          description="Stay informed with the latest announcements and important circulars from the society administration."
          onClick={() => onNavigate('/user/announcements')}
          icon="📢"
        />
        <DashboardCard
          title="Events"
          description="Discover upcoming society events, meetings, and celebrations. Don't miss out!"
          onClick={() => onNavigate('/user/events')}
          icon="🎉"
        />
        <DashboardCard
          title="Messages"
          description="View messages from the admin and reply to ongoing conversations."
          onClick={() => onNavigate('/user/messages')}
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
      Go to {title.split(' ')[0]}
    </button>
  </div>
);

export default UserDashboard;