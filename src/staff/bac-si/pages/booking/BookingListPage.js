import React, { useState, useEffect } from 'react';
import './BookingListPage.css';
import { FiCalendar, FiUser, FiClock, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { doctorBookingAPI } from '../../../../services/staff/doctorAPI';

const BookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    bookingSource: '',
    fromDate: '',
    toDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        ...filters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await doctorBookingAPI.getBookings(params);
      
      if (response && response.data) {
        setBookings(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(0); // Reset to first page
    fetchBookings();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      bookingSource: '',
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(0);
    setTimeout(() => fetchBookings(), 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ xác nhận', class: 'status-pending' },
      'CONFIRMED': { label: 'Đã xác nhận', class: 'status-confirmed' },
      'COMPLETED': { label: 'Hoàn thành', class: 'status-completed' },
      'CANCELLED': { label: 'Đã hủy', class: 'status-cancelled' },
      'NO_SHOW': { label: 'Không đến', class: 'status-no-show' },
    };
    return statusMap[status] || { label: status, class: 'status-default' };
  };

  // Get booking source badge
  const getSourceBadge = (source) => {
    const sourceMap = {
      'ONLINE': { label: 'Online', class: 'source-online' },
      'OFFLINE': { label: 'Tại quầy', class: 'source-offline' },
      'PHONE': { label: 'Điện thoại', class: 'source-phone' },
    };
    return sourceMap[source] || { label: source, class: 'source-default' };
  };

  return (
    <div className="booking-list-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Danh sách lịch hẹn</h1>
          <p className="subtitle">Quản lý lịch hẹn khám bệnh</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-filter" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Trạng thái</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="NO_SHOW">Không đến</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Nguồn đặt lịch</label>
              <select name="bookingSource" value={filters.bookingSource} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Tại quầy</option>
                <option value="PHONE">Điện thoại</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Từ ngày</label>
              <input 
                type="date" 
                name="fromDate" 
                value={filters.fromDate} 
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Đến ngày</label>
              <input 
                type="date" 
                name="toDate" 
                value={filters.toDate} 
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="filters-actions">
            <button className="btn-secondary" onClick={resetFilters}>Xóa bộ lọc</button>
            <button className="btn-primary" onClick={applyFilters}>Áp dụng</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <FiCalendar className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">Tổng lịch hẹn</span>
            <span className="stat-value">{totalElements}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchBookings}>Thử lại</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <FiCalendar size={48} />
            <p>Không có lịch hẹn nào</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Mã lịch hẹn</th>
                    <th>Bệnh nhân</th>
                    <th>Khoa</th>
                    <th>Thời gian hẹn</th>
                    <th>Nguồn</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const statusInfo = getStatusBadge(booking.status);
                    const sourceInfo = getSourceBadge(booking.bookingSource);
                    
                    return (
                      <tr key={booking.bookingId}>
                        <td className="booking-id">#{booking.bookingId}</td>
                        <td>
                          <div className="patient-info">
                            <div className="patient-name">{booking.patient?.fullName || 'N/A'}</div>
                            <div className="patient-code">{booking.patient?.patientCode || 'N/A'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="department-info">
                            <div className="department-name">{booking.department?.departmentName || 'N/A'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="datetime-info">
                            <FiClock size={14} />
                            <span>{formatDate(booking.scheduledDatetime)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${sourceInfo.class}`}>
                            {sourceInfo.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="created-date">{formatDate(booking.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Hiển thị {bookings.length} / {totalElements} kết quả
              </div>
              <div className="pagination-controls">
                <button 
                  className="btn-page" 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  <FiChevronLeft />
                </button>
                <span className="page-info">
                  Trang {currentPage + 1} / {totalPages || 1}
                </span>
                <button 
                  className="btn-page" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  <FiChevronRight />
                </button>
              </div>
              <div className="page-size-selector">
                <label>Hiển thị:</label>
                <select value={pageSize} onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingListPage;

