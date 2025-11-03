import React, { useState, useEffect } from 'react';
import { hrTimeOffAPI } from '../../../services/staff/hrAPI';
import './LeaveBalanceWidget.css';

const LeaveBalanceWidget = ({ employeeId, year = new Date().getFullYear() }) => {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const leaveTypes = [
    { key: 'ANNUAL_LEAVE', label: 'Nghỉ phép năm', color: '#1976d2' },
    { key: 'SICK_LEAVE', label: 'Nghỉ ốm', color: '#f44336' },
    { key: 'PERSONAL_LEAVE', label: 'Nghỉ cá nhân', color: '#ff9800' },
    { key: 'MATERNITY_LEAVE', label: 'Nghỉ thai sản', color: '#e91e63' },
    { key: 'UNPAID_LEAVE', label: 'Nghỉ không lương', color: '#9e9e9e' },
    { key: 'EMERGENCY_LEAVE', label: 'Nghỉ khẩn cấp', color: '#4caf50' },
  ];

  useEffect(() => {
    if (employeeId) {
      fetchBalances();
    }
  }, [employeeId, year]);

  const fetchBalances = async () => {
    setLoading(true);
    setError('');
    try {
      const balanceData = {};
      
      for (const type of leaveTypes) {
        try {
          const response = await hrTimeOffAPI.getLeaveBalanceByType(
            employeeId,
            year,
            type.key
          );
          
          if (response.success) {
            balanceData[type.key] = response.data;
          } else {
            balanceData[type.key] = {
              totalDays: 0,
              usedDays: 0,
              remainingDays: 0,
            };
          }
        } catch (err) {
          balanceData[type.key] = {
            totalDays: 0,
            usedDays: 0,
            remainingDays: 0,
          };
        }
      }
      
      setBalances(balanceData);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu số ngày nghỉ');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageUsed = (used, total) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  if (loading) {
    return (
      <div className="widget">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="header">
        <h3>Số Ngày Nghỉ Năm {year}</h3>
        <button className="refreshBtn" onClick={fetchBalances} title="Làm mới">
          ↻
        </button>
      </div>

      <div className="balanceList">
        {leaveTypes.map(type => {
          const balance = balances[type.key] || {
            totalDays: 0,
            usedDays: 0,
            remainingDays: 0,
          };
          const percentage = getPercentageUsed(balance.usedDays, balance.totalDays);

          return (
            <div key={type.key} className="balanceItem">
              <div className="itemHeader">
                <span className="label">{type.label}</span>
                <span className="days">
                  {balance.remainingDays.toFixed(1)}/{balance.totalDays.toFixed(1)}
                </span>
              </div>

              <div className="progressBar">
                <div
                  className="progressFill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: type.color,
                  }}
                />
              </div>

              <div className="itemFooter">
                <span className="used">Đã dùng: {balance.usedDays.toFixed(1)}</span>
                <span className="percentage">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary">
        <div className="summaryItem">
          <span className="summaryLabel">Tổng cộng:</span>
          <span className="summaryValue">
            {Object.values(balances)
              .reduce((sum, b) => sum + (b.totalDays || 0), 0)
              .toFixed(1)}{' '}
            ngày
          </span>
        </div>
        <div className="summaryItem">
          <span className="summaryLabel">Đã dùng:</span>
          <span className="summaryValue">
            {Object.values(balances)
              .reduce((sum, b) => sum + (b.usedDays || 0), 0)
              .toFixed(1)}{' '}
            ngày
          </span>
        </div>
        <div className="summaryItem">
          <span className="summaryLabel">Còn lại:</span>
          <span className="summaryValue">
            {Object.values(balances)
              .reduce((sum, b) => sum + (b.remainingDays || 0), 0)
              .toFixed(1)}{' '}
            ngày
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceWidget;

