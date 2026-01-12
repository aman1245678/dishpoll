import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDishes } from '../services/api';
import { RANK_POINTS } from '../utils/constants';

const ResultsTab = () => {
  const [dishes, setDishes] = useState([]);
  const [results, setResults] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, getAllVotes } = useAuth();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dishesData = await fetchDishes();
      setDishes(dishesData);
      
      const allVotes = getAllVotes();
      
      const dishScores = {};
      
      dishesData.forEach(dish => {
        dishScores[dish.id] = {
          dishId: dish.id,
          dishName: dish.dishName,
          description: dish.description,
          image: dish.image,
          totalPoints: 0,
          voteCount: 0,
          userRank: null
        };
      });
      
      Object.values(allVotes).forEach(userVote => {
        Object.entries(userVote).forEach(([dishId, rank]) => {
          const dishScore = dishScores[parseInt(dishId)];
          if (dishScore) {
            dishScore.totalPoints += RANK_POINTS[rank];
            dishScore.voteCount += 1;
          }
        });
      });
      
      const currentUserVotes = allVotes[user.id] || {};
      setUserVotes(currentUserVotes);
      
      Object.entries(currentUserVotes).forEach(([dishId, rank]) => {
        const dishScore = dishScores[parseInt(dishId)];
        if (dishScore) {
          dishScore.userRank = rank;
        }
      });
      
      const resultsArray = Object.values(dishScores)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((dish, index) => ({
          ...dish,
          position: index + 1
        }));
      
      setResults(resultsArray);
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load results. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getUserRankedDishes = () => {
    return results.filter(dish => dish.userRank !== null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button onClick={loadResults} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const userRankedDishes = getUserRankedDishes();

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Poll Results</h2>
        <p className="subtitle">
          Dishes ranked by total points from all users
        </p>
        
        {userRankedDishes.length > 0 ? (
          <div className="user-selections-summary">
            <h3>Your Selections:</h3>
            <div className="user-ranks-grid">
              {[1, 2, 3].map(rank => {
                const dish = userRankedDishes.find(d => d.userRank === rank);
                if (!dish) return null;
                
                return (
                  <div key={rank} className="user-rank-card">
                    <div className="rank-badge">Rank {rank}</div>
                    <div className="user-dish-name">{dish.dishName}</div>
                    <div className="user-dish-points">
                      {RANK_POINTS[rank]} points (your vote)
                    </div>
                    <div className="user-dish-position">
                      Overall Position: #{dish.position}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        ) : (
          <div className="no-votes-message">
            <p>You haven't voted yet. Go to the Voting tab to rank your favorite dishes!</p>
          </div>
        )}
      </div>
      
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Dish</th>
              <th>Total Points</th>
              <th>Votes Received</th>
              <th>Your Rank</th>
            </tr>
          </thead>
          <tbody>
            {results.map(dish => (
              <tr 
                key={dish.dishId} 
                className={dish.userRank ? 'user-selected-row' : ''}
              >
                <td className="position-cell">
                  <div className="position-badge">
                    #{dish.position}
                  </div>
                </td>
                <td className="dish-cell">
                  <div className="dish-info">
                    <img src={dish.image} alt={dish.dishName} className="dish-thumbnail" />
                    <div>
                      <div className="dish-name">{dish.dishName}</div>
                      <div className="dish-description">{dish.description}</div>
                    </div>
                  </div>
                </td>
                <td className="points-cell">
                  <div className="points-display">
                    <span className="points-value">{dish.totalPoints}</span>
                    <span className="points-label">points</span>
                  </div>
                </td>
                <td className="votes-cell">
                  {dish.voteCount} vote{dish.voteCount !== 1 ? 's' : ''}
                </td>
                <td className="user-rank-cell">
                  {dish.userRank ? (
                    <div className="user-rank-badge">
                      Rank {dish.userRank}
                      <span className="rank-points">
                        ({RANK_POINTS[dish.userRank]} pts from you)
                      </span>
                    </div>
                  ) : (
                    <span className="not-ranked">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color user-selected"></div>
          <span>Your selected dishes</span>
        </div>
      </div>
      
      <button onClick={loadResults} className="refresh-button">
        Refresh Results
      </button>
    </div>
  );
};

export default ResultsTab;