import React, { useState, useEffect } from 'react';
import './DoctorScheduleListPage.css';
import { 
    FiCalendar, FiSearch, FiFilter, FiRefreshCw, FiEdit, 
    FiTrash2, FiPlus, FiClock, FiUser, FiMapPin 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { adminDoctorScheduleAPI } from '../../../../services/staff/adminAPI';

const DoctorScheduleListPage = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [doctors, setDoctors] = useState([]);

    // Filter states
    const [filters, setFilters] = useState({
        doctorId: '',
        scheduleDate: '',
    });

    // Fetch doctors on mount
    useEffect(() => {
        fetchDoctors();
    }, []);

    // Apply filters when schedules or filters change
    useEffect(() => {
        applyFilters();
    }, [schedules, filters]);

    const fetchDoctors = async () => {
        try {
            const response = await adminDoctorScheduleAPI.getDoctorsByRole('DOCTOR', 0, 100);
            if (response && response.data && response.data.content) {
                setDoctors(response.data.content);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchSchedules = async () => {
        if (!filters.doctorId) {
            setError('Vui lòng chọn bác sĩ để xem lịch làm việc');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await adminDoctorScheduleAPI.getDoctorSchedulesByDoctor(filters.doctorId);
            
            if (response && Array.isArray(response)) {
                setSchedules(response);
            } else {
                setSchedules([]);
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError(err.message || 'Không thể tải danh sách lịch làm việc');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...schedules];

        // Filter by date
        if (filters.scheduleDate) {
            filtered = filtered.filter(schedule => 
                schedule.scheduleDate === filters.scheduleDate
            );
        }

        setFilteredSchedules(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDoctorChange = (e) => {
        const doctorId = e.target.value;
        setFilters(prev => ({
            ...prev,
            doctorId: doctorId
        }));
        
        // Clear current schedules
        setSchedules([]);
        setFilteredSchedules([]);
        setError(null);
    };

    const handleSearch = () => {
        fetchSchedules();
    };

    const handleRefresh = () => {
        if (filters.doctorId) {
            fetchSchedules();
        }
    };

    const handleClearFilters = () => {
        setFilters({
            doctorId: '',
            scheduleDate: '',
        });
        setSchedules([]);
        setFilteredSchedules([]);
        setError(null);
    };

    const formatTime = (timeObj) => {
        if (!timeObj) return '';
        const hour = String(timeObj.hour).padStart(2, '0');
        const minute = String(timeObj.minute).padStart(2, '0');
        return `${hour}:${minute}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (schedule) => {
        if (!schedule.isActive) {
            return <span className="badge badge-inactive">Không hoạt động</span>;
        }
        if (schedule.isPast) {
            return <span className="badge badge-past">Đã qua</span>;
        }
        if (schedule.isToday) {
            return <span className="badge badge-today">Hôm nay</span>;
        }
        return <span className="badge badge-upcoming">Sắp tới</span>;
    };

    // Calculate stats
    const stats = {
        total: filteredSchedules.length,
        today: filteredSchedules.filter(s => s.isToday).length,
        upcoming: filteredSchedules.filter(s => !s.isPast && !s.isToday && s.isActive).length,
        past: filteredSchedules.filter(s => s.isPast).length,
    };

    return (
        <div className="doctor-schedule-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Danh sách Lịch làm việc Bác sĩ</h2>
                    <p>Quản lý và theo dõi lịch làm việc của các bác sĩ</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={handleRefresh}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-add" onClick={() => navigate('/staff/admin/doctor-schedules/create')}>
                        <FiPlus /> Tạo lịch mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {schedules.length > 0 && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dbeafe' }}>
                            <FiCalendar style={{ color: '#3b82f6' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Tổng lịch</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7' }}>
                            <FiClock style={{ color: '#10b981' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.today}</div>
                            <div className="stat-label">Hôm nay</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fef3c7' }}>
                            <FiCalendar style={{ color: '#f59e0b' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.upcoming}</div>
                            <div className="stat-label">Sắp tới</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#f3e8ff' }}>
                            <FiClock style={{ color: '#a855f7' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.past}</div>
                            <div className="stat-label">Đã qua</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>
                        <FiUser /> Bác sĩ
                    </label>
                    <select
                        name="doctorId"
                        value={filters.doctorId}
                        onChange={handleDoctorChange}
                    >
                        <option value="">-- Chọn bác sĩ --</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.fullName} - {doctor.employeeCode}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>
                        <FiCalendar /> Ngày làm việc
                    </label>
                    <input
                        type="date"
                        name="scheduleDate"
                        value={filters.scheduleDate}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-actions">
                    <button className="btn-search" onClick={handleSearch} disabled={!filters.doctorId}>
                        <FiSearch /> Tìm kiếm
                    </button>
                    <button className="btn-clear" onClick={handleClearFilters}>
                        <FiFilter /> Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách lịch làm việc...</p>
                </div>
            )}

            {/* Schedules Table */}
            {!loading && !error && filteredSchedules.length > 0 && (
                <div className="table-container">
                    <table className="schedules-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Bác sĩ</th>
                                <th>Phòng khám</th>
                                <th>Ngày làm việc</th>
                                <th>Giờ làm việc</th>
                                <th>Thời lượng</th>
                                <th>Ca làm việc</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedules.map((schedule) => (
                                <tr key={schedule.doctorScheduleId}>
                                    <td>{schedule.doctorScheduleId}</td>
                                    <td>
                                        <div className="doctor-info">
                                            <FiUser />
                                            <span>{schedule.doctorName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="clinic-info">
                                            <FiMapPin />
                                            <span>{schedule.clinicName}</span>
                                        </div>
                                    </td>
                                    <td>{formatDate(schedule.scheduleDate)}</td>
                                    <td>
                                        <div className="time-info">
                                            <FiClock />
                                            <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                        </div>
                                    </td>
                                    <td>{schedule.durationHours} giờ</td>
                                    <td>{schedule.shiftInfo}</td>
                                    <td>{getStatusBadge(schedule)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" title="Sửa">
                                                <FiEdit />
                                            </button>
                                            <button className="btn-delete" title="Xóa">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredSchedules.length === 0 && schedules.length === 0 && filters.doctorId && (
                <div className="empty-state">
                    <FiCalendar />
                    <p>Không tìm thấy lịch làm việc nào</p>
                    <button className="btn-add" onClick={() => navigate('/staff/admin/doctor-schedules/create')}>
                        <FiPlus /> Tạo lịch mới
                    </button>
                </div>
            )}

            {/* No Results After Filter */}
            {!loading && !error && filteredSchedules.length === 0 && schedules.length > 0 && (
                <div className="empty-state">
                    <FiFilter />
                    <p>Không tìm thấy lịch làm việc phù hợp với bộ lọc</p>
                </div>
            )}
        </div>
    );
};

export default DoctorScheduleListPage;

