import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDishes } from '../services/api';
import { RANK_POINTS } from '../utils/constants';

const VotingTab = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSelections, setUserSelections] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const { user, updateUserVotes, getUserVotes } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dishesData = await fetchDishes();
      setDishes(dishesData);
      
      const savedVotes = getUserVotes();
      if (savedVotes) {
        const selections = {};
        Object.entries(savedVotes).forEach(([dishId, rank]) => {
          selections[dishId] = parseInt(rank);
        });
        setUserSelections(selections);
        setHasSubmitted(true);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load dishes. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleRankChange = (dishId, newRank) => {
    const newSelections = { ...userSelections };
    const currentRank = newSelections[dishId];
    
    if (currentRank === parseInt(newRank)) {
      delete newSelections[dishId];
    } else {
      Object.keys(newSelections).forEach(id => {
        if (newSelections[id] === parseInt(newRank)) {
          delete newSelections[id];
        }
      });
      
      if (newRank) {
        newSelections[dishId] = parseInt(newRank);
      } else {
        delete newSelections[dishId];
      }
    }
    
    setUserSelections(newSelections);
  };

  const handleSubmit = () => {
    if (Object.keys(userSelections).length !== 3) {
      setError('Please select exactly 3 dishes with ranks 1, 2, and 3');
      return;
    }
    
    const ranks = Object.values(userSelections);
    if (!ranks.includes(1) || !ranks.includes(2) || !ranks.includes(3)) {
      setError('Please assign ranks 1, 2, and 3 to three different dishes');
      return;
    }
    
    updateUserVotes(userSelections);
    setHasSubmitted(true);
    setError('');
    alert('Your votes have been saved!');
  };

  const handleClear = () => {
    setUserSelections({});
    setHasSubmitted(false);
    updateUserVotes({});
    setError('');
  };

  const getDishRank = (dishId) => {
    return userSelections[dishId] || null;
  };

  const getRankedDishesCount = () => {
    return Object.keys(userSelections).length;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dishes...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dishes</h3>
        <p>{error}</p>
        <button onClick={loadData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="voting-container">
      <div className="voting-header">
        <h2>Vote for Your Favorite Dishes</h2>
        <p className="subtitle">
          Select exactly 3 dishes and rank them (1st, 2nd, 3rd)
        </p>
        
        <div className="selection-status">
          <span className="status-count">
            Selected: {getRankedDishesCount()}/3 dishes
          </span>
          {hasSubmitted && (
            <span className="status-saved">✓ Votes Saved</span>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      <div className="points-info">
        <h4>Points System:</h4>
        <ul>
          <li>Rank 1: {RANK_POINTS[1]} points</li>
          <li>Rank 2: {RANK_POINTS[2]} points</li>
          <li>Rank 3: {RANK_POINTS[3]} points</li>
        </ul>
      </div>
      
      <div className="dishes-grid">
        {dishes.map(dish => (
          <div key={dish.id} className="dish-card">
            <div className="dish-image">
              <img src={dish.image} alt={dish.dishName} />
            </div>
            
            <div className="dish-content">
              <h3 className="dish-name">{dish.dishName}</h3>
              <p className="dish-description">{dish.description}</p>
              
              <div className="rank-selection">
                <label>Select Rank:</label>
                <select
                  value={getDishRank(dish.id) || ''}
                  onChange={(e) => handleRankChange(dish.id, e.target.value)}
                  className="rank-select"
                >
                  <option value="">No Rank</option>
                  <option value="1" disabled={getDishRank(dish.id) !== 1 && Object.values(userSelections).includes(1)}>
                    Rank 1 (30 pts)
                  </option>
                  <option value="2" disabled={getDishRank(dish.id) !== 2 && Object.values(userSelections).includes(2)}>
                    Rank 2 (20 pts)
                  </option>
                  <option value="3" disabled={getDishRank(dish.id) !== 3 && Object.values(userSelections).includes(3)}>
                    Rank 3 (10 pts)
                  </option>
                </select>
                
                {getDishRank(dish.id) && (
                  <div className="selected-rank">
                    Selected: Rank {getDishRank(dish.id)} 
                    ({RANK_POINTS[getDishRank(dish.id)]} points)
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="voting-actions">
        <button onClick={handleSubmit} className="submit-button">
          {hasSubmitted ? 'Update Votes' : 'Submit Votes'}
        </button>
        <button onClick={handleClear} className="clear-button">
          Clear All Selections
        </button>
      </div>
      
      {hasSubmitted && (
        <div className="current-selections">
          <h3>Your Current Selections:</h3>
          <ul>
            {Object.entries(userSelections).map(([dishId, rank]) => {
              const dish = dishes.find(d => d.id === parseInt(dishId));
              if (!dish) return null;
              
              return (
                <li key={dishId}>
                  <strong>Rank {rank}:</strong> {dish.dishName} ({RANK_POINTS[rank]} points)
                </li>
              );
            }).filter(Boolean)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VotingTab;