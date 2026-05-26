import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI } from '../services/api';
import { Plus, Minus } from 'lucide-react';

const Dashboard = () => {
  const { user, shop } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await reportAPI.getDashboard();
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const { summary, recent_transactions } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{shop?.name}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Customers</div>
          <div className="value">{summary.total_customers}</div>
          <Link to="/customers" style={{ color: 'var(--primary)', fontSize: 13 }}>View all</Link>
        </div>

        <div className="stat-card">
          <div className="label">Outstanding Credit</div>
          <div className="value negative">Rs. {summary.total_outstanding.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="label">Today's Credits</div>
          <div className="value" style={{ color: 'var(--danger)' }}>
            <Plus size={20} style={{ display: 'inline', marginRight: 4 }} />
            Rs. {summary.today_credits.toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="label">Today's Payments</div>
          <div className="value positive">
            <Minus size={20} style={{ display: 'inline', marginRight: 4 }} />
            Rs. {summary.today_payments.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Transactions</h3>
          <Link to="/transactions" className="text-link">View all</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recent_transactions.length === 0 ? (
            <div className="empty-state">No transactions yet</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td data-label="Customer">{tx.customer_name || 'Unknown'}</td>
                      <td data-label="Type">
                        <span className={`badge badge-${tx.type}`}>
                          {tx.type === 'credit' ? 'Credit' : 'Payment'}
                        </span>
                      </td>
                      <td data-label="Amount" className={`balance ${tx.type === 'credit' ? 'negative' : 'positive'}`}>
                        {tx.type === 'credit' ? '-' : '+'} Rs. {parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td data-label="Date">{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
