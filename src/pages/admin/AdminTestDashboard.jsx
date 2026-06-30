import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminTestDashboard() {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Adjust Balance Form State
  const [adjUserId, setAdjUserId] = useState('');
  const [adjCurrency, setAdjCurrency] = useState('USD');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    // Fetch pending deposits
    const { data: depData } = await supabase
      .from('deposits')
      .select('*')
      .eq('status', 'pending');
    
    // Fetch pending withdrawals
    const { data: withData } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending');

    if (depData) setDeposits(depData);
    if (withData) setWithdrawals(withData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveDeposit = async (id) => {
    try {
      const { error } = await supabase.rpc('approve_deposit', { p_deposit_id: id });
      if (error) throw error;
      setMessage(`Deposit ${id} approved successfully!`);
      fetchData(); // Refresh lists
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleApproveWithdrawal = async (id) => {
    try {
      const { error } = await supabase.rpc('approve_withdrawal', { p_withdrawal_id: id });
      if (error) throw error;
      setMessage(`Withdrawal ${id} approved successfully!`);
      fetchData();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.rpc('adjust_balance', {
        p_target_user_id: adjUserId,
        p_currency: adjCurrency,
        p_amount: parseFloat(adjAmount),
        p_reason: adjReason
      });
      if (error) throw error;
      setMessage(`Adjusted balance for ${adjUserId} successfully!`);
      setAdjUserId(''); setAdjAmount(''); setAdjReason('');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Harness...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Admin Money Layer Test Harness</h1>
      {message && <div style={{ padding: '1rem', background: '#ffeebb', marginBottom: '1rem', color: '#333' }}>{message}</div>}

      <section style={{ marginBottom: '3rem' }}>
        <h2>Pending Deposits ({deposits.length})</h2>
        {deposits.length === 0 ? <p>No pending deposits.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th>User ID</th>
                <th>Amount</th>
                <th>Coin</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{d.user_id.substring(0,8)}...</td>
                  <td>{d.amount}</td>
                  <td>{d.coin}</td>
                  <td>
                    <button onClick={() => handleApproveDeposit(d.id)} style={{ padding: '0.5rem', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Pending Withdrawals ({withdrawals.length})</h2>
        {withdrawals.length === 0 ? <p>No pending withdrawals.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th>User ID</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{w.user_id.substring(0,8)}...</td>
                  <td>{w.amount}</td>
                  <td>{w.currency}</td>
                  <td>
                    <button onClick={() => handleApproveWithdrawal(w.id)} style={{ padding: '0.5rem', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Manual Balance Adjustment</h2>
        <form onSubmit={handleAdjustBalance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <input type="text" placeholder="Target User UUID" value={adjUserId} onChange={e => setAdjUserId(e.target.value)} required />
          <input type="text" placeholder="Currency (e.g., USD, BTC)" value={adjCurrency} onChange={e => setAdjCurrency(e.target.value)} required />
          <input type="number" step="0.00000001" placeholder="Amount (can be negative)" value={adjAmount} onChange={e => setAdjAmount(e.target.value)} required />
          <input type="text" placeholder="Reason for Audit Log" value={adjReason} onChange={e => setAdjReason(e.target.value)} required />
          <button type="submit" style={{ padding: '0.75rem', background: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}>Execute Adjustment</button>
        </form>
      </section>
    </div>
  );
}