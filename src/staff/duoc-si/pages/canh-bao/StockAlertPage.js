import React, { useState, useEffect } from 'react';
import './StockAlertPage.css';
import { 
    FiAlertTriangle, FiClock, FiRefreshCw, FiAlertCircle, 
    FiArrowRight, FiCheckSquare, FiBell, FiActivity, FiEye, FiX, 
    FiSearch, FiFilter, FiBarChart2 
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
            <div className="page-header">
                <div className="header-left">
                    <h2>⚠️ Trung tâm Cảnh báo (Alert Center)</h2>
                    <p>Giám sát và xử lý các sự cố tồn kho</p>
                </div>
                <div className="header-right">
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
                            <thead><tr><th>Mức độ</th><th>Loại</th><th>Sản phẩm</th><th>Thông báo</th><th>Ngày tạo</th><th>Chi tiết</th></tr></thead>
                            <tbody>
                                {searchResults.map((alert, index) => (
                                    <tr key={index}>
                                        <td><span className={`severity-badge ${alert.severity?.toLowerCase()}`}>{alert.severity}</span></td>
                                        <td><span className="type-badge">{alert.alertType}</span></td>
                                        <td><strong>{alert.itemName}</strong></td>
                                        <td>{alert.message}</td>
                                        <td>{formatDate(alert.createdAt)}</td>
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
                            <div className="section-header"><h3 className="text-dark-red"><FiClock /> Quá hạn xử lý</h3></div>
                            <div className="table-responsive">
                                <table className="alert-table">
                                    <thead><tr><th>Mức độ</th><th>Nội dung</th><th>Ngày tạo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                                    <tbody>
                                        {overdueAlerts.map((alert, index) => (
                                            <tr key={index} className="row-overdue">
                                                <td><span className={`severity-badge ${alert.severity?.toLowerCase()}`}>{alert.severity}</span></td>
                                                <td><strong>{alert.itemName}</strong><br/><small>{alert.message}</small></td>
                                                <td>{formatDate(alert.createdAt)}</td>
                                                <td className="text-danger fw-bold">QUÁ HẠN</td>
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
                                    <thead><tr><th>Sản phẩm</th><th>Vị trí</th><th>Tồn</th><th>Định mức</th><th>Chi tiết</th></tr></thead>
                                    <tbody>
                                        {quantityAlerts.length > 0 ? quantityAlerts.map((item, index) => (
                                            <tr key={index}>
                                                <td><strong>{item.itemName}</strong></td>
                                                <td>{item.cabinetLocation}</td>
                                                <td className="text-danger fw-bold">{item.currentQuantity}</td>
                                                <td>{item.reorderLevel}</td>
                                                <td><button className="btn-icon-action" onClick={() => handleViewDetail(item.alertId)}><FiEye /></button></td>
                                            </tr>
                                        )) : <tr><td colSpan="5" className="text-center text-muted">✅ Ổn định</td></tr>}
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
                                    <thead><tr><th>Sản phẩm</th><th>Vị trí</th><th>Thông báo</th><th>Ngày tạo</th><th>Chi tiết</th></tr></thead>
                                    <tbody>
                                        {expiryAlerts.length > 0 ? expiryAlerts.map((alert, index) => (
                                            <tr key={index}>
                                                <td><strong>{alert.itemName}</strong></td>
                                                <td>{alert.cabinetLocation}</td>
                                                <td>{alert.message}</td>
                                                <td>{formatDate(alert.createdAt)}</td>
                                                <td><button className="btn-icon-action" onClick={() => handleViewDetail(alert.alertId)}><FiEye /></button></td>
                                            </tr>
                                        )) : <tr><td colSpan="5" className="text-center text-muted">✅ Không có cảnh báo</td></tr>}
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
                            <h3>Chi tiết Cảnh báo</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row"><span className="detail-label">Loại:</span><strong>{selectedAlert.alertType}</strong></div>
                            <div className="detail-row"><span className="detail-label">Mức độ:</span><span className={`severity-badge ${selectedAlert.severity?.toLowerCase()}`}>{selectedAlert.severity}</span></div>
                            <div className="detail-row"><span className="detail-label">Sản phẩm:</span><span>{selectedAlert.itemName} ({selectedAlert.itemType})</span></div>
                            <div className="detail-row"><span className="detail-label">Vị trí:</span><span>{selectedAlert.cabinetLocation}</span></div>
                            <div className="detail-grid">
                                <div className="detail-box"><span>Hiện tại</span><strong>{selectedAlert.currentQuantity}</strong></div>
                                <div className="detail-box"><span>Định mức</span><strong>{selectedAlert.reorderLevel}</strong></div>
                            </div>
                            <div className="detail-row"><span className="detail-label">Thông báo:</span><p className="detail-message">{selectedAlert.message}</p></div>
                            <div className="detail-row"><span className="detail-label">Ngày tạo:</span><span>{formatDateTime(selectedAlert.createdAt)}</span></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
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