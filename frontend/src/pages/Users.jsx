import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ email: user.email, password: '', name: user.name });
    } else {
      setEditingUser(null);
      setFormData({ email: '', password: '', name: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const updates = { name: formData.name };
        if (formData.password) updates.password = formData.password;
        await userAPI.update(editingUser.id, updates);
      } else {
        await userAPI.create(formData);
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove ${user.name}? This cannot be undone.`)) return;

    try {
      await userAPI.delete(user.id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Team Members</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {users.length === 0 ? (
            <div className="empty-state">No team members</div>
          ) : (
            <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Name" style={{ fontWeight: 500 }}>{user.name}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Role">
                      <span className="badge" style={{
                        background: user.role === 'owner' ? '#DBEAFE' : '#E2E8F0',
                        color: user.role === 'owner' ? 'var(--primary)' : 'var(--text-secondary)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td data-label="Actions">
                      {user.role !== 'owner' && (
                        <div className="actions">
                          <button className="btn btn-outline" onClick={() => openModal(user)} style={{ padding: '6px 10px' }}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(user)} style={{ padding: '6px 10px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error">{error}</div>}
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    required={!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label>{editingUser ? 'New Password' : 'Password'} {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
