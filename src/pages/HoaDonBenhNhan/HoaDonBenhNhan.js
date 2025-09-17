import React, { useState } from 'react';
import './HoaDonBenhNhan.css';

const HoaDonBenhNhan = () => {
  const [searchTerm, setSearchTerm] = useState('Nguyễn Văn A');
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Dữ liệu mẫu cho danh sách hóa đơn
  const invoices = [
    {
      id: '86525',
      date: '25/12/2025',
      department: 'Nội',
      doctor: 'Nguyễn Văn A',
      patientInfo: {
        fullName: 'Nguyễn Văn A',
        birthDate: '15/05/1985',
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        cccd: '123456789012',
        insuranceCode: 'BH123456789',
        note: 'Bệnh nhân có tiền sử bệnh tim'
      },
      examInfo: {
        examDate: '25/12/2025',
        doctor: 'BS. Nguyễn Văn A',
        department: 'Khoa Nội',
        room: 'Phòng 101',
        symptoms: 'Đau ngực, khó thở',
        diagnosis: 'Viêm phổi cấp',
        note: 'Cần theo dõi thêm'
      },
      services: [
        { stt: 1, name: 'Khám tổng quát', code: 'KTQ001', symbol: 'KQ', quantity: 1, price: 200000, total: 200000 },
        { stt: 2, name: 'Xét nghiệm máu', code: 'XN001', symbol: 'XN', quantity: 1, price: 150000, total: 150000 },
        { stt: 3, name: 'Chụp X-quang phổi', code: 'XQ001', symbol: 'XQ', quantity: 1, price: 300000, total: 300000 },
        { stt: 4, name: 'Thuốc kháng sinh', code: 'TH001', symbol: 'TH', quantity: 2, price: 50000, total: 100000 },
        { stt: 5, name: 'Thuốc giảm đau', code: 'TH002', symbol: 'TH', quantity: 1, price: 30000, total: 30000 }
      ],
      totalAmount: 780000,
      totalInWords: 'Bảy trăm tám mươi nghìn đồng',
      createdDate: '25/12/2025'
    },
    {
      id: '86526',
      date: '20/12/2025',
      department: 'Ngoại',
      doctor: 'Trần Thị B',
      patientInfo: {
        fullName: 'Nguyễn Văn A',
        birthDate: '15/05/1985',
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        cccd: '123456789012',
        insuranceCode: 'BH123456789',
        note: 'Bệnh nhân có tiền sử bệnh tim'
      },
      examInfo: {
        examDate: '20/12/2025',
        doctor: 'BS. Trần Thị B',
        department: 'Khoa Ngoại',
        room: 'Phòng 205',
        symptoms: 'Đau bụng dưới',
        diagnosis: 'Viêm ruột thừa',
        note: 'Cần phẫu thuật'
      },
      services: [
        { stt: 1, name: 'Khám chuyên khoa', code: 'KCK001', symbol: 'KQ', quantity: 1, price: 300000, total: 300000 },
        { stt: 2, name: 'Siêu âm bụng', code: 'SA001', symbol: 'SA', quantity: 1, price: 250000, total: 250000 },
        { stt: 3, name: 'Phẫu thuật ruột thừa', code: 'PT001', symbol: 'PT', quantity: 1, price: 5000000, total: 5000000 }
      ],
      totalAmount: 5550000,
      totalInWords: 'Năm triệu năm trăm năm mươi nghìn đồng',
      createdDate: '20/12/2025'
    },
    {
      id: '86527',
      date: '15/12/2025',
      department: 'Mắt',
      doctor: 'Lê Văn C',
      patientInfo: {
        fullName: 'Nguyễn Văn A',
        birthDate: '15/05/1985',
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        cccd: '123456789012',
        insuranceCode: 'BH123456789',
        note: 'Bệnh nhân có tiền sử bệnh tim'
      },
      examInfo: {
        examDate: '15/12/2025',
        doctor: 'BS. Lê Văn C',
        department: 'Khoa Mắt',
        room: 'Phòng 301',
        symptoms: 'Mờ mắt, đau mắt',
        diagnosis: 'Cận thị, viêm kết mạc',
        note: 'Cần đeo kính'
      },
      services: [
        { stt: 1, name: 'Khám mắt tổng quát', code: 'KM001', symbol: 'KM', quantity: 1, price: 150000, total: 150000 },
        { stt: 2, name: 'Đo độ cận thị', code: 'DC001', symbol: 'DC', quantity: 1, price: 100000, total: 100000 },
        { stt: 3, name: 'Thuốc nhỏ mắt', code: 'TM001', symbol: 'TM', quantity: 2, price: 45000, total: 90000 }
      ],
      totalAmount: 340000,
      totalInWords: 'Ba trăm bốn mươi nghìn đồng',
      createdDate: '15/12/2025'
    }
  ];

  const handleSearch = () => {
    console.log('Tìm kiếm:', searchTerm);
  };

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="hoa-don-benh-nhan-container">
      <div className="hoa-don-content">
        {/* Thanh tìm kiếm */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Nhập tên/email/số điện thoại bệnh nhân"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="page-title">
          <h1>Hóa đơn của bệnh nhân: {searchTerm}</h1>
        </div>

        {/* Danh sách hóa đơn */}
        <div className="invoice-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-item">
              <div className="invoice-info">
                <h3>Hóa đơn số {invoice.id}</h3>
                <p>Ngày {invoice.date}, Khoa: {invoice.department}, Bác sĩ: {invoice.doctor}</p>
              </div>
              <button 
                className="view-detail-btn"
                onClick={() => handleViewDetail(invoice)}
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>

        {/* Modal chi tiết hóa đơn */}
        {showModal && selectedInvoice && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>CHI TIẾT HÓA ĐƠN SỐ {selectedInvoice.id}</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                {/* Thông tin bệnh nhân */}
                <div className="section">
                  <h3>Thông tin bệnh nhân</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Họ tên:</span>
                      <span className="value">{selectedInvoice.patientInfo.fullName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Ngày sinh:</span>
                      <span className="value">{selectedInvoice.patientInfo.birthDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{selectedInvoice.patientInfo.address}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedInvoice.patientInfo.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{selectedInvoice.patientInfo.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">CCCD:</span>
                      <span className="value">{selectedInvoice.patientInfo.cccd}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Mã bảo hiểm:</span>
                      <span className="value">{selectedInvoice.patientInfo.insuranceCode}</span>
                    </div>
                    <div className="info-item full-width">
                      <span className="label">Ghi chú:</span>
                      <span className="value">{selectedInvoice.patientInfo.note}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin khám bệnh */}
                <div className="section">
                  <h3>Thông tin khám bệnh</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Ngày khám:</span>
                      <span className="value">{selectedInvoice.examInfo.examDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Bác sĩ khám:</span>
                      <span className="value">{selectedInvoice.examInfo.doctor}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Chuyên khoa:</span>
                      <span className="value">{selectedInvoice.examInfo.department}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phòng khám:</span>
                      <span className="value">{selectedInvoice.examInfo.room}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Triệu chứng:</span>
                      <span className="value">{selectedInvoice.examInfo.symptoms}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Chẩn đoán:</span>
                      <span className="value">{selectedInvoice.examInfo.diagnosis}</span>
                    </div>
                    <div className="info-item full-width">
                      <span className="label">Ghi chú:</span>
                      <span className="value">{selectedInvoice.examInfo.note}</span>
                    </div>
                  </div>
                </div>

                {/* Bảng dịch vụ */}
                <div className="section">
                  <h3>Danh sách dịch vụ đã sử dụng</h3>
                  <table className="services-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên dịch vụ</th>
                        <th>Mã dịch vụ</th>
                        <th>Ký hiệu</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.services.map((service) => (
                        <tr key={service.stt}>
                          <td>{service.stt}</td>
                          <td>{service.name}</td>
                          <td>{service.code}</td>
                          <td>{service.symbol}</td>
                          <td>{service.quantity}</td>
                          <td>{formatCurrency(service.price)}</td>
                          <td>{formatCurrency(service.total)}</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td colSpan="6" className="total-label">Tổng tiền</td>
                        <td className="total-amount">{formatCurrency(selectedInvoice.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tổng tiền bằng chữ */}
                <div className="section">
                  <div className="total-in-words">
                    <strong>Tổng tiền bằng chữ: {selectedInvoice.totalInWords}</strong>
                  </div>
                </div>

                {/* Ngày tạo và chữ ký */}
                <div className="section">
                  <div className="invoice-footer">
                    <div className="created-date">
                      <strong>Ngày tạo hóa đơn: {selectedInvoice.createdDate}</strong>
                    </div>
                    <div className="signatures">
                      <div className="signature-box">
                        <h4>Chữ ký bệnh nhân</h4>
                        <div className="signature-area"></div>
                      </div>
                      <div className="signature-box">
                        <h4>Chữ ký thu ngân</h4>
                        <div className="signature-area"></div>
                      </div>
                      <div className="signature-box">
                        <h4>Chữ ký bác sĩ</h4>
                        <div className="signature-area"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoaDonBenhNhan;
