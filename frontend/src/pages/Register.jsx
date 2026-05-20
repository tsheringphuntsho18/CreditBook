import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Store, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    shopName: '',
    shopAddress: '',
    shopPhone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Start managing your shop's credit</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                style={{ paddingLeft: 40, paddingRight: 44 }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Shop Details</p>

          <div className="form-group">
            <label>Shop Name</label>
            <div style={{ position: 'relative' }}>
              <Store size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="My Shop"
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Shop Address (optional)</label>
            <input
              type="text"
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleChange}
              placeholder="123 Main Street"
            />
          </div>

          <div className="form-group">
            <label>Shop Phone (optional)</label>
            <input
              type="text"
              name="shopPhone"
              value={formData.shopPhone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
