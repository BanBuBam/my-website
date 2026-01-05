import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EncounterManagementPage.css';
import {
    FiRefreshCw, FiUser, FiClock, FiActivity, FiCalendar,
    FiAlertCircle, FiCheckCircle, FiMapPin, FiFileText, FiSearch, FiFilter,
    FiEye, FiX, FiHeart, FiEdit, FiCamera, FiPlusCircle
} from 'react-icons/fi';
import { doctorEncounterAPI } from '../../../../services/staff/doctorAPI';

const EncounterManagementPage = () => {
    const navigate = useNavigate();
    const [encounters, setEncounters] = useState([]);
    const [allEncounters, setAllEncounters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [searchName, setSearchName] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Load encounters on component mount
    useEffect(() => {
        fetchEncounters();
    }, []);

    // Apply filters when filter states change
    useEffect(() => {
        applyFilters();
    }, [searchName, filterDate, filterType, filterStatus, allEncounters]);

    const fetchEncounters = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get doctorId from localStorage
            const userInfo = JSON.parse(localStorage.getItem('staffUserInfo') || '{}');
            const doctorId = userInfo.employeeId;

            if (!doctorId) {
                throw new Error('Không tìm thấy thông tin bác sĩ');
            }

            const response = await doctorEncounterAPI.getEncountersByDoctor(doctorId);

            if (response && response.data) {
                setAllEncounters(response.data);
                setEncounters(response.data);
            }
        } catch (err) {
            console.error('Error fetching encounters:', err);
            setError(err.message || 'Không thể tải danh sách encounters');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allEncounters];

        // Filter by name
        if (searchName.trim()) {
            filtered = filtered.filter(encounter =>
                encounter.patientName?.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        // Filter by date
        if (filterDate) {
            filtered = filtered.filter(encounter => {
                if (!encounter.startDatetime) return false;

                try {
                    const encounterDate = new Date(encounter.startDatetime);
                    // Check if date is valid
                    if (isNaN(encounterDate.getTime())) return false;

                    const encounterDateStr = encounterDate.toISOString().split('T')[0];
                    return encounterDateStr === filterDate;
                } catch (error) {
                    console.error('Error parsing date:', error);
                    return false;
                }
            });
        }

        // Filter by type
        if (filterType !== 'ALL') {
            filtered = filtered.filter(encounter => encounter.encounterType === filterType);
        }

        // Filter by status
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(encounter => encounter.status === filterStatus);
        }

        setEncounters(filtered);
    };

    const handleResetFilters = () => {
        setSearchName('');
        setFilterDate('');
        setFilterType('ALL');
        setFilterStatus('ALL');
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ARRIVED': { class: 'badge-arrived', icon: <FiCheckCircle />, text: 'Đã đến' },
            'PLANNED': { class: 'badge-planned', icon: <FiCalendar />, text: 'Đã lên lịch' },
            'CHECKED_IN': { class: 'badge-checked-in', icon: <FiCheckCircle />, text: 'Đã check-in' },
            'IN_PROGRESS': { class: 'badge-in-progress', icon: <FiActivity />, text: 'Đang khám' },
            'FINISHED': { class: 'badge-finished', icon: <FiCheckCircle />, text: 'Đã hoàn thành' },
            'COMPLETED': { class: 'badge-completed', icon: <FiCheckCircle />, text: 'Hoàn thành' },
            'CANCELLED': { class: 'badge-cancelled', icon: <FiAlertCircle />, text: 'Đã hủy' },
            'DISCHARGED': { class: 'badge-discharged', icon: <FiCheckCircle />, text: 'Đã xuất viện' },
        };

        const statusInfo = statusMap[status] || { class: 'badge-default', icon: <FiAlertCircle />, text: status };

        return (
            <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusInfo.text}
            </span>
        );
    };

    const getEncounterTypeDisplay = (type) => {
        const typeMap = {
            'OUTPATIENT': 'Ngoại trú',
            'INPATIENT': 'Nội trú',
            'EMERGENCY': 'Cấp cứu',
        };
        return typeMap[type] || type;
    };

    const handleViewDetail = (encounter) => {
        navigate(`/staff/bac-si/encounter-detail/${encounter.encounterId}`);
    };

    return (
        <div className="encounter-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Lượt khám </h2>
                    <p>Danh sách lượt khám được phân công cho bác sĩ</p>
                </div>
                <button className="btn-refresh" onClick={fetchEncounters} disabled={loading}>
                    <FiRefreshCw className={loading ? 'spinning' : ''} />
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* Filter Section */}
            {!loading && allEncounters.length > 0 && (
                <div className="filter-section">
                    <div className="filter-header">
                        <FiFilter />
                        <h3>Bộ lọc</h3>
                    </div>
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Tìm theo tên bệnh nhân</label>
                            <div className="search-input">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Nhập tên bệnh nhân..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>Lọc theo ngày</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Phân loại</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="OUTPATIENT">Ngoại trú</option>
                                <option value="INPATIENT">Nội trú</option>
                                <option value="EMERGENCY">Cấp cứu</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Trạng thái</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="ARRIVED">Đã đến</option>
                                <option value="PLANNED">Đã lên lịch</option>
                                <option value="CHECKED_IN">Đã check-in</option>
                                <option value="IN_PROGRESS">Đang khám</option>
                                <option value="FINISHED">Đã hoàn thành</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                                <option value="DISCHARGED">Đã xuất viện</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>&nbsp;</label>
                            <button className="btn-reset-filter" onClick={handleResetFilters}>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                    <div className="filter-summary">
                        <span>Hiển thị {encounters.length} / {allEncounters.length} encounters</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && encounters.length === 0 && (
                <div className="loading-state">
                    <FiRefreshCw className="spinning" />
                    <p>Đang tải danh sách encounters...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && encounters.length === 0 && allEncounters.length === 0 && !error && (
                <div className="empty-state">
                    <FiFileText />
                    <p>Không có encounter nào</p>
                </div>
            )}

            {/* No Results After Filter */}
            {!loading && encounters.length === 0 && allEncounters.length > 0 && (
                <div className="empty-state">
                    <FiFileText />
                    <p>Không tìm thấy encounter nào phù hợp với bộ lọc</p>
                    <button className="btn-reset-filter" onClick={handleResetFilters}>
                        Đặt lại bộ lọc
                    </button>
                </div>
            )}

            {encounters.length > 0 && (
                <div className="encounters-grid">
                    {encounters.map((encounter) => (
                        <div key={encounter.encounterId} className="encounter-card">
                            <div className="encounter-header">
                                <div className="encounter-id">
                                    <span className="label">Encounter ID:</span>
                                    <span className="value">#{encounter.encounterId}</span>
                                </div>
                                {getStatusBadge(encounter.status)}
                            </div>

                            <div className="encounter-body">
                                <div className="patient-info">
                                    <div className="info-row">
                                        <FiUser className="icon" />
                                        <div className="info-content">
                                            <span className="patient-name">{encounter.patientName}</span>
                                            <span className="patient-code">{encounter.patientCode}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="encounter-details">
                                    <div className="detail-item">
                                        <FiActivity className="icon" />
                                        <div>
                                            <span className="detail-label">Loại:</span>
                                            <span className="detail-value">{getEncounterTypeDisplay(encounter.encounterType)}</span>
                                        </div>
                                    </div>

                                    {encounter.visitType && (
                                        <div className="detail-item">
                                            <FiFileText className="icon" />
                                            <div>
                                                <span className="detail-label">Visit Type:</span>
                                                <span className="detail-value">{encounter.visitType}</span>
                                            </div>
                                        </div>
                                    )}

                                    {encounter.location && (
                                        <div className="detail-item">
                                            <FiMapPin className="icon" />
                                            <div>
                                                <span className="detail-label">Địa điểm:</span>
                                                <span className="detail-value">{encounter.location}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="detail-item">
                                        <FiClock className="icon" />
                                        <div>
                                            <span className="detail-label">Bắt đầu:</span>
                                            <span className="detail-value">{formatDateTime(encounter.startDatetime)}</span>
                                        </div>
                                    </div>

                                    {encounter.endDatetime && (
                                        <div className="detail-item">
                                            <FiCheckCircle className="icon" />
                                            <div>
                                                <span className="detail-label">Kết thúc:</span>
                                                <span className="detail-value">{formatDateTime(encounter.endDatetime)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {encounter.chiefComplaint && (
                                        <div className="detail-item full-width">
                                            <FiAlertCircle className="icon" />
                                            <div>
                                                <span className="detail-label">Lý do khám:</span>
                                                <span className="detail-value">{encounter.chiefComplaint}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="encounter-footer">
                                <div className="footer-info">
                                    <span className="created-by">
                                        Tạo bởi: {encounter.createdByEmployeeName || 'N/A'}
                                    </span>
                                    {encounter.bookingId && (
                                        <span className="booking-id">
                                            Booking ID: #{encounter.bookingId}
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="btn-view-detail"
                                    onClick={() => handleViewDetail(encounter)}
                                >
                                    <FiEye />
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {encounters.length > 0 && (
                <div className="summary-section">
                    <div className="summary-card">
                        <span className="summary-label">Tổng số encounters:</span>
                        <span className="summary-value">{encounters.length}</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Đang khám:</span>
                        <span className="summary-value">
                            {encounters.filter(e => e.status === 'IN_PROGRESS').length}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Hoàn thành:</span>
                        <span className="summary-value">
                            {encounters.filter(e => e.status === 'COMPLETED').length}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Đã check-in:</span>
                        <span className="summary-value">
                            {encounters.filter(e => e.status === 'CHECKED_IN').length}
                        </span>
                    </div>
                </div>
            )}


        </div>
    );
};

export default EncounterManagementPage;

