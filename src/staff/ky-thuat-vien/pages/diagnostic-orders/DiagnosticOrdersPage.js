import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { labTechnicianDiagnosticAPI } from '../../../../services/staff/labTechnicianAPI';
import {
    FiActivity, FiSearch, FiRefreshCw, FiAlertCircle,
    FiClock, FiCheckCircle, FiList
} from 'react-icons/fi';
import './DiagnosticOrdersPage.css';

const DiagnosticOrdersPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // pending, search, list
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tab 1: Chờ xác nhận
    const [pendingOrders, setPendingOrders] = useState([]);

    // Tab 2: Tìm theo encounter
    const [encounterId, setEncounterId] = useState('');
    const [encounterOrders, setEncounterOrders] = useState([]);

    // Tab 3: Danh sách
    const [allOrders, setAllOrders] = useState([]);

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingOrders();
        } else if (activeTab === 'list') {
            fetchAllOrders();
        }
    }, [activeTab]);

    // Fetch pending orders
    const fetchPendingOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await labTechnicianDiagnosticAPI.getPendingDiagnosticOrders();
            if (response && response.data) {
                setPendingOrders(response.data);
            }
        } catch (err) {
            console.error('Error fetching pending orders:', err);
            setError(err.message || 'Không thể tải danh sách chỉ định chờ xác nhận');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all orders
    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await labTechnicianDiagnosticAPI.getAllDiagnosticOrders();
            if (response && response.data) {
                setAllOrders(response.data);
            }
        } catch (err) {
            console.error('Error fetching all orders:', err);
            setError(err.message || 'Không thể tải danh sách chỉ định');
        } finally {
            setLoading(false);
        }
    };

    // Search by encounter
    const handleSearchByEncounter = async (e) => {
        e.preventDefault();
        if (!encounterId.trim()) {
            setError('Vui lòng nhập Encounter ID');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await labTechnicianDiagnosticAPI.getDiagnosticOrdersByEncounter(parseInt(encounterId));
            if (response && response.data) {
                setEncounterOrders(response.data);
            }
        } catch (err) {
            console.error('Error searching orders:', err);
            setError(err.message || 'Không tìm thấy chỉ định cho encounter này');
            setEncounterOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // View detail
    const handleViewDetail = (orderId) => {
        navigate(`/staff/ky-thuat-vien/diagnostic-orders/${orderId}`);
    };

    // Format date
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

    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { label: 'Chờ xử lý', className: 'status-pending', icon: <FiClock /> },
            'IN_PROGRESS': { label: 'Đang thực hiện', className: 'status-in-progress', icon: <FiActivity /> },
            'COMPLETED': { label: 'Hoàn thành', className: 'status-completed', icon: <FiCheckCircle /> },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled', icon: <FiAlertCircle /> },
        };

        const statusInfo = statusMap[status] || { label: status, className: 'status-default', icon: <FiAlertCircle /> };

        return (
            <span className={`status-badge ${statusInfo.className}`}>
                {statusInfo.icon}
                {statusInfo.label}
            </span>
        );
    };

    // Get urgency badge
    const getUrgencyBadge = (urgency) => {
        const urgencyMap = {
            'STAT': { label: 'Khẩn cấp', className: 'urgency-stat' },
            'URGENT': { label: 'Gấp', className: 'urgency-urgent' },
            'ROUTINE': { label: 'Thường', className: 'urgency-routine' },
        };

        const urgencyInfo = urgencyMap[urgency] || { label: urgency, className: 'urgency-default' };

        return (
            <span className={`urgency-badge ${urgencyInfo.className}`}>
                {urgencyInfo.label}
            </span>
        );
    };

    // Render orders table
    const renderOrdersTable = (orders) => {
        if (loading) {
            return (
                <div className="loading-state">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải...</p>
                </div>
            );
        }

        if (orders.length === 0) {
            return (
                <div className="empty-state">
                    <FiList />
                    <p>Không có chỉ định nào</p>
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
                            <th>Thời gian hoàn thành dự kiến</th>
                            <th>Hành động</th>
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
                                <td>{formatDateTime(order.targetCompletionTime)}</td>
                                <td>
                                    <button
                                        className="btn-view"
                                        onClick={() => handleViewDetail(order.id)}
                                    >
                                        Xem chi tiết
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
        <div className="diagnostic-orders-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-title">
                    <FiActivity className="header-icon" />
                    <div>
                        <h1>Quản lý Diagnostic Orders</h1>
                        <p>Quản lý các chỉ định chẩn đoán cấp cứu</p>
                    </div>
                </div>
                <button className="btn-refresh" onClick={() => {
                    if (activeTab === 'pending') fetchPendingOrders();
                    else if (activeTab === 'list') fetchAllOrders();
                }}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <FiClock /> Chờ xác nhận
                </button>
                <button
                    className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    <FiSearch /> Tìm theo Encounter
                </button>
                <button
                    className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FiList /> Danh sách
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Tab Content */}
            <div className="tab-content">
                {/* Tab 1: Chờ xác nhận */}
                {activeTab === 'pending' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Danh sách chỉ định chờ xác nhận</h3>
                            <span className="count-badge">{pendingOrders.length} chỉ định</span>
                        </div>
                        {renderOrdersTable(pendingOrders)}
                    </div>
                )}

                {/* Tab 2: Tìm theo Encounter */}
                {activeTab === 'search' && (
                    <div className="tab-panel">
                        <div className="search-section">
                            <form onSubmit={handleSearchByEncounter} className="search-form">
                                <div className="search-input-group">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="number"
                                        placeholder="Nhập Emergency Encounter ID..."
                                        value={encounterId}
                                        onChange={(e) => setEncounterId(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn-search" disabled={loading}>
                                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                                </button>
                            </form>
                        </div>
                        {encounterOrders.length > 0 && (
                            <>
                                <div className="panel-header">
                                    <h3>Kết quả tìm kiếm</h3>
                                    <span className="count-badge">{encounterOrders.length} chỉ định</span>
                                </div>
                                {renderOrdersTable(encounterOrders)}
                            </>
                        )}
                    </div>
                )}

                {/* Tab 3: Danh sách */}
                {activeTab === 'list' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Tất cả chỉ định chẩn đoán</h3>
                            <span className="count-badge">{allOrders.length} chỉ định</span>
                        </div>
                        {renderOrdersTable(allOrders)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosticOrdersPage;
