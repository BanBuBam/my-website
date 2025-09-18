import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import './LichSuKhamChuaBenh.css';

const LichSuKhamChuaBenh = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Dữ liệu mẫu cho demo (sẽ thay thế bằng API call thực tế)
  const mockBookings = [
    {
      id: 'BK001',
      title: 'Khám tổng quát định kỳ',
      examDate: '2024-12-20',
      department: 'Khoa Nội',
      room: 'Phòng 101',
      status: 'Completed'
    },
    {
      id: 'BK002',
      title: 'Khám chuyên khoa tim mạch',
      examDate: '2024-12-15',
      department: 'Khoa Tim mạch',
      room: 'Phòng 205',
      status: 'Confirmed'
    },
    {
      id: 'BK003',
      title: 'Tái khám sau phẫu thuật',
      examDate: '2024-12-10',
      department: 'Khoa Ngoại',
      room: 'Phòng 301',
      status: 'Pending'
    },
    {
      id: 'BK004',
      title: 'Khám mắt định kỳ',
      examDate: '2024-12-05',
      department: 'Khoa Mắt',
      room: 'Phòng 102',
      status: 'Canceled'
    },
    {
      id: 'BK005',
      title: 'Khám răng hàm mặt',
      examDate: '2024-11-30',
      department: 'Khoa RHM',
      room: 'Phòng 401',
      status: 'NoShow'
    },
    {
      id: 'BK006',
      title: 'Khám da liễu',
      examDate: '2024-11-25',
      department: 'Khoa Da liễu',
      room: 'Phòng 203',
      status: 'Reject'
    }
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem lịch sử khám chữa bệnh');
        setBookings(mockBookings); // Sử dụng dữ liệu mẫu
        return;
      }

      // Uncomment khi có API thực tế
      // const response = await bookingAPI.getPatientBookings(token);
      // setBookings(response.data || response);
      
      // Tạm thời sử dụng dữ liệu mẫu
      setBookings(mockBookings);
      
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lịch sử khám:', error);
      setError('Không thể tải danh sách lịch sử khám chữa bệnh');
      setBookings(mockBookings); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (booking) => {
    try {
      setLoadingDetail(true);
      setShowModal(true);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Sử dụng dữ liệu mẫu chi tiết
        setSelectedBooking(getMockBookingDetail(booking.id));
        return;
      }

      // Uncomment khi có API thực tế
      // const response = await bookingAPI.getBookingDetail(booking.id, token);
      // setSelectedBooking(response.data || response);
      
      // Tạm thời sử dụng dữ liệu mẫu
      setSelectedBooking(getMockBookingDetail(booking.id));
      
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết lần khám:', error);
      setError('Không thể tải chi tiết lần khám');
      setSelectedBooking(getMockBookingDetail(booking.id));
    } finally {
      setLoadingDetail(false);
    }
  };

  const getMockBookingDetail = (bookingId) => {
    return {
      id: bookingId,
      title: 'Khám tổng quát định kỳ',
      status: 'Completed',
      hospitalName: 'Bệnh viện Đa khoa Phú Yên',
      departmentName: 'Sở Y tế Phú Yên',
      bookingCode: `BK${bookingId}`,
      patient: {
        fullName: 'Nguyễn Văn A',
        birthDate: '15/05/1985',
        address: '123 Đường ABC, Phường XYZ, TP. Tuy Hòa, Phú Yên',
        phone: '0123456789',
        idCard: '123456789012',
        insuranceNumber: 'BH123456789',
        email: 'nguyenvana@email.com',
        guardian: 'Nguyễn Thị B (Vợ)'
      },
      doctor: {
        name: 'BS. Trần Văn C',
        specialty: 'Nội khoa',
        phone: '0987654321'
      },
      facility: {
        room: 'Phòng 101',
        department: 'Khoa Nội',
        hospital: 'Bệnh viện Đa khoa Phú Yên'
      },
      booking: {
        createdDate: '2024-12-18 14:30:00',
        source: 'ONLINE',
        examDate: '2024-12-20 08:00:00'
      }
    };
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Completed': '#38a169',
      'Confirmed': '#3182ce',
      'Pending': '#d69e2e',
      'Canceled': '#e53e3e',
      'NoShow': '#9f7aea',
      'Reject': '#e53e3e'
    };
    return statusColors[status] || '#718096';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'Completed': 'Hoàn thành',
      'Confirmed': 'Đã xác nhận',
      'Pending': 'Chờ xử lý',
      'Canceled': 'Đã hủy',
      'NoShow': 'Không đến',
      'Reject': 'Từ chối'
    };
    return statusTexts[status] || status;
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
            bookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="booking-info">
                  <h3>{booking.title}</h3>
                  <p>Ngày khám: {booking.examDate} | {booking.department} | {booking.room}</p>
                </div>
                <div className="booking-actions">
                  <button 
                    className="view-detail-btn"
                    onClick={() => handleViewDetail(booking)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal chi tiết */}
        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-section">
                  <div className="hospital-info">
                    <span className="hospital-name">{selectedBooking.hospitalName}</span>
                    <span className="department-name">{selectedBooking.departmentName}</span>
                  </div>
                  <h2>{selectedBooking.title}</h2>
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
                      <strong>Mã lần khám: {selectedBooking.bookingCode}</strong>
                    </div>
                  </div>

                  {/* Thông tin bệnh nhân */}
                  <div className="section">
                    <h3>Thông tin bệnh nhân</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Tên bệnh nhân:</span>
                        <span className="value">{selectedBooking.patient.fullName}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Ngày sinh:</span>
                        <span className="value">{selectedBooking.patient.birthDate}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Địa chỉ:</span>
                        <span className="value">{selectedBooking.patient.address}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Số điện thoại:</span>
                        <span className="value">{selectedBooking.patient.phone}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Số căn cước:</span>
                        <span className="value">{selectedBooking.patient.idCard}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Số BHYT:</span>
                        <span className="value">{selectedBooking.patient.insuranceNumber}</span>
                      </div>
                      {selectedBooking.patient.email && (
                        <div className="info-item">
                          <span className="label">Email:</span>
                          <span className="value">{selectedBooking.patient.email}</span>
                        </div>
                      )}
                      {selectedBooking.patient.guardian && (
                        <div className="info-item">
                          <span className="label">Người giám hộ:</span>
                          <span className="value">{selectedBooking.patient.guardian}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thông tin bác sĩ */}
                  <div className="section">
                    <h3>Thông tin bác sĩ</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Tên bác sĩ:</span>
                        <span className="value">{selectedBooking.doctor.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Chuyên khoa:</span>
                        <span className="value">{selectedBooking.doctor.specialty}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Số điện thoại:</span>
                        <span className="value">{selectedBooking.doctor.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin nơi khám */}
                  <div className="section">
                    <h3>Thông tin nơi khám</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Phòng khám:</span>
                        <span className="value">{selectedBooking.facility.room}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Khoa:</span>
                        <span className="value">{selectedBooking.facility.department}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Tên bệnh viện:</span>
                        <span className="value">{selectedBooking.facility.hospital}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin đặt lịch */}
                  <div className="section">
                    <h3>Thông tin đặt lịch</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Ngày thực hiện đặt lịch:</span>
                        <span className="value">{selectedBooking.booking.createdDate}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Nguồn đặt lịch:</span>
                        <span className="value">{selectedBooking.booking.source}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Ngày khám:</span>
                        <span className="value">{selectedBooking.booking.examDate}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Trạng thái:</span>
                        <span className="value">
                          <span 
                            className="status-badge small"
                            style={{ backgroundColor: getStatusColor(selectedBooking.status) }}
                          >
                            {getStatusText(selectedBooking.status)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LichSuKhamChuaBenh;
