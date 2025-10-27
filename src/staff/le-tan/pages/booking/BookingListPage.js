import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingListPage.css';
import {
    FiCalendar, FiSearch, FiRefreshCw, FiUser, FiPhone,
    FiMail, FiMapPin, FiClock, FiAlertCircle, FiCheckCircle,
    FiXCircle, FiEye, FiEdit
} from 'react-icons/fi';
import { receptionistBookingAPI } from '../../../../services/staff/receptionistAPI';

const BookingListPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('search'); // 'search', 'pending', or 'confirmed'
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search states
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch bookings based on active tab
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingBookings();
        } else if (activeTab === 'confirmed') {
            fetchConfirmedBookings();
        }
    }, [activeTab]);

    const fetchPendingBookings = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            const response = await receptionistBookingAPI.getPendingBookings(page, pageSize);

            if (response && response.data) {
                setBookings(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('Error fetching pending bookings:', err);
            setError(err.message || 'Không thể tải danh sách booking chờ xác nhận');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfirmedBookings = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            const response = await receptionistBookingAPI.getConfirmedBookings(page, pageSize);

            if (response && response.data) {
                setBookings(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('Error fetching confirmed bookings:', err);
            setError(err.message || 'Không thể tải danh sách booking đã xác nhận');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        if (!searchKeyword.trim()) {
            setError('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await receptionistBookingAPI.searchBookings(searchKeyword, currentPage, pageSize);
            
            if (response && response.data) {
                setBookings(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (err) {
            console.error('Error searching bookings:', err);
            setError(err.message || 'Không thể tìm kiếm booking');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (activeTab === 'pending') {
            fetchPendingBookings(currentPage);
        } else if (activeTab === 'confirmed') {
            fetchConfirmedBookings(currentPage);
        } else if (searchKeyword.trim()) {
            handleSearch();
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setBookings([]);
        setSearchKeyword('');
        setCurrentPage(0);
        setError(null);
    };

    const handlePageChange = (newPage) => {
        if (activeTab === 'pending') {
            fetchPendingBookings(newPage);
        } else if (activeTab === 'confirmed') {
            fetchConfirmedBookings(newPage);
        } else if (searchKeyword.trim()) {
            setCurrentPage(newPage);
            // Re-search with new page
            receptionistBookingAPI.searchBookings(searchKeyword, newPage, pageSize)
                .then(response => {
                    if (response && response.data) {
                        setBookings(response.data.content || []);
                        setTotalPages(response.data.totalPages || 0);
                        setTotalElements(response.data.totalElements || 0);
                    }
                })
                .catch(err => {
                    console.error('Error changing page:', err);
                    setError(err.message || 'Không thể chuyển trang');
                });
        }
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

    const getStatusBadge = (status, statusDescription) => {
        const statusMap = {
            'PENDING': { class: 'badge-pending', icon: <FiClock /> },
            'CONFIRMED': { class: 'badge-confirmed', icon: <FiCheckCircle /> },
            'CANCELLED': { class: 'badge-cancelled', icon: <FiXCircle /> },
            'NO_SHOW': { class: 'badge-no-show', icon: <FiAlertCircle /> },
            'COMPLETED': { class: 'badge-completed', icon: <FiCheckCircle /> },
        };

        const statusInfo = statusMap[status] || { class: 'badge-default', icon: <FiAlertCircle /> };

        return (
            <span className={`badge ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusDescription || status}
            </span>
        );
    };

    const getSourceBadge = (source) => {
        return source === 'ONLINE' 
            ? <span className="badge badge-online">Online</span>
            : <span className="badge badge-offline">Tại quầy</span>;
    };

    // Calculate stats
    const stats = {
        total: totalElements,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    };

    return (
        <div className="booking-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Booking</h2>
                    <p>Tìm kiếm và quản lý lịch hẹn của bệnh nhân</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={handleRefresh}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => handleTabChange('search')}
                >
                    <FiSearch /> Tìm kiếm Booking
                </button>
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => handleTabChange('pending')}
                >
                    <FiClock /> Booking chờ xác nhận
                </button>
                <button
                    className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`}
                    onClick={() => handleTabChange('confirmed')}
                >
                    <FiCheckCircle /> Booking đã xác nhận
                </button>
            </div>

            {/* Search Section - Only show in search tab */}
            {activeTab === 'search' && (
                <div className="search-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-group">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Nhập tên bệnh nhân để tìm kiếm..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-search" disabled={loading}>
                            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                        </button>
                    </form>
                </div>
            )}

            {/* Stats Cards - Only show when have data */}
            {bookings.length > 0 && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dbeafe' }}>
                            <FiCalendar style={{ color: '#3b82f6' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Tổng booking</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fef3c7' }}>
                            <FiClock style={{ color: '#f59e0b' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.pending}</div>
                            <div className="stat-label">Chờ xác nhận</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7' }}>
                            <FiCheckCircle style={{ color: '#10b981' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.confirmed}</div>
                            <div className="stat-label">Đã xác nhận</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fee2e2' }}>
                            <FiXCircle style={{ color: '#ef4444' }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.cancelled}</div>
                            <div className="stat-label">Đã hủy</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle /> {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Bookings Table */}
            {!loading && !error && bookings.length > 0 && (
                <>
                    <div className="table-container">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Bệnh nhân</th>
                                    <th>Bác sĩ</th>
                                    <th>Khoa</th>
                                    <th>Thời gian hẹn</th>
                                    <th>Nguồn</th>
                                    <th>Trạng thái</th>
                                    {/*<th>Lý do hủy</th>*/}
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.bookingId}>
                                        <td>{booking.bookingId}</td>
                                        <td>
                                            <div className="patient-info">
                                                <div className="info-main">
                                                    <FiUser />
                                                    <strong>{booking.patient.fullName}</strong>
                                                </div>
                                                <div className="info-sub">
                                                    <span>{booking.patient.patientCode}</span>
                                                </div>
                                                <div className="info-contact">
                                                    <FiPhone /> {booking.patient.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doctor-info">
                                                <div className="info-main">
                                                    {booking.doctor.fullName}
                                                </div>
                                                <div className="info-sub">
                                                    {booking.doctor.specialization}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="department-info">
                                                <FiMapPin />
                                                <span>{booking.department.departmentName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="datetime-info">
                                                <FiClock />
                                                <span>{formatDateTime(booking.scheduledDatetime)}</span>
                                            </div>
                                        </td>
                                        <td>{getSourceBadge(booking.bookingSource)}</td>
                                        <td>{getStatusBadge(booking.status, booking.statusDescription)}</td>
                                        {/*<td>*/}
                                        {/*    {booking.cancellationReason ? (*/}
                                        {/*        <span className="cancellation-reason">{booking.cancellationReason}</span>*/}
                                        {/*    ) : (*/}
                                        {/*        <span className="text-muted">-</span>*/}
                                        {/*    )}*/}
                                        {/*</td>*/}
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-view"
                                                    title="Xem chi tiết"
                                                    onClick={() => navigate(`/staff/le-tan/booking/${booking.bookingId}`)}
                                                >
                                                    <FiEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="pagination-btn"
                            >
                                Trước
                            </button>
                            <span className="pagination-info">
                                Trang {currentPage + 1} / {totalPages} (Tổng: {totalElements} booking)
                            </span>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="pagination-btn"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && !error && bookings.length === 0 && (
                <div className="empty-state">
                    <FiCalendar />
                    {activeTab === 'search' ? (
                        <p>Nhập tên bệnh nhân để tìm kiếm booking</p>
                    ) : (
                        <p>Không có booking nào đang chờ xác nhận</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingListPage;

