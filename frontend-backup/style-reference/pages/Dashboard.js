import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Activity, Settings } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const stats = [
    {
      title: "Projects",
      value: "12",
      icon: <Activity size={24} />,
      color: "#667eea"
    },
    {
      title: "Tasks",
      value: "48",
      icon: <Settings size={24} />,
      color: "#764ba2"
    },
    {
      title: "Completed",
      value: "36",
      icon: <Calendar size={24} />,
      color: "#27ca3f"
    }
  ];

  const recentActivities = [
    {
      action: "Project Alpha completed",
      time: "2 hours ago",
      type: "success"
    },
    {
      action: "New task assigned",
      time: "4 hours ago",
      type: "info"
    },
    {
      action: "Team meeting scheduled",
      time: "1 day ago",
      type: "warning"
    },
    {
      action: "Code review submitted",
      time: "2 days ago",
      type: "success"
    }
  ];

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="dashboard-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>!
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Recent Activity */}
          <motion.div 
            className="activity-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className={`activity-item ${activity.type}`}>
                  <div className="activity-content">
                    <p className="activity-action">{activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <div className="activity-indicator"></div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="quick-actions-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <button className="action-card">
                <div className="action-icon">
                  <Activity size={20} />
                </div>
                <span className="action-text">New Project</span>
              </button>
              <button className="action-card">
                <div className="action-icon">
                  <Settings size={20} />
                </div>
                <span className="action-text">Settings</span>
              </button>
              <button className="action-card">
                <div className="action-icon">
                  <Mail size={20} />
                </div>
                <span className="action-text">Messages</span>
              </button>
              <button className="action-card">
                <div className="action-icon">
                  <User size={20} />
                </div>
                <span className="action-text">Profile</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* User Profile Card */}
        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{user?.name || 'User'}</h3>
              <p className="profile-role">{user?.role || 'User'}</p>
            </div>
          </div>
          <div className="profile-details">
            <div className="profile-item">
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
            <div className="profile-item">
              <Calendar size={16} />
              <span>Member since {new Date().getFullYear()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 