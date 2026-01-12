import React, { createContext, useState, useContext, useEffect } from 'react';
import { USERS } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('dishPollUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('dishPollUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    try {
      const foundUser = USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (foundUser) {
        const userData = { id: foundUser.id, username: foundUser.username };
        setUser(userData);
        localStorage.setItem('dishPollUser', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dishPollUser');
    localStorage.removeItem(`userVotes_${user?.id}`);
  };

  const updateUserVotes = (votes) => {
    if (user) {
      localStorage.setItem(`userVotes_${user.id}`, JSON.stringify(votes));
    }
  };

  const getUserVotes = () => {
    if (user) {
      const storedVotes = localStorage.getItem(`userVotes_${user.id}`);
      return storedVotes ? JSON.parse(storedVotes) : null;
    }
    return null;
  };

  const getAllVotes = () => {
    const allVotes = {};
    USERS.forEach(user => {
      const userVotes = localStorage.getItem(`userVotes_${user.id}`);
      if (userVotes) {
        allVotes[user.id] = JSON.parse(userVotes);
      }
    });
    return allVotes;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserVotes,
    getUserVotes,
    getAllVotes
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};