import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerAPI, transactionAPI } from '../services/api';
import { ArrowLeft, Plus, Minus, Receipt } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'credit', amount: '', description: '', reference_number: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await customerAPI.getOne(id);
      setCustomer(data);
    } catch (err) {
      console.error('Failed to load customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await transactionAPI.create({
        customer_id: id,
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      setFormData({ type: 'credit', amount: '', description: '', reference_number: '' });
      loadCustomer();
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!customer) {
    return <div className="empty-state">Customer not found</div>;
  }

  return (
    <div>
      <Link to="/customers" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, marginBottom: 8 }}>{customer.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {customer.phone && <span>{customer.phone}</span>}
                {customer.email && <span> | {customer.email}</span>}
                {customer.address && <span> | {customer.address}</span>}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Current Balance</div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                className={parseFloat(customer.balance) > 0 ? 'negative' : 'positive'}>
                Rs. {parseFloat(customer.balance).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <h3>Transactions</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => { setFormData({ ...formData, type: 'payment' }); setShowModal(true); }}>
            <Plus size={18} /> Record Payment
          </button>
          <button className="btn btn-primary" onClick={() => { setFormData({ ...formData, type: 'credit' }); setShowModal(true); }}>
            <Minus size={18} /> Record Credit
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {customer.transactions.length === 0 ? (
            <div className="empty-state">No transactions yet</div>
          ) : (
            <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {customer.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td data-label="Date">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td data-label="Type">
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type === 'credit' ? 'Credit' : 'Payment'}
                      </span>
                    </td>
                    <td data-label="Amount" className={`balance ${tx.type === 'credit' ? 'negative' : 'positive'}`}>
                      {tx.type === 'credit' ? '-' : '+'} Rs. {parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td data-label="Description">{tx.description || '-'}</td>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{formData.type === 'credit' ? 'Record Credit' : 'Record Payment'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleTransaction}>
              <div className="modal-body">
                {error && <div className="error">{error}</div>}
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
                    placeholder="e.g., Monthly groceries"
                  />
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="e.g., Invoice #123"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={`btn ${formData.type === 'credit' ? 'btn-primary' : 'btn-secondary'}`}>
                  {formData.type === 'credit' ? 'Add Credit' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
