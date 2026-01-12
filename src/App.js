import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import VotingTab from './components/VotingTab';
import ResultsTab from './components/ResultsTab';
import ProtectedRoute from './components/ProtectedRoute';
import './styles.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('voting');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍽️ Dish Ranking Poll</h1>
          <div className="user-info">
            <span className="username">Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        
        <nav className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === 'voting' ? 'active' : ''}`}
            onClick={() => setActiveTab('voting')}
          >
            Vote for Dishes
          </button>
          <button
            className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            View Results
          </button>
        </nav>
      </header>
      
      <main className="dashboard-main">
        {activeTab === 'voting' ? <VotingTab /> : <ResultsTab />}
      </main>
      
      <footer className="dashboard-footer">
        <p>Dish Ranking App • Multiple users can vote for their favorite dishes</p>
        <p className="instructions">
          Instructions: Select exactly 3 dishes and rank them 1st, 2nd, and 3rd. 
          You can change your votes anytime.
        </p>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;