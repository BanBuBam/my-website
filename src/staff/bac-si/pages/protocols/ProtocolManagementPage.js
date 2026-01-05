import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doctorDiagnosticOrderAPI,
  departmentAPI,
  patientListAPI,
} from '../../../../services/staff/doctorAPI';
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiSearch,
} from 'react-icons/fi';
import './ProtocolManagementPage.css';

const ProtocolManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('department');
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab 1: Department
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  // Tab 3: Patient
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    if (activeTab === 'department') {
      fetchDepartments();
    } else if (activeTab === 'active') {
      fetchActiveProtocols();
    } else if (activeTab === 'patient') {
      fetchPatients();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments('', 0, 100);
      if (response && response.data && response.data.content) {
        setDepartments(response.data.content);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientListAPI.getActivePatients(0, 100);
      if (response && response.data && response.data.content) {
        setPatients(response.data.content);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchProtocolsByDepartment = async () => {
    if (!selectedDepartmentId) {
      setError('Vui lòng chọn khoa');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getProtocolsByDepartment(
        selectedDepartmentId
      );
      setProtocols(response?.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải protocols');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProtocols = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getActiveProtocols();
      setProtocols(response?.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải protocols');
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocolsByPatient = async () => {
    if (!selectedPatientId) {
      setError('Vui lòng chọn bệnh nhân');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getProtocolsByPatient(selectedPatientId);
      setProtocols(response?.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải protocols');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getProtocolTypeBadge = (type) => {
    const colors = {
      CODE_BLUE: '#1e40af',
      CODE_RED: '#dc2626',
      CODE_ORANGE: '#ea580c',
      CODE_PINK: '#ec4899',
      STROKE_ALERT: '#7c3aed',
      STEMI_ALERT: '#dc2626',
      TRAUMA_ALERT: '#ea580c',
    };
    return (
      <span className="protocol-badge" style={{ backgroundColor: colors[type] || '#6b7280' }}>
        {type}
      </span>
    );
  };

  const renderProtocolsList = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <FiRefreshCw className="spinner" />
          <p>Đang tải...</p>
        </div>
      );
    }

    if (protocols.length === 0) {
      return (
        <div className="empty-state">
          <FiAlertCircle />
          <p>Không có quy trình nào</p>
        </div>
      );
    }

    return (
      <div className="protocols-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại</th>
              <th>Khoa</th>
              <th>Bệnh nhân</th>
              <th>Vị trí</th>
              <th>Mức độ</th>
              <th>Trạng thái</th>
              <th>Kích hoạt lúc</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {protocols.map((p) => (
              <tr key={p.protocolId}>
                <td>{p.protocolId}</td>
                <td>{getProtocolTypeBadge(p.protocolType)}</td>
                <td>{p.departmentName || '-'}</td>
                <td>{p.patientName || '-'}</td>
                <td>{p.location || '-'}</td>
                <td>
                  <span className={`severity-badge severity-${p.severityLevel?.toLowerCase()}`}>
                    {p.severityDisplay || p.severityLevel}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${p.resolved ? 'resolved' : 'active'}`}>
                    {p.resolved ? <FiCheckCircle /> : <FiAlertTriangle />}
                    {p.statusDisplay || p.status}
                  </span>
                </td>
                <td>{formatDateTime(p.activatedAt)}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/staff/bac-si/protocols/${p.protocolId}`)}
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
    <div className="protocol-management-page">
      <div className="page-header">
        <h1>
          <FiAlertTriangle /> Quản lý Quy trình cấp cứu
        </h1>
      </div>

      {error && (
        <div className="error-message">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'department' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('department');
            setProtocols([]);
            setError(null);
          }}
        >
          Theo khoa
        </button>
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Đang hoạt động
        </button>
        <button
          className={`tab ${activeTab === 'patient' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('patient');
            setProtocols([]);
            setError(null);
          }}
        >
          Theo bệnh nhân
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'department' && (
          <div className="search-section">
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              <option value="">-- Chọn khoa --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
            <button onClick={fetchProtocolsByDepartment} disabled={loading}>
              <FiSearch /> Tìm kiếm
            </button>
          </div>
        )}

        {activeTab === 'patient' && (
          <div className="search-section">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">-- Chọn bệnh nhân --</option>
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.fullName} - {p.patientCode}
                </option>
              ))}
            </select>
            <button onClick={fetchProtocolsByPatient} disabled={loading}>
              <FiSearch /> Tìm kiếm
            </button>
          </div>
        )}

        {renderProtocolsList()}
      </div>
    </div>
  );
};

export default ProtocolManagementPage;
