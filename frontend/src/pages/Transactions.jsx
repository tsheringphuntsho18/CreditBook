import { useState, useEffect, useCallback } from 'react';
import { transactionAPI, customerAPI } from '../services/api';
import { Plus, Filter, Receipt } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', customer_id: '', page: 1 });
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ customer_id: '', type: 'credit', amount: '', description: '', reference_number: '' });
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      const result = await customerAPI.getAll({ limit: 100 });
      setCustomers(result.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const result = await transactionAPI.getAll(params);
      setTransactions(result.transactions);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await transactionAPI.create({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      setFormData({ customer_id: '', type: 'credit', amount: '', description: '', reference_number: '' });
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateReceipt = async (transactionId) => {
    try {
      const receipt = await transactionAPI.generateReceipt(transactionId);
      window.open(`http://localhost:3001/api/receipts/${receipt.id}`, '_blank');
    } catch (err) {
      alert('Failed to generate receipt: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Transaction
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{ width: 150 }}
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="payment">Payment</option>
          </select>
          <select
            value={filters.customer_id}
            onChange={(e) => handleFilterChange('customer_id', e.target.value)}
            style={{ width: 200 }}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">No transactions found</div>
          ) : (
            <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td data-label="Date">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td data-label="Customer">{tx.customer_name || 'Unknown'}</td>
                    <td data-label="Type">
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type === 'credit' ? 'Credit' : 'Payment'}
                      </span>
                    </td>
                    <td data-label="Amount" className={`balance ${tx.type === 'credit' ? 'negative' : 'positive'}`}>
                      {tx.type === 'credit' ? '-' : '+'} Rs. {parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td data-label="Description">{tx.description || '-'}</td>
                    <td data-label="Created By">{tx.user_name || '-'}</td>
                    <td data-label="Receipt">
                      <button className="btn btn-outline" onClick={() => handleGenerateReceipt(tx.id)} style={{ padding: '4px 8px' }}>
                        <Receipt size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1}>
            Previous
          </button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i + 1} onClick={() => setFilters({ ...filters, page: i + 1 })} className={filters.page === i + 1 ? 'active' : ''}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page === pagination.pages}>
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Transaction</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error">{error}</div>}
                <div className="form-group">
                  <label>Customer *</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="credit">Credit (owes you)</option>
                    <option value="payment">Payment (paid you)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
