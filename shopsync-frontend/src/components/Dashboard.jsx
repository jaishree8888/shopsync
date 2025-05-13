import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ logout }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newItems, setNewItems] = useState({});
  const [shareData, setShareData] = useState({});
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('Dashboard mounted, token:', token);
    if (!token) {
      console.log('No token, redirecting to /login');
      window.location.href = '/login';
      return;
    }
    fetchLists();
    return () => console.log('Dashboard unmounted');
  }, []);

  const fetchLists = async () => {
    console.log('fetchLists called, token:', token);
    try {
      const res = await axios.get('http://localhost:3000/api/lists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('fetchLists success:', res.data);
      setLists(res.data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      setError(err.response?.data.msg || 'Failed to fetch lists');
      if (err.response?.status === 401) {
        console.log('401 Unauthorized, clearing token');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListName) {
      setError('Please enter a list name');
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:3000/api/lists',
        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('createList success:', res.data);
      setLists([...lists, res.data]);
      setNewListName('');
      setError('');
    } catch (err) {
      console.error('Create error:', err.response?.data);
      setError(err.response?.data.msg || 'Failed to create list');
      if (err.response?.status === 401) {
        console.log('401 Unauthorized, clearing token');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const addItem = async (listId) => {
    const text = newItems[listId] || '';
    if (!text) {
      setError('Please enter an item');
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:3000/api/lists/${listId}/add-item`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLists(lists.map((list) => (list._id === listId ? res.data : list)));
      setNewItems((prev) => ({ ...prev, [listId]: '' }));
      setError('');
    } catch (err) {
      console.error('Add item error:', err.response?.data);
      setError(err.response?.data.msg || 'Failed to add item');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const toggleItem = async (listId, itemId) => {
    console.log('Toggling item:', listId, itemId);
    try {
      const res = await axios.put(
        `http://localhost:3000/api/lists/${listId}/toggle-item/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Toggle response:', res.data);
      setLists(lists.map((list) => (list._id === listId ? res.data : list)));
      setError('');
    } catch (err) {
      console.error('Toggle error:', err.response?.data);
      setError(err.response?.data.msg || 'Failed to toggle item');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
      const res = await axios.put(
        `http://localhost:3000/api/lists/${listId}/share`,
        { username, relationship, customRelationship },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLists(lists.map((list) => (list._id === listId ? res.data : list)));
      setShareData((prev) => ({ ...prev, [listId]: {} }));
      setError('');
      alert('List shared successfully!');
    } catch (err) {
      console.error('Share error:', err.response?.data);
      setError(err.response?.data.msg || 'Failed to share list');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="dashboard">
      <h1 style={{ color: '#ff9f1c' }}>ShopSync Dashboard</h1>
      <button
        onClick={logout}
        style={{ background: '#ff4444', color: '#fff', marginBottom: '20px' }}
      >
        Logout
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={createList} className="new-list-form">
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