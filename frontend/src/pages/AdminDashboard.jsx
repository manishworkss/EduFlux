import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCollections: 0,
    totalPending: 0,
    pendingStudentsCount: 0,
    totalOverdue: 0,
    overdueStudentsCount: 0,
    feeStatusDistribution: [],
    recentPayments: [],
    monthlyCollectionTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/dashboard/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const hasData = metrics.totalStudents > 0 || metrics.totalCollections > 0;

  if (loading) {
    return <div className="admin-dashboard-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      
      {/* KPI CARDS SECTION */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3>TOTAL STUDENTS</h3>
            <span className="kpi-icon students-icon">👨‍🎓</span>
          </div>
          <div className="kpi-value">{metrics.totalStudents}</div>
          <div className="kpi-subtext">{metrics.activeStudents} active students</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <h3>TOTAL COLLECTION</h3>
            <span className="kpi-icon collection-icon">💰</span>
          </div>
          <div className="kpi-value">{formatCurrency(metrics.totalCollections)}</div>
          <div className="kpi-subtext positive">+12% vs last month</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3>PENDING FEES</h3>
            <span className="kpi-icon pending-icon">⏳</span>
          </div>
          <div className="kpi-value">{formatCurrency(metrics.totalPending)}</div>
          <div className="kpi-subtext warning">{metrics.pendingStudentsCount} students pending</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3>OVERDUE</h3>
            <span className="kpi-icon overdue-icon">⚠️</span>
          </div>
          <div className="kpi-value">{formatCurrency(metrics.totalOverdue)}</div>
          <div className="kpi-subtext danger">{metrics.overdueStudentsCount} students overdue</div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="dashboard-main-grid">
        
        {/* CHARTS COLUMN */}
        <div className="charts-column">
          
          <div className="chart-card collection-chart">
            <div className="chart-header">
              <h2>Fee Collection Overview</h2>
              <select className="period-selector">
                <option>Last 6 Months</option>
                <option>Current Academic Year</option>
              </select>
            </div>
            {hasData ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={metrics.monthlyCollectionTrend.slice().reverse()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>No payment data yet</p>
                <span>Collection analytics will appear once payments are recorded.</span>
              </div>
            )}
          </div>

          <div className="secondary-charts-row">
            <div className="chart-card status-chart">
              <h2>Fee Status</h2>
              {hasData ? (
                <div className="donut-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={metrics.feeStatusDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {metrics.feeStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🍩</div>
                  <p>No fee data</p>
                </div>
              )}
            </div>

            <div className="action-card attention-card">
              <h2>Attention Required</h2>
              {metrics.overdueStudentsCount > 0 ? (
                <>
                  <div className="attention-metric">
                    <span className="attention-value">{metrics.overdueStudentsCount}</span>
                    <span className="attention-label">Overdue Students</span>
                  </div>
                  <div className="attention-metric">
                    <span className="attention-value text-danger">{formatCurrency(metrics.totalOverdue)}</span>
                    <span className="attention-label">Total Overdue Amount</span>
                  </div>
                  <div className="attention-actions">
                    <button className="btn-danger" onClick={() => navigate('/admin/fees')}>View Overdue Fees</button>
                    <button className="btn-outline" onClick={() => navigate('/admin/fees')}>View Pending</button>
                  </div>
                </>
              ) : (
                <div className="empty-state success-state">
                  <div className="empty-icon">🎉</div>
                  <p>No overdue fees!</p>
                  <span>All students are up to date.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="sidebar-column">
          
          <div className="action-card quick-actions">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <button onClick={() => navigate('/admin/students')}>+ Add Student</button>
              <button onClick={() => navigate('/admin/fee-setup')}>+ Create Fee Structure</button>
              <button onClick={() => navigate('/admin/fee-tracker')}>Assign Fee</button>
              <button onClick={() => navigate('/admin/fee-tracker')}>View Payments</button>
            </div>
          </div>

          <div className="action-card ai-card">
            <div className="ai-header">
              <h2>🤖 EduFlux AI Assistant</h2>
            </div>
            <p>Ask me to manage students, fees, payments or reports.</p>
            <div className="ai-suggestions">
              <span onClick={() => navigate('/admin/ai-assistant')}>Create student accounts</span>
              <span onClick={() => navigate('/admin/ai-assistant')}>Show overdue fees</span>
              <span onClick={() => navigate('/admin/ai-assistant')}>Show today's payments</span>
            </div>
            <button className="ai-action-btn" onClick={() => navigate('/admin/ai-assistant')}>Ask EduFlux AI</button>
          </div>

          <div className="chart-card recent-payments">
            <div className="card-header-flex">
              <h2>Recent Payments</h2>
              <button className="view-all-btn" onClick={() => navigate('/admin/fee-tracker')}>View All →</button>
            </div>
            
            {metrics.recentPayments && metrics.recentPayments.length > 0 ? (
              <div className="recent-payments-list">
                {metrics.recentPayments.map(payment => (
                  <div className="payment-row" key={payment.id}>
                    <div className="payment-info">
                      <div className="payment-student">{payment.studentName}</div>
                      <div className="payment-type">{payment.feeType} • {payment.date}</div>
                    </div>
                    <div className="payment-amount">
                      <div className="amount-val">{formatCurrency(payment.amount)}</div>
                      <div className={`status-badge ${payment.status.toLowerCase()}`}>{payment.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🧾</div>
                <p>No payments yet</p>
                <span>Completed payments will appear here.</span>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
