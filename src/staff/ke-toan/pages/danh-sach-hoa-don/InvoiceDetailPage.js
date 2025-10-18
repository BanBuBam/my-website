import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './InvoiceDetailPage.css';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';

const InvoiceDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const invoice = location.state?.invoice;

    // Mock dữ liệu chi tiết (giống CreateInvoicePage)
    const invoiceDetail = {
        id: invoice?.id || 'HD001',
        patientName: invoice?.patientName || 'Nguyễn Văn A',
        dob: '12/03/1995',
        gender: 'Nam',
        phone: '0987654321',
        address: '123 Nguyễn Trãi, Hà Nội',
        taxCode: '0123456789',
        accountNumber: '1234567890 - Vietcombank',
        paymentMethod: 'Chuyển khoản',
        department: invoice?.department || 'Khoa Nội',
        room: invoice?.room || 'Phòng 101',
        date: invoice?.date || '05/10/2025',
        symptom: 'Đau đầu, sốt nhẹ',
        services: [
            { id: 1, name: 'Khám tổng quát', unit: 'Lần', quantity: 1, price: 500000 },
            { id: 2, name: 'Xét nghiệm máu', unit: 'Lần', quantity: 1, price: 250000 },
            { id: 3, name: 'Thuốc hạ sốt Paracetamol', unit: 'Hộp', quantity: 2, price: 120000 },
            { id: 4, name: 'Thuốc kháng sinh Amoxicillin', unit: 'Hộp', quantity: 1, price: 150000 },
            { id: 5, name: 'Chụp X-quang', unit: 'Lần', quantity: 1, price: 280000 }
        ]
    };

    const totalAmount = invoiceDetail.services.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const formatCurrency = (value) =>
        value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const handleBack = () => {
        navigate('/staff/tai-chinh/ds-hoa-don');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="invoice-detail-page">
            {/* Action Buttons */}
            <div className="action-bar">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <button className="btn-print" onClick={handlePrint}>
                    <FiPrinter /> In hóa đơn
                </button>
            </div>

            {/* Header 3 cột */}
            <div className="invoice-header">
                <div className="hospital-info">
                    <h4>Bệnh viện ABC</h4>
                    <p>123 Nguyễn Trãi, Hà Nội</p>
                    <p>ĐT: (024) 1234 5678</p>
                </div>
                <div className="invoice-title">
                    <h2>HÓA ĐƠN THANH TOÁN</h2>
                    <p>Mã hóa đơn: <strong>{invoiceDetail.id}</strong></p>
                    <p>Ngày tạo: {invoiceDetail.date}</p>
                    <p>Mẫu phiếu: MHD-001</p>
                </div>
                <div className="signature">
                    <p>Ký hiện phiếu</p>
                    <div className="signature-box"></div>
                </div>
            </div>

            {/* Thông tin bệnh nhân */}
            <div className="patient-info-section">
                <h3>Thông tin bệnh nhân</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Họ và tên:</label>
                        <span>{invoiceDetail.patientName}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày sinh:</label>
                        <span>{invoiceDetail.dob}</span>
                    </div>
                    <div className="info-item">
                        <label>Giới tính:</label>
                        <span>{invoiceDetail.gender}</span>
                    </div>
                    <div className="info-item">
                        <label>Số điện thoại:</label>
                        <span>{invoiceDetail.phone}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Địa chỉ:</label>
                        <span>{invoiceDetail.address}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã số thuế:</label>
                        <span>{invoiceDetail.taxCode}</span>
                    </div>
                    <div className="info-item">
                        <label>Số tài khoản:</label>
                        <span>{invoiceDetail.accountNumber}</span>
                    </div>
                    <div className="info-item">
                        <label>Hình thức thanh toán:</label>
                        <span>{invoiceDetail.paymentMethod}</span>
                    </div>
                    <div className="info-item">
                        <label>Khoa:</label>
                        <span>{invoiceDetail.department}</span>
                    </div>
                    <div className="info-item">
                        <label>Phòng khám:</label>
                        <span>{invoiceDetail.room}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày khám:</label>
                        <span>{invoiceDetail.date}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Triệu chứng:</label>
                        <span>{invoiceDetail.symptom}</span>
                    </div>
                </div>
            </div>

            {/* Bảng dịch vụ */}
            <div className="service-table">
                <h3>Danh sách hàng hóa / dịch vụ</h3>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên hàng hóa / dịch vụ</th>
                            <th>Đơn vị</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceDetail.services.map((service, index) => (
                            <tr key={service.id}>
                                <td>{index + 1}</td>
                                <td className="text-left">{service.name}</td>
                                <td>{service.unit}</td>
                                <td>{service.quantity}</td>
                                <td>{formatCurrency(service.price)}</td>
                                <td>{formatCurrency(service.price * service.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" className="total-label">
                                <strong>Tổng tiền (số):</strong>
                            </td>
                            <td className="total-value">
                                <strong>{formatCurrency(totalAmount)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6" className="total-text">
                                Tổng tiền (chữ): <strong>Một triệu bốn trăm hai mươi nghìn đồng</strong>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6" className="payment-info">
                                Thời hạn thanh toán: <strong>7 ngày</strong> – Nơi thanh toán: <strong>Quầy thu ngân</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Ô chữ ký */}
            <div className="signature-section">
                <div className="signature-box-wrapper">
                    <p><strong>Người thu tiền</strong></p>
                    <p className="note">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="signature-box-wrapper">
                    <p><strong>Bác sĩ khám</strong></p>
                    <p className="note">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="signature-box-wrapper">
                    <p>Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</p>
                    <p><strong>Người nộp tiền</strong></p>
                    <p className="note">(Ký, ghi rõ họ tên)</p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;

