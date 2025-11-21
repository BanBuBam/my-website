import React, { useState, useEffect } from 'react';
import './CabinetManagementPage.css';
import { FiRefreshCw, FiEye, FiUnlock, FiLock, FiArrowLeft } from 'react-icons/fi';
import { adminCabinetAPI } from '../../../../services/staff/adminAPI';
import { useNavigate } from 'react-router-dom';

const LockedCabinetsPage = () => {
    const navigate = useNavigate();
    const [cabinets, setCabinets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });

    // State cho modal chi tiết
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // State cho lock status checking
    const [lockStatusCache, setLockStatusCache] = useState({});
    const [checkingLockStatus, setCheckingLockStatus] = useState(false);

    // Load danh sách tủ khóa khi component mount
    useEffect(() => {
        loadLockedCabinets(0);
    }, []);

    // Load danh sách tủ đang khóa
    const loadLockedCabinets = async (page) => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminCabinetAPI.getLockedCabinets(page, pagination.pageSize);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const data = response.data;

                if (data.content) {
                    // Paginated response
                    setCabinets(data.content);
                    setPagination({
                        currentPage: data.page || 0,
                        totalPages: data.totalPages || 0,
                        totalElements: data.totalElements || 0,
                        pageSize: data.size || 20
                    });

                    // Initialize lock status cache
                    const statusCache = {};
                    data.content.forEach(cab => {
                        statusCache[cab.cabinetId] = cab.isLocked;
                    });
                    setLockStatusCache(statusCache);
                } else if (Array.isArray(data)) {
                    // Non-paginated response
                    setCabinets(data);
                    
                    // Initialize lock status cache
                    const statusCache = {};
                    data.forEach(cab => {
                        statusCache[cab.cabinetId] = cab.isLocked;
                    });
                    setLockStatusCache(statusCache);
                } else {
                    setCabinets([]);
                }
            } else {
                throw new Error('Không thể tải danh sách tủ khóa');
            }
        } catch (err) {
            console.error('Error loading locked cabinets:', err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra trạng thái khóa của tủ
    const checkCabinetLockStatus = async (cabinetId) => {
        try {
            const response = await adminCabinetAPI.getCabinetLockStatus(cabinetId);
            
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const lockStatus = response.data?.isLocked;
                
                // Update cache
                setLockStatusCache(prev => ({
                    ...prev,
                    [cabinetId]: lockStatus
                }));

                // Update the cabinet in the list
                setCabinets(prevCabinets => 
                    prevCabinets.map(cab => 
                        cab.cabinetId === cabinetId 
                            ? { ...cab, isLocked: lockStatus }
                            : cab
                    )
                );

                return lockStatus;
            }
        } catch (err) {
            console.error('Error checking lock status:', err);
        }
        return null;
    };

    // Lấy trạng thái khóa hiện tại
    const getCurrentLockStatus = (cabinet) => {
        if (lockStatusCache.hasOwnProperty(cabinet.cabinetId)) {
            return lockStatusCache[cabinet.cabinetId];
        }
        return cabinet.isLocked;
    };

    // Xử lý làm mới
    const handleRefresh = () => {
        loadLockedCabinets(pagination.currentPage);
    };

    // Xử lý mở khóa tủ
    const handleUnlock = async (cabinet) => {
        const currentLockStatus = getCurrentLockStatus(cabinet);
        
        if (!currentLockStatus) {
            alert('⚠️ Tủ này đã được mở khóa rồi!');
            loadLockedCabinets(pagination.currentPage);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn mở khóa tủ "${cabinet.cabinetLocation}"?`)) {
            return;
        }

        try {
            const response = await adminCabinetAPI.lockUnlockCabinet(cabinet.cabinetId, false);

            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200 || response.OK)) {
                alert('✅ Đã mở khóa tủ thành công!');
                
                // Update cache immediately
                setLockStatusCache(prev => ({
                    ...prev,
                    [cabinet.cabinetId]: false
                }));

                // Reload to remove from locked list
                loadLockedCabinets(pagination.currentPage);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error unlocking cabinet:', err);
            alert('❌ Lỗi khi mở khóa tủ: ' + getErrorMessage(err));
        }
    };

    // Xem chi tiết tủ
    const handleViewDetail = (cabinet) => {
        setSelectedCabinet(cabinet);
        setShowDetailModal(true);
    };

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('vi-VN');
        } catch {
            return dateString;
        }
    };

    // Get cabinet type label
    const getCabinetTypeLabel = (type) => {
        if (!type) return 'Chưa xác định';
        const labels = {
            'MEDICATION': 'Tủ thuốc',
            'MATERIAL': 'Tủ vật tư',
            'EQUIPMENT': 'Tủ thiết bị'
        };
        return labels[type] || type;
    };

    // Get utilization color
    const getUtilizationColor = (percent) => {
        if (percent < 50) return '#28a745'; // green
        if (percent < 80) return '#ffc107'; // yellow
        return '#dc3545'; // red
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            loadLockedCabinets(newPage);
        }
    };

    // Get error message
    const getErrorMessage = (err) => {
        if (err.response) {
            const status = err.response.status;
            if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
            if (status === 404) return 'Không tìm thấy tủ.';
            if (status === 500) return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        }
        return err.message || 'Không thể tải danh sách tủ khóa. Vui lòng thử lại.';
    };

    return (
        <div className="cabinet-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>🔒 Tủ thuốc đang khóa</h2>
                    <p>Danh sách các tủ thuốc/vật tư đang ở trạng thái khóa</p>
                </div>
                <div className="header-right">
                    <button className="btn-secondary" onClick={() => navigate('/staff/admin/tu-thuoc')}>
                        <FiArrowLeft />
                        Quay lại
                    </button>
                    <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Statistics Card */}
            <div className="stats-cards">
                <div className="stat-card locked">
                    <div className="stat-icon">🔒</div>
                    <div className="stat-info">
                        <div className="stat-label">Tổng số tủ đang khóa</div>
                        <div className="stat-value">{pagination.totalElements || cabinets.length}</div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="loading-state">
                    <p>⏳ Đang tải danh sách tủ khóa...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>❌ {error}</p>
                </div>
            ) : cabinets.length > 0 ? (
                <div className="cabinet-table-container">
                    <table className="cabinet-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Vị trí tủ</th>
                                <th>Loại tủ</th>
                                <th>Khoa phòng</th>
                                <th>Người chịu trách nhiệm</th>
                                <th>Tỷ lệ sử dụng</th>
                                <th>Trạng thái khóa</th>
                                <th>Thời gian cập nhật</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(cabinets) && cabinets.map((cabinet, index) => {
                                const isLocked = getCurrentLockStatus(cabinet);
                                return (
                                    <tr key={cabinet.cabinetId}>
                                        <td>{pagination.currentPage * pagination.pageSize + index + 1}</td>
                                        <td><strong>{cabinet.cabinetLocation}</strong></td>
                                        <td>
                                            <span className={`badge badge-type-${cabinet.cabinetType?.toLowerCase() || 'unknown'}`}>
                                                {getCabinetTypeLabel(cabinet.cabinetType)}
                                            </span>
                                        </td>
                                        <td>{cabinet.departmentName || 'N/A'}</td>
                                        <td>{cabinet.responsibleEmployeeName || 'Chưa gán'}</td>
                                        <td>
                                            <div className="utilization-container">
                                                <div className="utilization-bar">
                                                    <div
                                                        className="utilization-fill"
                                                        style={{
                                                            width: `${cabinet.occupancyRate || 0}%`,
                                                            backgroundColor: getUtilizationColor(cabinet.occupancyRate || 0)
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="utilization-text">{cabinet.occupancyRate || 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className="lock-icon"
                                                style={{
                                                    color: isLocked ? '#dc3545' : '#28a745',
                                                    fontWeight: 'bold',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}
                                            >
                                                {isLocked ? (
                                                    <>
                                                        <FiLock style={{ fontSize: '1rem' }} />
                                                        Đang khóa
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUnlock style={{ fontSize: '1rem' }} />
                                                        Đã mở
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(cabinet.lastModifiedDate)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-view"
                                                    onClick={() => handleViewDetail(cabinet)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FiEye />
                                                </button>
                                                {isLocked && (
                                                    <button
                                                        className="btn-icon btn-lock"
                                                        onClick={() => handleUnlock(cabinet)}
                                                        title="Mở khóa"
                                                        style={{ background: '#28a745' }}
                                                    >
                                                        <FiUnlock />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>✅ Không có tủ nào đang khóa</p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="btn-page"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 0 || loading}
                    >
                        ← Trang trước
                    </button>
                    <span className="page-info">
                        Trang {pagination.currentPage + 1} / {pagination.totalPages}
                        {' '}({pagination.totalElements} tủ)
                    </span>
                    <button
                        className="btn-page"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                    >
                        Trang sau →
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔍 Chi tiết tủ</h3>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <div className="detail-label">ID tủ:</div>
                                <div className="detail-value">{selectedCabinet.cabinetId}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Vị trí:</div>
                                <div className="detail-value"><strong>{selectedCabinet.cabinetLocation}</strong></div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Loại tủ:</div>
                                <div className="detail-value">{getCabinetTypeLabel(selectedCabinet.cabinetType)}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Khoa phòng:</div>
                                <div className="detail-value">{selectedCabinet.departmentName || 'N/A'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Người chịu trách nhiệm:</div>
                                <div className="detail-value">{selectedCabinet.responsibleEmployeeName || 'Chưa gán'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Trạng thái khóa:</div>
                                <div className="detail-value">
                                    <span style={{
                                        color: getCurrentLockStatus(selectedCabinet) ? '#dc3545' : '#28a745',
                                        fontWeight: 'bold',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}>
                                        {getCurrentLockStatus(selectedCabinet) ? (
                                            <>
                                                <FiLock style={{ fontSize: '1rem' }} />
                                                Đang khóa
                                            </>
                                        ) : (
                                            <>
                                                <FiUnlock style={{ fontSize: '1rem' }} />
                                                Đã mở
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Tỷ lệ sử dụng:</div>
                                <div className="detail-value">{selectedCabinet.occupancyRate || 0}%</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Sức chứa tối đa:</div>
                                <div className="detail-value">{selectedCabinet.maxCapacity || 'N/A'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Mô tả:</div>
                                <div className="detail-value">{selectedCabinet.description || 'Không có'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Ghi chú:</div>
                                <div className="detail-value">{selectedCabinet.notes || 'Không có'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Thời gian cập nhật:</div>
                                <div className="detail-value">{formatDateTime(selectedCabinet.lastModifiedDate)}</div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                            {getCurrentLockStatus(selectedCabinet) && (
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleUnlock(selectedCabinet);
                                    }}
                                    style={{ background: '#28a745' }}
                                >
                                    <FiUnlock />
                                    Mở khóa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LockedCabinetsPage;

