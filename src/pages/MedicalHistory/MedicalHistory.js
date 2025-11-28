import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import './MedicalHistory.css';

const MedicalHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Cancel booking state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const fetchBookings = async (page) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await bookingAPI.getPatientBookings(page, pageSize);
      
      // Handle response structure: ResponseObject<Page<PatientBookingResponse>>
      if (response && response.data) {
        const pageData = response.data;
        setBookings(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
        setCurrentPage(pageData.number || 0);
      } else {
        setBookings([]);
        setTotalPages(0);
        setTotalElements(0);
      }
      
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lịch sử khám:', error);
      setError(error.message || 'Không thể tải danh sách lịch sử khám chữa bệnh');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (booking) => {
    try {
      setLoadingDetail(true);
      setShowModal(true);

      const bookingId = booking.bookingId || booking.id;
      const response = await bookingAPI.getBookingDetail(bookingId);

      if (response && response.data) {
        setSelectedBooking(response.data);
      }

    } catch (error) {
      console.error('Lỗi khi lấy chi tiết lần khám:', error);
      setError('Không thể tải chi tiết lần khám');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
    setCancelReason('');
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      setError('Vui lòng nhập lý do hủy lịch');
      return;
    }

    try {
      setCancelLoading(true);
      setError('');

      const bookingId = bookingToCancel.bookingId || bookingToCancel.id;
      const response = await bookingAPI.cancelBooking(bookingId, cancelReason);

      if (response && response.data) {
        // Refresh booking list
        await fetchBookings(currentPage);
        closeCancelModal();
        setError('');
        // Show success message temporarily
        const successMsg = 'Hủy lịch khám thành công';
        setError('');
        setTimeout(() => {
          alert(successMsg);
        }, 100);
      }
    } catch (error) {
      console.error('Lỗi khi hủy lịch khám:', error);
      setError(error.message || 'Không thể hủy lịch khám. Vui lòng thử lại.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    const statusColors = {
      'COMPLETED': '#10b981',
      'CONFIRMED': '#3b82f6',
      'PENDING': '#f59e0b',
      'CANCELED': '#ef4444',
      'CANCELLED': '#ef4444',
      'NOSHOW': '#8b5cf6',
      'NO_SHOW': '#8b5cf6',
      'REJECT': '#dc2626',
      'REJECTED': '#dc2626'
    };
    return statusColors[normalizedStatus] || '#6b7280';
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toUpperCase();
    const statusTexts = {
      'COMPLETED': 'Hoàn thành',
      'CONFIRMED': 'Đã xác nhận',
      'PENDING': 'Chờ xử lý',
      'CANCELED': 'Đã hủy',
      'CANCELLED': 'Đã hủy',
      'NOSHOW': 'Không đến',
      'NO_SHOW': 'Không đến',
      'REJECT': 'Từ chối',
      'REJECTED': 'Từ chối'
    };
    return statusTexts[normalizedStatus] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="lich-su-kham-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="lich-su-kham-container">
      <div className="lich-su-content">
        {/* Header */}
        <div className="page-header">
          <h1>Lịch sử khám chữa bệnh</h1>
          <p>Xem lại toàn bộ lịch sử các lần khám chữa bệnh của bạn tại bệnh viện</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Danh sách lịch sử khám */}
        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="no-data">
              Chưa có lịch sử khám chữa bệnh nào
            </div>
          ) : (
            <>
              {bookings.map((booking) => (
                <div key={booking.bookingId || booking.id} className="booking-item">
                  <div className="booking-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="booking-info">
                    <h3>{booking.title || booking.serviceName || 'Khám bệnh'}</h3>
                    <p>
                      Ngày khám: {formatDate(booking.examDate || booking.appointmentDate || booking.scheduledDatetime)}
                      {(booking.department?.departmentName || booking.departmentName) &&
                        ` | ${booking.department?.departmentName || booking.departmentName}`}
                      {booking.room && ` | ${booking.room}`}
                    </p>
                  </div>
                  <div className="booking-actions">
                    <button
                      className="view-detail-btn"
                      onClick={() => handleViewDetail(booking)}
                    >
                      Xem chi tiết
                    </button>
                    {(booking.status === 'Pending' || booking.status === 'PENDING' ||
                      booking.status === 'Confirmed' || booking.status === 'CONFIRMED') && (
                      <button
                        className="cancel-booking-btn"
                        onClick={() => handleCancelClick(booking)}
                      >
                        Hủy lịch
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 0}
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {currentPage + 1} / {totalPages} (Tổng: {totalElements} bản ghi)
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage >= totalPages - 1}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal chi tiết */}
        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-section">
                  <div className="hospital-info">
                    <span className="hospital-name">
                      {selectedBooking.department?.hospitalName || 'Bệnh viện'}
                    </span>
                    <span className="department-name">
                      {selectedBooking.department?.departmentName || ''}
                    </span>
                  </div>
                  <h2>Chi tiết lịch khám</h2>
                  <div className="booking-status-header">
                    <span
                      className="status-badge large"
                      style={{ backgroundColor: getStatusColor(selectedBooking.status) }}
                    >
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                </div>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              
              {loadingDetail ? (
                <div className="modal-loading">Đang tải chi tiết...</div>
              ) : (
                <div className="modal-body">
                  {/* Mã lần khám */}
                  <div className="section">
                    <div className="booking-code">
                      <strong>Mã lịch khám: #{selectedBooking.bookingId}</strong>
                    </div>
                  </div>

                  {/* Thông tin bệnh nhân */}
                  {selectedBooking.patient && (
                    <div className="section">
                      <h3>Thông tin bệnh nhân</h3>
                      <div className="info-grid">
                        {selectedBooking.patient.patientCode && (
                          <div className="info-item">
                            <span className="label">Mã bệnh nhân:</span>
                            <span className="value">{selectedBooking.patient.patientCode}</span>
                          </div>
                        )}
                        {selectedBooking.patient.fullName && (
                          <div className="info-item">
                            <span className="label">Họ và tên:</span>
                            <span className="value">{selectedBooking.patient.fullName}</span>
                          </div>
                        )}
                        {selectedBooking.patient.phoneNumber && (
                          <div className="info-item">
                            <span className="label">Số điện thoại:</span>
                            <span className="value">{selectedBooking.patient.phoneNumber}</span>
                          </div>
                        )}
                        {selectedBooking.patient.email && (
                          <div className="info-item">
                            <span className="label">Email:</span>
                            <span className="value">{selectedBooking.patient.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Thông tin bác sĩ */}
                  {selectedBooking.doctor && (
                    <div className="section">
                      <h3>Thông tin bác sĩ</h3>
                      <div className="info-grid">
                        {selectedBooking.doctor.employeeCode && (
                          <div className="info-item">
                            <span className="label">Mã nhân viên:</span>
                            <span className="value">{selectedBooking.doctor.employeeCode}</span>
                          </div>
                        )}
                        {selectedBooking.doctor.fullName && (
                          <div className="info-item">
                            <span className="label">Họ và tên:</span>
                            <span className="value">{selectedBooking.doctor.fullName}</span>
                          </div>
                        )}
                        {selectedBooking.doctor.specialization && (
                          <div className="info-item">
                            <span className="label">Chuyên khoa:</span>
                            <span className="value">{selectedBooking.doctor.specialization}</span>
                          </div>
                        )}
                        {selectedBooking.doctor.phoneNumber && (
                          <div className="info-item">
                            <span className="label">Số điện thoại:</span>
                            <span className="value">{selectedBooking.doctor.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Thông tin khoa */}
                  {selectedBooking.department && (
                    <div className="section">
                      <h3>Thông tin khoa khám</h3>
                      <div className="info-grid">
                        {selectedBooking.department.departmentName && (
                          <div className="info-item">
                            <span className="label">Tên khoa:</span>
                            <span className="value">{selectedBooking.department.departmentName}</span>
                          </div>
                        )}
                        {selectedBooking.department.hospitalName && (
                          <div className="info-item">
                            <span className="label">Bệnh viện:</span>
                            <span className="value">{selectedBooking.department.hospitalName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Thông tin lịch khám */}
                  <div className="section">
                    <h3>Thông tin lịch khám</h3>
                    <div className="info-grid">
                      {selectedBooking.scheduledDatetime && (
                        <div className="info-item">
                          <span className="label">Thời gian khám:</span>
                          <span className="value">{formatDate(selectedBooking.scheduledDatetime)}</span>
                        </div>
                      )}
                      {selectedBooking.bookingSource && (
                        <div className="info-item">
                          <span className="label">Nguồn đặt lịch:</span>
                          <span className="value">
                            {selectedBooking.bookingSource === 'ONLINE' ? 'Trực tuyến' :
                             selectedBooking.bookingSource === 'OFFLINE' ? 'Tại bệnh viện' :
                             selectedBooking.bookingSource}
                          </span>
                        </div>
                      )}
                      {selectedBooking.statusDescription && (
                        <div className="info-item">
                          <span className="label">Trạng thái:</span>
                          <span className="value">{selectedBooking.statusDescription}</span>
                        </div>
                      )}
                      {selectedBooking.createdAt && (
                        <div className="info-item">
                          <span className="label">Ngày tạo:</span>
                          <span className="value">{formatDate(selectedBooking.createdAt)}</span>
                        </div>
                      )}
                      {selectedBooking.updatedAt && (
                        <div className="info-item">
                          <span className="label">Cập nhật lần cuối:</span>
                          <span className="value">{formatDate(selectedBooking.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lý do hủy (nếu có) */}
                  {selectedBooking.cancellationReason && (
                    <div className="section">
                      <h3>Lý do hủy</h3>
                      <div className="cancellation-reason">
                        {selectedBooking.cancellationReason}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && bookingToCancel && (
          <div className="modal-overlay" onClick={closeCancelModal}>
            <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Hủy lịch khám</h2>
                <button className="close-btn" onClick={closeCancelModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="booking-info-summary">
                  <p><strong>Mã lịch khám:</strong> {bookingToCancel.bookingCode || bookingToCancel.bookingId || bookingToCancel.id}</p>
                  <p><strong>Thời gian:</strong> {formatDate(bookingToCancel.examDate || bookingToCancel.appointmentDate || bookingToCancel.scheduledDatetime)}</p>
                  {(bookingToCancel.department?.departmentName || bookingToCancel.departmentName) && (
                    <p><strong>Khoa:</strong> {bookingToCancel.department?.departmentName || bookingToCancel.departmentName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="cancelReason">
                    Lý do hủy lịch <span className="required">*</span>
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Vui lòng nhập lý do hủy lịch khám..."
                    rows="4"
                    className="cancel-reason-input"
                  />
                </div>

                {error && (
                  <div className="error-message-inline">
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={closeCancelModal}
                  disabled={cancelLoading}
                >
                  Đóng
                </button>
                <button
                  className="btn-danger"
                  onClick={handleCancelBooking}
                  disabled={cancelLoading || !cancelReason.trim()}
                >
                  {cancelLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;

