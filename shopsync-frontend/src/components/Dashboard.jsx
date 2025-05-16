import React, { useState, useEffect } from 'react';
import api from "../api.jsx";
import "./Dashboard.css";

function Dashboard({ token, logout }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newItems, setNewItems] = useState({});
  const [shareData, setShareData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted, token:', token);
    if (!token) {
      console.log('No token, redirecting to /login');
      logout();
      return;
    }
    fetchLists();
    return () => console.log('Dashboard unmounted');
  }, [token, logout]);

  

  const fetchLists = async () => {
    setIsLoading(true);
    console.log('fetchLists called, token:', token);
    try {
      const res = await api.get('/api/lists');
      console.log('fetchLists success:', res.data);
      setLists(res.data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to fetch lists');
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListName) {
      setError('Please enter a list name');
      return;
    }
    try {
      const res = await api.post('/api/lists', { name: newListName });
      console.log('createList success:', res.data);
      setLists([...lists, res.data]);
      setNewListName('');
      setError('');
    } catch (err) {
      console.error('Create error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to create list');
    }
  };

  const addItem = async (listId) => {
    const text = newItems[listId] || '';
    if (!text) {
      setError('Please enter an item');
      return;
    }
    try {
      const res = await api.put(`/api/lists/${listId}/add-item`, { text });
      setLists(lists.map((list) => (list._id === listId ? res.data : list)));
      setNewItems((prev) => ({ ...prev, [listId]: '' }));
      setError('');
    } catch (err) {
      console.error('Add item error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to add item');
    }
  };

  const toggleItem = async (listId, itemId) => {
    console.log('Toggling item:', listId, itemId);
    try {
      const res = await api.put(`/api/lists/${listId}/toggle-item/${itemId}`, {});
      console.log('Toggle response:', res.data);
      setLists(lists.map((list) => (list._id === listId ? res.data : list)));
      setError('');
    } catch (err) {
      console.error('Toggle error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to toggle item');
    }
  };

  const shareList = async (listId) => {
    const { username, relationship, customRelationship } = shareData[listId] || {};
    if (!username || !relationship) {
      setError('Please provide username and relationship');
      return;
    }
    if (relationship === 'other' && !customRelationship) {
      setError('Please provide a custom relationship');
      return;
    }
    try {
      const res = await api.put(`/api/lists/${listId}/share`, {
        username,
        relationship,
        customRelationship,
      });
      setLists(lists.map((list) => (list._id === listId ? res.data : list)));
      setShareData((prev) => ({ ...prev, [listId]: {} }));
      setError('');
      alert('List shared successfully!');
    } catch (err) {
      console.error('Share error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to share list');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '10px', lineHeight: '1.2', color: 'vibrant blue', position: 'absolute', left: '20px', top: '20px'}}>ShopSync Dashboard</h1>
     
      <button
        onClick={logout}
        style={{ background: '#ff4444', color: '#fff', marginBottom: '20px' , position: 'absolute', right: '20px', top: '20px', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'}}
      >
        Logout
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
     
      <form onSubmit={createList} className="new-list-form" style={{ marginTop: '100px' }}>
        <input
          type="text"
          placeholder="New List Name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          required
        />
        <button type="submit" style={{ background: '#00d4ff' }}>
          Create List
        </button>
      </form>

      <div className="lists-container">
        {lists.map((list) => (
          <div key={list._id} className="list-card">
            <h3>{list.name}</h3>
            <ul>
              {list.items.map((item) => (
                <li key={item._id} className={item.bought ? 'bought' : ''}>
                  <input
                    type="checkbox"
                    checked={item.bought}
                    onChange={() => toggleItem(list._id, item._id)}
                  />
                  {item.text}
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItem(list._id);
              }}
              className="add-item-form"
            >
              <input
                type="text"
                placeholder="Add Item"
                value={newItems[list._id] || ''}
                onChange={(e) =>
                  setNewItems((prev) => ({ ...prev, [list._id]: e.target.value }))
                }
                required
              />
              <button type="submit" style={{ background: '#feca57' }}>
                Add
              </button>
            </form>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                shareList(list._id);
              }}
              className="share-form"
            >
              <input
                type="text"
                placeholder="Share with (username)"
                value={shareData[list._id]?.username || ''}
                onChange={(e) =>
                  setShareData((prev) => ({
                    ...prev,
                    [list._id]: { ...prev[list._id], username: e.target.value },
                  }))
                }
                required
              />
              <select
                value={shareData[list._id]?.relationship || ''}
                onChange={(e) =>
                  setShareData((prev) => ({
                    ...prev,
                    [list._id]: { ...prev[list._id], relationship: e.target.value },
                  }))
                }
                required
              >
                <option value="">Select relationship</option>
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="neighbour">Neighbour</option>
                <option value="other">Other</option>
              </select>
              {shareData[list._id]?.relationship === 'other' && (
                <input
                  type="text"
                  placeholder="Custom relationship"
                  value={shareData[list._id]?.customRelationship || ''}
                  onChange={(e) =>
                    setShareData((prev) => ({
                      ...prev,
                      [list._id]: {
                        ...prev[list._id],
                        customRelationship: e.target.value,
                      },
                    }))
                  }
                  required
                />
              )}
              <button type="submit" style={{ background: '#1dd1a1' }}>
                Share
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;