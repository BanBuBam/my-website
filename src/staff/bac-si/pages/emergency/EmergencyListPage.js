import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorEmergencyAPI, doctorEncounterAPI } from '../../../../services/staff/doctorAPI';
import {
    FiAlertCircle, FiRefreshCw, FiClock, FiUser, FiActivity,
    FiPhone, FiMapPin, FiEye, FiAlertTriangle, FiSearch, FiPlus
} from 'react-icons/fi';
import './EmergencyListPage.css';

const EmergencyListPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('emergencies');
    const [emergencies, setEmergencies] = useState([]);
    const [createEmergencies, setCreateEmergencies] = useState([]);
    const [encounters, setEncounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (activeTab === 'emergencies') {
            fetchEmergencies();
            const interval = setInterval(fetchEmergencies, 30000);
            return () => clearInterval(interval);
        } else if (activeTab === 'encounters') {
            fetchEncounters();
        } else if (activeTab === 'create') {
            fetchCreateEmergencies();
            const interval = setInterval(fetchCreateEmergencies, 30000);
            return () => clearInterval(interval);
        }
    }, [activeTab, currentPage]);

    const fetchEmergencies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorEmergencyAPI.getActiveEmergencies();
            if (response && response.data) {
                setEmergencies(response.data);
            }
        } catch (err) {
            console.error('Error fetching emergencies:', err);
            setError(err.message || 'Không thể tải danh sách cấp cứu');
        } finally {
            setLoading(false);
        }
    };

    const fetchCreateEmergencies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorEmergencyAPI.getActiveEmergencies();
            if (response && response.data) {
                setCreateEmergencies(response.data);
            }
        } catch (err) {
            console.error('Error fetching emergencies:', err);
            setError(err.message || 'Không thể tải danh sách cấp cứu');
        } finally {
            setLoading(false);
        }
    };

    const fetchEncounters = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorEncounterAPI.getEncountersByDoctor(localStorage.getItem('employeeId'));
            if (response && response.data) {
                setEncounters(response.data.content || response.data || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || response.data.length || 0);
            }
        } catch (err) {
            console.error('Error fetching encounters:', err);
            setError(err.message || 'Không thể tải danh sách encounter');
        } finally {
            setLoading(false);
        }
    };

    const handleViewEmergencyDetail = (emergencyEncounterId) => {
        navigate(`/staff/bac-si/cap-cuu/emergency/${emergencyEncounterId}`);
    };

    const handleViewEncounterDetail = (encounterId) => {
        navigate(`/staff/bac-si/cap-cuu/encounter/${encounterId}`);
    };

    const handleRefresh = () => {
        if (activeTab === 'emergencies') fetchEmergencies();
        else if (activeTab === 'encounters') fetchEncounters();
        else if (activeTab === 'create') fetchCreateEmergencies();
    };

    const handleCreateNew = () => {
        navigate('/staff/bac-si/cap-cuu/tao-moi');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
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

    const getCategoryBadgeClass = (colorCode) => {
        const colorMap = {
            'RED': 'category-red',
            'ORANGE': 'category-orange',
            'YELLOW': 'category-yellow',
            'GREEN': 'category-green',
            'BLUE': 'category-blue',
        };
        return colorMap[colorCode] || 'category-default';
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PLANNED': 'status-planned',
            'ARRIVED': 'status-arrived',
            'IN_PROGRESS': 'status-in-progress',
            'FINISHED': 'status-finished',
            'CANCELLED': 'status-cancelled',
        };
        return statusMap[status] || 'status-default';
    };

    return (
        <div className="emergency-list-page">
            <div className="page-header">
                <div className="header-left">
                    <FiAlertCircle className="header-icon" />
                    <div>
                        <h1>Quản lý Cấp cứu</h1>
                        <p>Quản lý các lượt cấp cứu và encounter</p>
                    </div>
                </div>
                <div className="header-actions">
                    {activeTab === 'create' && (
                        <button className="btn-create" onClick={handleCreateNew}>
                            <FiPlus />
                            Tạo mới
                        </button>
                    )}
                    <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'emergencies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emergencies')}
                >
                    <FiAlertCircle />
                    Danh sách Cấp cứu
                </button>
                <button
                    className={`tab-button ${activeTab === 'encounters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('encounters')}
                >
                    <FiSearch />
                    Tìm kiếm Encounter
                </button>
                <button
                    className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    <FiPlus />
                    Tạo Cấp cứu Khẩn
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {activeTab === 'emergencies' && (
                <EmergenciesTab
                    emergencies={emergencies}
                    loading={loading}
                    onViewDetail={handleViewEmergencyDetail}
                    formatDateTime={formatDateTime}
                    getCategoryBadgeClass={getCategoryBadgeClass}
                />
            )}

            {activeTab === 'encounters' && (
                <EncountersTab
                    encounters={encounters}
                    loading={loading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onViewDetail={handleViewEncounterDetail}
                    onPageChange={handlePageChange}
                    formatDateTime={formatDateTime}
                    getStatusBadgeClass={getStatusBadgeClass}
                />
            )}

            {activeTab === 'create' && (
                <EmergenciesTab
                    emergencies={createEmergencies}
                    loading={loading}
                    onViewDetail={handleViewEmergencyDetail}
                    formatDateTime={formatDateTime}
                    getCategoryBadgeClass={getCategoryBadgeClass}
                />
            )}
        </div>
    );
};

const EmergenciesTab = ({ emergencies, loading, onViewDetail, formatDateTime, getCategoryBadgeClass }) => {
    if (loading) {
        return (
            <div className="loading-container">
                <FiRefreshCw className="spinner" />
                <p>Đang tải danh sách cấp cứu...</p>
            </div>
        );
    }

    const getStatusBadgeClass = (statusColor) => {
        const colorMap = {
            'red': 'status-red',
            'orange': 'status-orange',
            'yellow': 'status-yellow',
            'green': 'status-green',
            'blue': 'status-blue',
            'gray': 'status-gray',
        };
        return colorMap[statusColor] || 'status-default';
    };

    return (
        <>
            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <FiActivity />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{emergencies.length}</div>
                        <div className="stat-label">Tổng số ca</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon critical">
                        <FiAlertTriangle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {emergencies.filter(e => e.isLifeThreatening).length}
                        </div>
                        <div className="stat-label">Nguy kịch</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon urgent">
                        <FiClock />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {emergencies.filter(e => e.requiresImmediateAttention).length}
                        </div>
                        <div className="stat-label">Cần xử lý ngay</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon exceeded">
                        <FiAlertCircle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {emergencies.filter(e => e.isWaitTimeExceeded).length}
                        </div>
                        <div className="stat-label">Quá thời gian chờ</div>
                    </div>
                </div>
            </div>

            {emergencies.length === 0 ? (
                <div className="empty-state">
                    <FiAlertCircle className="empty-icon" />
                    <h3>Không có ca cấp cứu nào</h3>
                    <p>Hiện tại không có ca cấp cứu đang hoạt động</p>
                </div>
            ) : (
                <div className="emergency-grid">
                    {emergencies.map((emergency) => (
                        <div key={emergency.emergencyEncounterId} className="emergency-card">
                            <div className="card-header">
                                <div className="header-left">
                                    <span className={`category-badge ${getCategoryBadgeClass(emergency.colorCode)}`}>
                                        {emergency.emergencyCategoryIcon && <span className="category-icon">{emergency.emergencyCategoryIcon}</span>}
                                        {emergency.emergencyCategoryDisplay}
                                    </span>
                                    <span className="priority-score">
                                        Độ ưu tiên: {emergency.priorityScore}
                                    </span>
                                </div>
                                <span className={`status-badge ${getStatusBadgeClass(emergency.statusColor)}`}>
                                    {emergency.statusDisplay}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="info-section">
                                    <div className="info-row">
                                        <FiUser className="info-icon" />
                                        <div className="info-content">
                                            <div className="patient-name">{emergency.patientName}</div>
                                            <div className="patient-code">Mã BN: {emergency.patientCode}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="complaint-section">
                                    <div className="complaint-label">Lý do khám:</div>
                                    <div className="complaint-text">{emergency.chiefComplaint || '-'}</div>
                                </div>

                                <div className="time-section">
                                    <div className="time-item">
                                        <FiClock className="time-icon" />
                                        <div>
                                            <div className="time-label">Thời gian đến</div>
                                            <div className="time-value">{formatDateTime(emergency.arrivalTime)}</div>
                                        </div>
                                    </div>
                                    <div className="time-item">
                                        <div className={`wait-time ${emergency.isWaitTimeExceeded ? 'exceeded' : ''}`}>
                                            <FiAlertCircle />
                                            <span>Chờ: {emergency.waitTimeMinutes} phút</span>
                                            {emergency.isWaitTimeExceeded && <span className="exceeded-badge">Quá hạn</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="additional-info">
                                    <div className="info-item">
                                        <FiMapPin className="icon" />
                                        <span>{emergency.arrivalMethod || '-'}</span>
                                    </div>
                                    {emergency.painScore > 0 && (
                                        <div className="info-item">
                                            <span className="pain-score">Đau: {emergency.painScore}/10</span>
                                        </div>
                                    )}
                                    {emergency.emergencyContactPhone && (
                                        <div className="info-item">
                                            <FiPhone className="icon" />
                                            <span>{emergency.emergencyContactPhone}</span>
                                        </div>
                                    )}
                                </div>

                                {(emergency.triageNurseName || emergency.assignedDoctorName) && (
                                    <div className="staff-section">
                                        {emergency.triageNurseName && (
                                            <div className="staff-item">
                                                <span className="staff-label">Y tá phân loại:</span>
                                                <span className="staff-name">{emergency.triageNurseName}</span>
                                            </div>
                                        )}
                                        {emergency.assignedDoctorName && (
                                            <div className="staff-item">
                                                <span className="staff-label">Bác sĩ:</span>
                                                <span className="staff-name">{emergency.assignedDoctorName}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="alerts-section">
                                    {emergency.isLifeThreatening && (
                                        <div className="alert-badge critical">
                                            <FiAlertTriangle /> Nguy kịch
                                        </div>
                                    )}
                                    {emergency.requiresImmediateAttention && (
                                        <div className="alert-badge urgent">
                                            <FiClock /> Cần xử lý ngay
                                        </div>
                                    )}
                                    {emergency.arrivedByAmbulance && (
                                        <div className="alert-badge ambulance">
                                            Xe cứu thương
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-footer">
                                <button
                                    className="btn-view-detail"
                                    onClick={() => onViewDetail(emergency.emergencyEncounterId)}
                                >
                                    <FiEye /> Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

const EncountersTab = ({ 
    encounters, 
    loading, 
    currentPage, 
    totalPages, 
    totalElements,
    onViewDetail, 
    onPageChange,
    formatDateTime,
    getStatusBadgeClass
}) => {
    if (loading) {
        return (
            <div className="loading-container">
                <FiRefreshCw className="spinner" />
                <p>Đang tải danh sách encounter...</p>
            </div>
        );
    }

    return (
        <>
            <div className="encounters-section">
                <div className="section-header">
                    <h2>Danh sách Encounter</h2>
                    <span className="count-badge">{totalElements} encounter</span>
                </div>

                {encounters.length === 0 ? (
                    <div className="empty-state">
                        <FiSearch className="empty-icon" />
                        <h3>Không có encounter nào</h3>
                        <p>Không tìm thấy encounter nào trong hệ thống</p>
                    </div>
                ) : (
                    <>
                        <div className="encounters-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Encounter ID</th>
                                        <th>Bệnh nhân</th>
                                        <th>Loại</th>
                                        <th>Trạng thái</th>
                                        <th>Khoa</th>
                                        <th>Thời gian bắt đầu</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {encounters.map((encounter) => (
                                        <tr key={encounter.encounterId}>
                                            <td>{encounter.encounterId}</td>
                                            <td>
                                                <div className="patient-info">
                                                    <div className="patient-name">{encounter.patientName}</div>
                                                    <div className="patient-code">Mã: {encounter.patientCode}</div>
                                                </div>
                                            </td>
                                            <td>{encounter.encounterType || '-'}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(encounter.status)}`}>
                                                    {encounter.statusDescription || encounter.status}
                                                </span>
                                            </td>
                                            <td>{encounter.departmentName || '-'}</td>
                                            <td>{formatDateTime(encounter.startDatetime)}</td>
                                            <td>
                                                <button
                                                    className="btn-view-small"
                                                    onClick={() => onViewDetail(encounter.encounterId)}
                                                >
                                                    <FiEye /> Xem
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    Trước
                                </button>
                                <span className="pagination-info">
                                    Trang {currentPage + 1} / {totalPages}
                                </span>
                                <button
                                    className="pagination-btn"
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default EmergencyListPage;
