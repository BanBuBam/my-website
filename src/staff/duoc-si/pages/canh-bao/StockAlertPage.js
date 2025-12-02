import React, { useState, useEffect } from 'react';
import './StockAlertPage.css';
import {
    FiAlertTriangle, FiClock, FiRefreshCw, FiAlertCircle,
    FiArrowRight, FiCheckSquare, FiBell, FiActivity, FiEye, FiX,
    FiSearch, FiFilter, FiBarChart2, FiCheck, FiCheckCircle
} from 'react-icons/fi';
import { pharmacistStockAlertAPI } from '../../../../services/staff/pharmacistAPI';
import { useNavigate } from 'react-router-dom';

const StockAlertPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // State dữ liệu Dashboard
    const [dashboardData, setDashboardData] = useState({
        activeCount: 0,
        criticalCount: 0,
        unacknowledgedCount: 0,
        overdueCount: 0,
        quantityRelatedCount: 0,
        expiryRelatedCount: 0
    });

    // State danh sách chi tiết (để hiển thị bảng)
    const [immediateAlerts, setImmediateAlerts] = useState([]);
    const [overdueAlerts, setOverdueAlerts] = useState([]);
    const [quantityAlerts, setQuantityAlerts] = useState([]);
    const [expiryAlerts, setExpiryAlerts] = useState([]);

    // State Tìm kiếm & Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    // State Modal
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statistics, setStatistics] = useState(null);

    // State cho chức năng Acknowledge/Resolve
    const [selectedAlertIds, setSelectedAlertIds] = useState([]);
    const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showBulkAcknowledgeModal, setShowBulkAcknowledgeModal] = useState(false);
    const [showBulkResolveModal, setShowBulkResolveModal] = useState(false);
    const [acknowledgeForm, setAcknowledgeForm] = useState({ notes: '', actionTaken: '' });
    const [resolveForm, setResolveForm] = useState({ resolutionNotes: '' });
    const [bulkNotes, setBulkNotes] = useState('');
    const [processingAction, setProcessingAction] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Hàm load dữ liệu tổng quan
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Lấy số liệu tổng quan (Dashboard API) - Nhanh
            const dashboardRes = await pharmacistStockAlertAPI.getAlertDashboard();
            if (dashboardRes?.data) {
                setDashboardData(dashboardRes.data);
            }

            // 2. Lấy danh sách chi tiết (Các API List) - Để hiển thị bảng
            const [immediateRes, overdueRes, quantityRes, expiryRes] = await Promise.all([
                pharmacistStockAlertAPI.getImmediateActionAlerts(),
                pharmacistStockAlertAPI.getOverdueAlerts(),
                pharmacistStockAlertAPI.getQuantityRelatedAlerts(),
                pharmacistStockAlertAPI.getExpiryRelatedAlerts()
            ]);

            if (immediateRes?.data) setImmediateAlerts(Array.isArray(immediateRes.data) ? immediateRes.data : []);
            if (overdueRes?.data) setOverdueAlerts(Array.isArray(overdueRes.data) ? overdueRes.data : []);
            if (quantityRes?.data) setQuantityAlerts(Array.isArray(quantityRes.data) ? quantityRes.data : []);
            if (expiryRes?.data) setExpiryAlerts(Array.isArray(expiryRes.data) ? expiryRes.data : []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Xử lý xem thống kê
    const handleViewStats = async () => {
        try {
            const res = await pharmacistStockAlertAPI.getAlertStatistics();
            if (res?.data) {
                setStatistics(res.data);
                setShowStatsModal(true);
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    // Xử lý tìm kiếm và lọc
    const handleSearchFilter = async () => {
        if (!searchTerm && !filterType && !filterSeverity) {
            setSearchResults(null);
            return;
        }

        setLoading(true);
        try {
            let results = [];
            if (searchTerm) {
                const res = await pharmacistStockAlertAPI.searchAlerts(searchTerm);
                if (res?.data) results = res.data;
            } else if (filterType) {
                const res = await pharmacistStockAlertAPI.getAlertsByType(filterType);
                if (res?.data) results = res.data;
            } else if (filterSeverity) {
                const res = await pharmacistStockAlertAPI.getAlertsBySeverity(filterSeverity);
                if (res?.data) results = res.data;
            }
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching alerts:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearchFilter();
    }, [filterType, filterSeverity]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearchFilter();
    };

    const handleViewDetail = async (alertId) => {
        try {
            const response = await pharmacistStockAlertAPI.getAlertById(alertId);
            if (response && response.data) {
                setSelectedAlert(response.data);
                setShowModal(true);
            }
        } catch (error) {
            console.error("Error fetching detail:", error);
        }
    };

    // Hiển thị thông báo
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    // ========== ACKNOWLEDGE SINGLE ALERT ==========
    const handleOpenAcknowledgeModal = () => {
        if (!selectedAlert || selectedAlert.isAcknowledged) return;
        setAcknowledgeForm({ notes: '', actionTaken: '' });
        setShowAcknowledgeModal(true);
    };

    const handleAcknowledgeAlert = async () => {
        if (!selectedAlert || !acknowledgeForm.notes) {
            showNotification('error', 'Vui lòng nhập ghi chú!');
            return;
        }
        setProcessingAction(true);
        try {
            const response = await pharmacistStockAlertAPI.acknowledgeAlert(
                selectedAlert.alertId,
                acknowledgeForm.notes,
                acknowledgeForm.actionTaken
            );
            if (response?.status === 'success' || response?.status === 'OK') {
                showNotification('success', 'Ghi nhận cảnh báo thành công!');
                setShowAcknowledgeModal(false);
                setShowModal(false);
                await fetchDashboardData();
            } else {
                showNotification('error', response?.message || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error("Error acknowledging alert:", error);
            showNotification('error', 'Có lỗi xảy ra khi ghi nhận cảnh báo!');
        } finally {
            setProcessingAction(false);
        }
    };

    // ========== RESOLVE SINGLE ALERT ==========
    const handleOpenResolveModal = () => {
        if (!selectedAlert || selectedAlert.isResolved) return;
        setResolveForm({ resolutionNotes: '' });
        setShowResolveModal(true);
    };

    const handleResolveAlert = async () => {
        if (!selectedAlert || !resolveForm.resolutionNotes) {
            showNotification('error', 'Vui lòng nhập ghi chú xử lý!');
            return;
        }
        setProcessingAction(true);
        try {
            const response = await pharmacistStockAlertAPI.resolveAlert(
                selectedAlert.alertId,
                resolveForm.resolutionNotes
            );
            if (response?.status === 'success' || response?.status === 'OK') {
                showNotification('success', 'Đánh dấu đã xử lý thành công!');
                setShowResolveModal(false);
                setShowModal(false);
                await fetchDashboardData();
            } else {
                showNotification('error', response?.message || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error("Error resolving alert:", error);
            showNotification('error', 'Có lỗi xảy ra khi xử lý cảnh báo!');
        } finally {
            setProcessingAction(false);
        }
    };

    // ========== CHECKBOX SELECTION ==========
    const handleSelectAlert = (alertId) => {
        setSelectedAlertIds(prev => {
            if (prev.includes(alertId)) {
                return prev.filter(id => id !== alertId);
            } else {
                return [...prev, alertId];
            }
        });
    };

    const handleSelectAllInTable = (alerts) => {
        const alertIds = alerts.map(a => a.alertId);
        const allSelected = alertIds.every(id => selectedAlertIds.includes(id));
        if (allSelected) {
            setSelectedAlertIds(prev => prev.filter(id => !alertIds.includes(id)));
        } else {
            setSelectedAlertIds(prev => [...new Set([...prev, ...alertIds])]);
        }
    };

    const isAlertSelected = (alertId) => selectedAlertIds.includes(alertId);

    // ========== ACKNOWLEDGE MULTIPLE ALERTS ==========
    const handleOpenBulkAcknowledgeModal = () => {
        if (selectedAlertIds.length === 0) {
            showNotification('error', 'Vui lòng chọn ít nhất một cảnh báo!');
            return;
        }
        setBulkNotes('');
        setShowBulkAcknowledgeModal(true);
    };

    const handleBulkAcknowledge = async () => {
        if (!bulkNotes) {
            showNotification('error', 'Vui lòng nhập ghi chú!');
            return;
        }
        setProcessingAction(true);
        try {
            const response = await pharmacistStockAlertAPI.acknowledgeMultipleAlerts(
                selectedAlertIds,
                bulkNotes
            );
            if (response?.status === 'success' || response?.status === 'OK') {
                showNotification('success', `Đã ghi nhận ${selectedAlertIds.length} cảnh báo thành công!`);
                setShowBulkAcknowledgeModal(false);
                setSelectedAlertIds([]);
                await fetchDashboardData();
            } else {
                showNotification('error', response?.message || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error("Error bulk acknowledging:", error);
            showNotification('error', 'Có lỗi xảy ra khi ghi nhận cảnh báo!');
        } finally {
            setProcessingAction(false);
        }
    };

    // ========== RESOLVE MULTIPLE ALERTS ==========
    const handleOpenBulkResolveModal = () => {
        if (selectedAlertIds.length === 0) {
            showNotification('error', 'Vui lòng chọn ít nhất một cảnh báo!');
            return;
        }
        setBulkNotes('');
        setShowBulkResolveModal(true);
    };

    const handleBulkResolve = async () => {
        if (!bulkNotes) {
            showNotification('error', 'Vui lòng nhập ghi chú xử lý!');
            return;
        }
        setProcessingAction(true);
        try {
            const response = await pharmacistStockAlertAPI.resolveMultipleAlerts(
                selectedAlertIds,
                bulkNotes
            );
            if (response?.status === 'success' || response?.status === 'OK') {
                showNotification('success', `Đã xử lý ${selectedAlertIds.length} cảnh báo thành công!`);
                setShowBulkResolveModal(false);
                setSelectedAlertIds([]);
                await fetchDashboardData();
            } else {
                showNotification('error', response?.message || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error("Error bulk resolving:", error);
            showNotification('error', 'Có lỗi xảy ra khi xử lý cảnh báo!');
        } finally {
            setProcessingAction(false);
        }
    };

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleDateString('vi-VN'); } catch { return dateString; }
    };
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleString('vi-VN'); } catch { return dateString; }
    };

    return (
        <div className="stock-alert-page">
            {/* NOTIFICATION */}
            {notification.show && (
                <div className={`notification notification-${notification.type}`} style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: notification.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                    zIndex: 10000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500'
                }}>
                    {notification.type === 'success' ? '✅' : '❌'} {notification.message}
                </div>
            )}

            <div className="page-header">
                <div className="header-left">
                    <h2>⚠️ Trung tâm Cảnh báo (Alert Center)</h2>
                    <p>Giám sát và xử lý các sự cố tồn kho</p>
                </div>
                <div className="header-right">
                    {/* Bulk Action Buttons */}
                    {selectedAlertIds.length > 0 && (
                        <>
                            <span style={{
                                padding: '0.5rem 0.75rem',
                                background: '#007bff',
                                color: '#fff',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                Đã chọn: {selectedAlertIds.length}
                            </span>
                            <button
                                className="btn-primary"
                                onClick={handleOpenBulkAcknowledgeModal}
                                style={{ background: '#17a2b8', border: 'none' }}
                            >
                                <FiCheck /> Ghi nhận đã chọn
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleOpenBulkResolveModal}
                                style={{ background: '#28a745', border: 'none' }}
                            >
                                <FiCheckCircle /> Xử lý đã chọn
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedAlertIds([])}
                                style={{ background: '#6c757d', color: '#fff', border: 'none' }}
                            >
                                <FiX /> Bỏ chọn
                            </button>
                        </>
                    )}
                    <button className="btn-secondary" onClick={handleViewStats}>
                        <FiBarChart2 /> Xem thống kê
                    </button>
                    <button className="btn-refresh" onClick={fetchDashboardData} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} /> Làm mới
                    </button>
                </div>
            </div>

            {/* BANNER KHẨN CẤP */}
            {immediateAlerts.length > 0 && !searchResults && (
                <div className="urgent-banner">
                    <div className="urgent-icon"><FiBell className="bell-ring" /></div>
                    <div className="urgent-content">
                        <h3>Cần hành động ngay ({immediateAlerts.length})</h3>
                        <p>Có {immediateAlerts.length} cảnh báo nghiêm trọng cần xử lý.</p>
                    </div>
                    <button className="btn-urgent-action" onClick={() => document.getElementById('overdue-section')?.scrollIntoView()}>
                        Xem danh sách
                    </button>
                </div>
            )}

            {/* SUMMARY CARDS (Dùng dữ liệu từ Dashboard API) */}
            <div className="alert-summary">
                <div className="alert-card card-total">
                    <div className="card-icon"><FiActivity /></div>
                    <div className="card-info"><h3>{dashboardData.activeCount}</h3><p>Tổng Active</p></div>
                </div>
                <div className="alert-card card-critical">
                    <div className="card-icon"><FiAlertCircle /></div>
                    <div className="card-info"><h3>{dashboardData.criticalCount}</h3><p>Nghiêm trọng</p></div>
                </div>
                <div className="alert-card card-unack">
                    <div className="card-icon"><FiCheckSquare /></div>
                    <div className="card-info"><h3>{dashboardData.unacknowledgedCount}</h3><p>Chưa xử lý</p></div>
                </div>
                <div className="alert-card card-overdue">
                    <div className="card-icon"><FiClock /></div>
                    <div className="card-info"><h3>{dashboardData.overdueCount}</h3><p>Quá hạn</p></div>
                </div>
            </div>

            {/* BỘ LỌC TÌM KIẾM */}
            <div className="alert-filters">
                <form className="search-group" onSubmit={handleSearchSubmit}>
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm (tên thuốc, nội dung...)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                
                <div className="filter-group">
                    <div className="select-wrapper">
                        <FiFilter className="filter-icon" />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">Tất cả loại</option>
                            <option value="LOW_STOCK">Tồn kho thấp</option>
                            <option value="EXPIRING_SOON">Sắp hết hạn</option>
                            <option value="EXPIRED">Đã hết hạn</option>
                            <option value="OVERSTOCK">Tồn kho quá nhiều</option>
                        </select>
                    </div>
                    <div className="select-wrapper">
                        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                            <option value="">Tất cả mức độ</option>
                            <option value="CRITICAL">Nghiêm trọng</option>
                            <option value="HIGH">Cao</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="LOW">Thấp</option>
                        </select>
                    </div>
                    {(searchTerm || filterType || filterSeverity) && (
                        <button className="btn-clear" onClick={() => { setSearchTerm(''); setFilterType(''); setFilterSeverity(''); setSearchResults(null); }}>
                            Xóa lọc
                        </button>
                    )}
                </div>
            </div>

            {/* KẾT QUẢ TÌM KIẾM HOẶC DASHBOARD MẶC ĐỊNH */}
            {searchResults ? (
                <div className="alert-section">
                    <div className="section-header"><h3>Kết quả tìm kiếm ({searchResults.length})</h3></div>
                    <div className="table-responsive">
                        <table className="alert-table">
                            <thead><tr><th>Mức độ</th><th>Loại</th><th>Stock ID</th><th>Thông báo</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead>
                            <tbody>
                                {searchResults.map((alert, index) => (
                                    <tr key={alert.alertId || index}>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: alert.severityColor || '#e9ecef',
                                                color: '#fff'
                                            }}>
                                                {alert.severityIcon} {alert.severityLevel || 'N/A'}
                                            </span>
                                        </td>
                                        <td><span className="type-badge">{alert.alertTypeIcon} {alert.alertType}</span></td>
                                        <td><code style={{ background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>{alert.stockId}</code></td>
                                        <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{alert.alertMessage || alert.summary}</td>
                                        <td><span style={{ fontSize: '0.85rem' }}>{alert.statusDisplay}</span></td>
                                        <td><button className="btn-icon-action" onClick={() => handleViewDetail(alert.alertId)}><FiEye /></button></td>
                                    </tr>
                                ))}
                                {searchResults.length === 0 && <tr><td colSpan="6" className="text-center">Không tìm thấy kết quả</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    {/* Overdue Alerts */}
                    {overdueAlerts.length > 0 && (
                        <div id="overdue-section" className="alert-section overdue-section">
                            <div className="section-header"><h3 className="text-dark-red"><FiClock /> Quá hạn xử lý ({overdueAlerts.length})</h3></div>
                            <div className="table-responsive">
                                <table className="alert-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={overdueAlerts.length > 0 && overdueAlerts.every(a => selectedAlertIds.includes(a.alertId))}
                                                    onChange={() => handleSelectAllInTable(overdueAlerts)}
                                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                />
                                            </th>
                                            <th>Mức độ</th><th>Loại</th><th>Stock ID</th><th>Thông báo</th><th>Thời gian</th><th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overdueAlerts.map((alert, index) => (
                                            <tr key={alert.alertId || index} className="row-overdue" style={{ background: isAlertSelected(alert.alertId) ? '#e3f2fd' : '' }}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={isAlertSelected(alert.alertId)}
                                                        onChange={() => handleSelectAlert(alert.alertId)}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: alert.severityColor || '#dc3545',
                                                        color: '#fff'
                                                    }}>
                                                        {alert.severityIcon} {alert.severityLevel}
                                                    </span>
                                                </td>
                                                <td><span className="type-badge">{alert.alertTypeDisplay || alert.alertType}</span></td>
                                                <td><code style={{ background: '#f8d7da', color: '#721c24', padding: '2px 6px', borderRadius: '4px' }}>{alert.stockId}</code></td>
                                                <td style={{ fontSize: '0.85rem' }}>{alert.alertMessage}</td>
                                                <td className="text-danger fw-bold">{alert.ageHours || 0}h quá hạn</td>
                                                <td><button className="btn-icon-action" onClick={() => handleViewDetail(alert.alertId)}><FiEye /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="alerts-container">
                        {/* Quantity Alerts */}
                        <div className="alert-section">
                            <div className="section-header">
                                <h3 className="text-orange"><FiAlertTriangle /> Cảnh báo Số lượng ({dashboardData.quantityRelatedCount})</h3>
                                <button className="btn-link" onClick={() => navigate('/staff/duoc-si/nhap-kho')}>Nhập kho <FiArrowRight /></button>
                            </div>
                            <div className="table-responsive">
                                <table className="alert-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={quantityAlerts.length > 0 && quantityAlerts.every(a => selectedAlertIds.includes(a.alertId))}
                                                    onChange={() => handleSelectAllInTable(quantityAlerts)}
                                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                />
                                            </th>
                                            <th>Mức độ</th><th>Stock ID</th><th>Số lượng</th><th>Định mức</th><th>Trạng thái</th><th>Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quantityAlerts.length > 0 ? quantityAlerts.map((item, index) => (
                                            <tr key={item.alertId || index} style={{ background: isAlertSelected(item.alertId) ? '#e3f2fd' : '' }}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={isAlertSelected(item.alertId)}
                                                        onChange={() => handleSelectAlert(item.alertId)}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: item.severityColor || '#ffc107',
                                                        color: '#fff'
                                                    }}>
                                                        {item.severityIcon} {item.severityLevel}
                                                    </span>
                                                </td>
                                                <td><code style={{ background: '#fff3cd', color: '#856404', padding: '2px 6px', borderRadius: '4px' }}>{item.stockId}</code></td>
                                                <td className="text-danger fw-bold" style={{ fontSize: '1.1rem' }}>{item.currentQuantity}</td>
                                                <td style={{ color: '#6c757d' }}>{item.thresholdQuantity || 'N/A'}</td>
                                                <td><span style={{ fontSize: '0.85rem' }}>{item.statusDisplay}</span></td>
                                                <td><button className="btn-icon-action" onClick={() => handleViewDetail(item.alertId)}><FiEye /></button></td>
                                            </tr>
                                        )) : <tr><td colSpan="7" className="text-center text-muted">✅ Ổn định</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Expiry Alerts */}
                        <div className="alert-section">
                            <div className="section-header">
                                <h3 className="text-red"><FiAlertCircle /> Cảnh báo Hạn dùng ({dashboardData.expiryRelatedCount})</h3>
                                <button className="btn-link" onClick={() => navigate('/staff/duoc-si/xuat-kho')}>Hủy/Trả <FiArrowRight /></button>
                            </div>
                            <div className="table-responsive">
                                <table className="alert-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={expiryAlerts.length > 0 && expiryAlerts.every(a => selectedAlertIds.includes(a.alertId))}
                                                    onChange={() => handleSelectAllInTable(expiryAlerts)}
                                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                />
                                            </th>
                                            <th>Mức độ</th><th>Stock ID</th><th>Hạn dùng</th><th>Còn lại</th><th>Trạng thái</th><th>Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expiryAlerts.length > 0 ? expiryAlerts.map((alert, index) => (
                                            <tr key={alert.alertId || index} style={{ background: isAlertSelected(alert.alertId) ? '#e3f2fd' : '' }}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={isAlertSelected(alert.alertId)}
                                                        onChange={() => handleSelectAlert(alert.alertId)}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: alert.severityColor || '#dc3545',
                                                        color: '#fff'
                                                    }}>
                                                        {alert.severityIcon} {alert.severityLevel}
                                                    </span>
                                                </td>
                                                <td><code style={{ background: '#f8d7da', color: '#721c24', padding: '2px 6px', borderRadius: '4px' }}>{alert.stockId}</code></td>
                                                <td style={{ fontWeight: '600', color: alert.daysToExpiry <= 7 ? '#dc3545' : '#ffc107' }}>
                                                    {formatDate(alert.expiryDate)}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '700',
                                                        background: alert.daysToExpiry <= 7 ? '#dc3545' : alert.daysToExpiry <= 30 ? '#ffc107' : '#28a745',
                                                        color: '#fff'
                                                    }}>
                                                        {alert.daysToExpiry} ngày
                                                    </span>
                                                </td>
                                                <td><span style={{ fontSize: '0.85rem' }}>{alert.statusDisplay}</span></td>
                                                <td><button className="btn-icon-action" onClick={() => handleViewDetail(alert.alertId)}><FiEye /></button></td>
                                            </tr>
                                        )) : <tr><td colSpan="7" className="text-center text-muted">✅ Không có cảnh báo</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL CHI TIẾT */}
            {showModal && selectedAlert && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Cảnh báo #{selectedAlert.alertId}</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            {/* Loại & Mức độ */}
                            <div className="detail-row">
                                <span className="detail-label">Loại:</span>
                                <strong>{selectedAlert.alertTypeDisplay || selectedAlert.alertType}</strong>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Mức độ:</span>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: selectedAlert.severityColor || '#e9ecef',
                                    color: '#fff'
                                }}>
                                    {selectedAlert.severityDisplay || selectedAlert.severityLevel}
                                </span>
                            </div>

                            {/* Thông tin Stock */}
                            <div className="detail-row">
                                <span className="detail-label">Stock ID:</span>
                                <code style={{ background: '#e9ecef', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                    {selectedAlert.stockId}
                                </code>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Loại sản phẩm:</span>
                                <span>{selectedAlert.itemType === 'MEDICINE' ? '💊 Thuốc' : '🩹 Vật tư'}</span>
                            </div>
                            {selectedAlert.cabinetId && (
                                <div className="detail-row">
                                    <span className="detail-label">Tủ:</span>
                                    <span>{selectedAlert.cabinetName || `Cabinet ID: ${selectedAlert.cabinetId}`} {selectedAlert.cabinetLocation ? `(${selectedAlert.cabinetLocation})` : ''}</span>
                                </div>
                            )}

                            {/* Thông tin số lượng (cho cảnh báo số lượng) */}
                            {selectedAlert.isQuantityRelated && (
                                <div className="detail-grid">
                                    <div className="detail-box"><span>Số lượng hiện tại</span><strong style={{ color: '#dc3545', fontSize: '1.3rem' }}>{selectedAlert.currentQuantity}</strong></div>
                                    <div className="detail-box"><span>Định mức</span><strong>{selectedAlert.thresholdQuantity || 'N/A'}</strong></div>
                                </div>
                            )}

                            {/* Thông tin hạn dùng (cho cảnh báo hạn dùng) */}
                            {selectedAlert.isExpiryRelated && (
                                <div className="detail-grid">
                                    <div className="detail-box">
                                        <span>Hạn sử dụng</span>
                                        <strong style={{ color: selectedAlert.daysToExpiry <= 7 ? '#dc3545' : '#ffc107' }}>
                                            {formatDate(selectedAlert.expiryDate)}
                                        </strong>
                                    </div>
                                    <div className="detail-box">
                                        <span>Còn lại</span>
                                        <strong style={{
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '12px',
                                            background: selectedAlert.daysToExpiry <= 7 ? '#dc3545' : selectedAlert.daysToExpiry <= 30 ? '#ffc107' : '#28a745',
                                            color: '#fff'
                                        }}>
                                            {selectedAlert.daysToExpiry} ngày
                                        </strong>
                                    </div>
                                </div>
                            )}

                            {/* Thông báo chi tiết */}
                            <div className="detail-row">
                                <span className="detail-label">Thông báo:</span>
                                <p className="detail-message" style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: '6px', margin: '0.5rem 0' }}>
                                    {selectedAlert.alertMessage}
                                </p>
                            </div>

                            {/* Trạng thái */}
                            <div className="detail-row">
                                <span className="detail-label">Trạng thái:</span>
                                <span style={{ fontSize: '1rem' }}>{selectedAlert.statusDisplay}</span>
                            </div>

                            {/* Flags */}
                            <div className="detail-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {selectedAlert.isCritical && <span style={{ background: '#dc3545', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>🔴 Nghiêm trọng</span>}
                                {selectedAlert.requiresImmediateAction && <span style={{ background: '#ff6b6b', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>⚡ Cần xử lý ngay</span>}
                                {selectedAlert.isOverdue && <span style={{ background: '#6c757d', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>⏰ Quá hạn ({selectedAlert.ageHours}h)</span>}
                                {selectedAlert.isAcknowledged && <span style={{ background: '#17a2b8', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>✅ Đã ghi nhận</span>}
                                {selectedAlert.isResolved && <span style={{ background: '#28a745', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>✓ Đã xử lý</span>}
                            </div>

                            {/* Thông tin thời gian */}
                            <div className="detail-row"><span className="detail-label">Ngày tạo:</span><span>{formatDateTime(selectedAlert.createdAt)}</span></div>
                            {selectedAlert.acknowledgedAt && (
                                <div className="detail-row">
                                    <span className="detail-label">Ghi nhận bởi:</span>
                                    <span>{selectedAlert.acknowledgedByEmployeeName} - {formatDateTime(selectedAlert.acknowledgedAt)}</span>
                                </div>
                            )}
                            {selectedAlert.resolvedAt && (
                                <div className="detail-row">
                                    <span className="detail-label">Xử lý bởi:</span>
                                    <span>{selectedAlert.resolvedByEmployeeName} - {formatDateTime(selectedAlert.resolvedAt)}</span>
                                </div>
                            )}

                            {/* Summary */}
                            {selectedAlert.summary && (
                                <div className="detail-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
                                    <span className="detail-label">Tóm tắt:</span>
                                    <p style={{ fontStyle: 'italic', color: '#6c757d', margin: '0.5rem 0' }}>{selectedAlert.summary}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {/* Nút Ghi nhận - chỉ hiện khi chưa ghi nhận */}
                            {!selectedAlert.isAcknowledged && (
                                <button
                                    className="btn-primary"
                                    onClick={handleOpenAcknowledgeModal}
                                    style={{ background: '#17a2b8', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                    <FiCheck /> Ghi nhận
                                </button>
                            )}
                            {/* Nút Xử lý - chỉ hiện khi chưa xử lý */}
                            {!selectedAlert.isResolved && (
                                <button
                                    className="btn-primary"
                                    onClick={handleOpenResolveModal}
                                    style={{ background: '#28a745', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                    <FiCheckCircle /> Đánh dấu đã xử lý
                                </button>
                            )}
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GHI NHẬN CẢNH BÁO ĐƠN */}
            {showAcknowledgeModal && (
                <div className="modal-overlay" onClick={() => setShowAcknowledgeModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ background: '#17a2b8', color: '#fff' }}>
                            <h3><FiCheck /> Ghi nhận cảnh báo #{selectedAlert?.alertId}</h3>
                            <button className="btn-close" onClick={() => setShowAcknowledgeModal(false)} style={{ color: '#fff' }}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ghi chú <span style={{ color: '#dc3545' }}>*</span></label>
                                <textarea
                                    value={acknowledgeForm.notes}
                                    onChange={(e) => setAcknowledgeForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Nhập ghi chú về cảnh báo..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Hành động đã thực hiện</label>
                                <textarea
                                    value={acknowledgeForm.actionTaken}
                                    onChange={(e) => setAcknowledgeForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                                    placeholder="Ví dụ: Đã tạo đơn đặt hàng #PO-2025-123..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', minHeight: '60px', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowAcknowledgeModal(false)} disabled={processingAction}>Hủy</button>
                            <button
                                className="btn-primary"
                                onClick={handleAcknowledgeAlert}
                                disabled={processingAction || !acknowledgeForm.notes}
                                style={{ background: '#17a2b8', border: 'none' }}
                            >
                                {processingAction ? '⏳ Đang xử lý...' : '✅ Xác nhận ghi nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XỬ LÝ CẢNH BÁO ĐƠN */}
            {showResolveModal && (
                <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ background: '#28a745', color: '#fff' }}>
                            <h3><FiCheckCircle /> Xử lý cảnh báo #{selectedAlert?.alertId}</h3>
                            <button className="btn-close" onClick={() => setShowResolveModal(false)} style={{ color: '#fff' }}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ghi chú xử lý <span style={{ color: '#dc3545' }}>*</span></label>
                                <textarea
                                    value={resolveForm.resolutionNotes}
                                    onChange={(e) => setResolveForm(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                                    placeholder="Ví dụ: Đã nhập hàng bổ sung, tồn kho hiện tại: 200 viên..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowResolveModal(false)} disabled={processingAction}>Hủy</button>
                            <button
                                className="btn-primary"
                                onClick={handleResolveAlert}
                                disabled={processingAction || !resolveForm.resolutionNotes}
                                style={{ background: '#28a745', border: 'none' }}
                            >
                                {processingAction ? '⏳ Đang xử lý...' : '✅ Xác nhận đã xử lý'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GHI NHẬN NHIỀU CẢNH BÁO */}
            {showBulkAcknowledgeModal && (
                <div className="modal-overlay" onClick={() => setShowBulkAcknowledgeModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ background: '#17a2b8', color: '#fff' }}>
                            <h3><FiCheck /> Ghi nhận {selectedAlertIds.length} cảnh báo</h3>
                            <button className="btn-close" onClick={() => setShowBulkAcknowledgeModal(false)} style={{ color: '#fff' }}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                                <strong>Các cảnh báo được chọn:</strong>
                                <p style={{ margin: '0.5rem 0 0', color: '#1565c0' }}>
                                    {selectedAlertIds.map(id => `#${id}`).join(', ')}
                                </p>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ghi chú chung <span style={{ color: '#dc3545' }}>*</span></label>
                                <textarea
                                    value={bulkNotes}
                                    onChange={(e) => setBulkNotes(e.target.value)}
                                    placeholder="Nhập ghi chú áp dụng cho tất cả cảnh báo đã chọn..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowBulkAcknowledgeModal(false)} disabled={processingAction}>Hủy</button>
                            <button
                                className="btn-primary"
                                onClick={handleBulkAcknowledge}
                                disabled={processingAction || !bulkNotes}
                                style={{ background: '#17a2b8', border: 'none' }}
                            >
                                {processingAction ? '⏳ Đang xử lý...' : `✅ Ghi nhận ${selectedAlertIds.length} cảnh báo`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XỬ LÝ NHIỀU CẢNH BÁO */}
            {showBulkResolveModal && (
                <div className="modal-overlay" onClick={() => setShowBulkResolveModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ background: '#28a745', color: '#fff' }}>
                            <h3><FiCheckCircle /> Xử lý {selectedAlertIds.length} cảnh báo</h3>
                            <button className="btn-close" onClick={() => setShowBulkResolveModal(false)} style={{ color: '#fff' }}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                                <strong>Các cảnh báo được chọn:</strong>
                                <p style={{ margin: '0.5rem 0 0', color: '#155724' }}>
                                    {selectedAlertIds.map(id => `#${id}`).join(', ')}
                                </p>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ghi chú xử lý <span style={{ color: '#dc3545' }}>*</span></label>
                                <textarea
                                    value={bulkNotes}
                                    onChange={(e) => setBulkNotes(e.target.value)}
                                    placeholder="Nhập ghi chú xử lý áp dụng cho tất cả cảnh báo đã chọn..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowBulkResolveModal(false)} disabled={processingAction}>Hủy</button>
                            <button
                                className="btn-primary"
                                onClick={handleBulkResolve}
                                disabled={processingAction || !bulkNotes}
                                style={{ background: '#28a745', border: 'none' }}
                            >
                                {processingAction ? '⏳ Đang xử lý...' : `✅ Xử lý ${selectedAlertIds.length} cảnh báo`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THỐNG KÊ (NEW) */}
            {showStatsModal && statistics && (
                <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
                    <div className="modal-content modal-stats" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thống kê Cảnh báo</h3>
                            <button className="btn-close" onClick={() => setShowStatsModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="stats-grid">
                                <div className="stats-box">
                                    <label>Thời gian xử lý trung bình</label>
                                    <strong>{statistics.averageResolutionTimeHours} giờ</strong>
                                </div>
                                <div className="stats-box">
                                    <label>Thời gian ghi nhận trung bình</label>
                                    <strong>{statistics.averageAcknowledgmentTimeHours} giờ</strong>
                                </div>
                            </div>
                            
                            <h4>Theo Mức độ</h4>
                            <div className="stats-list">
                                {Object.entries(statistics.bySeverity).map(([key, val]) => (
                                    <div className="stats-item" key={key}><span>{key}</span><span>{val}</span></div>
                                ))}
                            </div>

                            <h4>Theo Loại</h4>
                            <div className="stats-list">
                                {Object.entries(statistics.byType).map(([key, val]) => (
                                    <div className="stats-item" key={key}><span>{key}</span><span>{val}</span></div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowStatsModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockAlertPage;