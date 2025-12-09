import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorDiagnosticOrderAPI } from '../../../../services/staff/doctorAPI';
import {
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiSearch,
  FiEye,
} from 'react-icons/fi';
import './DiagnosticOrderManagementPage.css';

const DiagnosticOrderManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending'); // pending, encounter, doctor
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search states
  const [encounterId, setEncounterId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingOrders();
    } else if (activeTab === 'doctor') {
      fetchDoctorOrders();
    }
  }, [activeTab]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getPendingDiagnosticOrders();
      if (response && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      setError(err.message || 'Không thể tải danh sách chỉ định');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem('employeeId');
      if (!doctorId) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      const response = await doctorDiagnosticOrderAPI.getDiagnosticOrdersByDoctor(doctorId);
      if (response && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching doctor orders:', err);
      setError(err.message || 'Không thể tải danh sách chỉ định');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByEncounter = async () => {
    if (!encounterId || encounterId.trim() === '') {
      setError('Vui lòng nhập Emergency Encounter ID');
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getDiagnosticOrdersByEncounter(encounterId);
      if (response && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error searching by encounter:', err);
      setError(err.message || 'Không thể tìm kiếm chỉ định');
      setOrders([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewDetail = (orderId) => {
    navigate(`/staff/bac-si/diagnostic-orders/${orderId}`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ORDERED: { label: 'Đã đặt', className: 'status-ordered', icon: <FiClock /> },
      ACCEPTED: { label: 'Đã tiếp nhận', className: 'status-accepted', icon: <FiCheckCircle /> },
      IN_PROGRESS: { label: 'Đang thực hiện', className: 'status-in-progress', icon: <FiActivity /> },
      COMPLETED: { label: 'Hoàn thành', className: 'status-completed', icon: <FiCheckCircle /> },
      REPORTED: { label: 'Đã báo cáo', className: 'status-reported', icon: <FiFileText /> },
      CONFIRMED: { label: 'Đã xác nhận', className: 'status-confirmed', icon: <FiCheckCircle /> },
      CANCELLED: { label: 'Đã hủy', className: 'status-cancelled', icon: <FiAlertCircle /> },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'status-default',
      icon: <FiAlertCircle />,
    };

    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyMap = {
      STAT: { label: 'Khẩn cấp', className: 'urgency-stat' },
      URGENT: { label: 'Gấp', className: 'urgency-urgent' },
      ROUTINE: { label: 'Thường', className: 'urgency-routine' },
    };

    const urgencyInfo = urgencyMap[urgency] || {
      label: urgency,
      className: 'urgency-default',
    };

    return <span className={`urgency-badge ${urgencyInfo.className}`}>{urgencyInfo.label}</span>;
  };

  const renderOrdersTable = () => {
    if (loading || searchLoading) {
      return (
        <div className="loading-container">
          <FiRefreshCw className="spinner" />
          <p>Đang tải danh sách...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="empty-state">
          <FiAlertCircle className="empty-icon" />
          <p>Không có chỉ định xét nghiệm nào</p>
        </div>
      );
    }

    return (
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Encounter ID</th>
              <th>Loại chẩn đoán</th>
              <th>Mức độ khẩn</th>
              <th>Trạng thái</th>
              <th>Thời gian chỉ định</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.emergencyEncounterId}</td>
                <td>{order.diagnosticType}</td>
                <td>{getUrgencyBadge(order.urgencyLevel)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{formatDateTime(order.orderedAt)}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => handleViewDetail(order.id)}
                    title="Xem chi tiết"
                  >
                    <FiEye /> Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="diagnostic-order-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-title">
          <FiActivity className="header-icon" />
          <h1>Quản lý Chỉ định Xét nghiệm</h1>
        </div>
        <button
          className="btn-refresh"
          onClick={() => {
            if (activeTab === 'pending') fetchPendingOrders();
            else if (activeTab === 'doctor') fetchDoctorOrders();
            else if (activeTab === 'encounter' && encounterId) handleSearchByEncounter();
          }}
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock /> Danh sách chờ
        </button>
        <button
          className={`tab-button ${activeTab === 'encounter' ? 'active' : ''}`}
          onClick={() => setActiveTab('encounter')}
        >
          <FiSearch /> Tìm theo lượt cấp cứu
        </button>
        <button
          className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctor')}
        >
          <FiFileText /> Danh sách theo bác sĩ
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'encounter' && (
          <div className="search-section">
            <div className="search-form">
              <input
                type="number"
                placeholder="Nhập Emergency Encounter ID..."
                value={encounterId}
                onChange={(e) => setEncounterId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearchByEncounter();
                }}
              />
              <button
                className="btn-search"
                onClick={handleSearchByEncounter}
                disabled={searchLoading}
              >
                <FiSearch /> {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </div>
        )}

        {renderOrdersTable()}
      </div>
    </div>
  );
};

export default DiagnosticOrderManagementPage;
