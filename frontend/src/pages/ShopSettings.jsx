import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../services/api';
import { Store } from 'lucide-react';

const ShopSettings = () => {
  const { user, shop } = useAuth();
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadShop = useCallback(async () => {
    try {
      const data = await shopAPI.getOne(shop.id);
      setFormData({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
      });
    } catch (err) {
      console.error('Failed to load shop:', err);
    } finally {
      setLoading(false);
    }
  }, [shop.id]);

  useEffect(() => {
    if (shop?.id) {
      loadShop();
    }
  }, [shop, loadShop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await shopAPI.update(shop.id, formData);
      setSuccess('Shop settings updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user?.role !== 'owner') {
    return <div className="empty-state">Only the shop owner can modify settings.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Shop Settings</h1>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}
          {success && <div style={{ background: '#D1FAE5', color: 'var(--secondary)', padding: '10px 12px', borderRadius: 6, marginBottom: 16 }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Shop Name</label>
              <div style={{ position: 'relative' }}>
                <Store size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
