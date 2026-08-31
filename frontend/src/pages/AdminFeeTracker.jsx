import { useEffect, useState } from 'react';
import api from '../services/api';
import AdminStudentFeeDetails from '../components/AdminStudentFeeDetails';
import './AdminFeeTracker.css';

const AdminFeeTracker = () => {
  const [students, setStudents] = useState([]);
  const [allFeesList, setAllFeesList] = useState([]);
  const [feeData, setFeeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, feesRes] = await Promise.all([
        api.get('/students'),
        api.get('/student-fees')
      ]);
      
      const allStudents = studentsRes.data;
      const allFees = feesRes.data;

      // Aggregate fee data per student
      const aggregated = {};
      allStudents.forEach(s => {
        aggregated[s.studentId] = {
          totalPaid: 0,
          totalPending: 0,
          totalOverdue: 0,
          status: 'CLEAR'
        };
      });

      allFees.forEach(fee => {
        if (fee.student && fee.student.studentId) {
          const sid = fee.student.studentId;
          if (!aggregated[sid]) {
             aggregated[sid] = { totalPaid: 0, totalPending: 0, totalOverdue: 0, status: 'CLEAR' };
          }
          
          if (fee.status === 'SUCCESS' || fee.status === 'COMPLETED' || fee.status === 'PAID') {
             aggregated[sid].totalPaid += fee.amount;
          } else if (fee.status === 'PARTIAL') {
             aggregated[sid].totalPaid += (fee.paidAmount || 0);
             aggregated[sid].totalPending += (fee.amount - (fee.paidAmount || 0));
          } else if (fee.status === 'OVERDUE') {
             aggregated[sid].totalOverdue += fee.amount;
          } else if (fee.status === 'PENDING') {
             aggregated[sid].totalPending += fee.amount;
          }
        }
      });

      // Calculate overall status
      Object.keys(aggregated).forEach(sid => {
        const data = aggregated[sid];
        if (data.totalOverdue > 0) {
           data.status = 'ALERT';
        } else if (data.totalPending > 0) {
           data.status = 'DUE';
        } else {
           data.status = 'CLEAR';
        }
      });

      setStudents(allStudents);
      setFeeData(aggregated);
      setAllFeesList(allFees);
    } catch (error) {
      console.error("Failed to fetch tracking data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Calculating Student Fee Records...</p>
      </div>
    );
  }

  return (
    <div className="fee-tracker-container">
      <div className="tracker-header">
        <div>
          <h2>Fee Tracker</h2>
          <p>Monitor collected, pending, and overdue fees for each student.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="tracker-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Total Paid</th>
              <th>Total Pending</th>
              <th>Overdue</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              const data = feeData[student.studentId] || { totalPaid: 0, totalPending: 0, totalOverdue: 0, status: 'CLEAR' };
              const initialLetters = student.user?.name ? student.user.name.substring(0, 2).toUpperCase() : 'ST';
              
              return (
                <tr 
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td>
                    <div className="student-info">
                      <div className="student-avatar">{initialLetters}</div>
                      <div className="student-details">
                        <span className="student-name">{student.user?.name}</span>
                        <span className="student-course">{student.course?.courseName || 'N/A'} • {student.enrollmentNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {data.status === 'CLEAR' && <span className="badge badge-clear">All Clear</span>}
                    {data.status === 'DUE' && <span className="badge badge-due">Pending Dues</span>}
                    {data.status === 'ALERT' && <span className="badge badge-alert">Overdue Action</span>}
                  </td>
                  <td>
                    <span className="amount-paid">{formatCurrency(data.totalPaid)}</span>
                  </td>
                  <td>
                    <span className="amount-pending">{formatCurrency(data.totalPending)}</span>
                  </td>
                  <td>
                    <span className="amount-overdue">{formatCurrency(data.totalOverdue)}</span>
                  </td>
                </tr>
              );
            })}
            
            {students.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                  No student records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <AdminStudentFeeDetails
          student={selectedStudent}
          studentFees={allFeesList.filter(fee => fee.student?.studentId === selectedStudent.studentId)}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default AdminFeeTracker;
