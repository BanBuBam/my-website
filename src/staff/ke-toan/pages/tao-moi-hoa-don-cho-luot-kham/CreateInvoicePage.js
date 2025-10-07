import React, { useState } from "react";
import "./CreateInvoicePage.css";

const CreateInvoicePage = () => {
    const [showPopup, setShowPopup] = useState(false);

    // Mock dữ liệu
    const services = [
        { id: 1, name: "Khám tổng quát", unit: "Lần", quantity: 1, price: 500000 },
        { id: 2, name: "Xét nghiệm máu", unit: "Lần", quantity: 1, price: 250000 },
        { id: 3, name: "Thuốc hạ sốt Paracetamol", unit: "Hộp", quantity: 2, price: 120000 },
    ];

    const totalAmount = services.reduce((sum, s) => sum + s.price * s.quantity, 0);

    const formatCurrency = (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    return (
        <div className="create-invoice-page">
            {/* Header 3 cột */}
            <div className="invoice-header">
                <div className="hospital-info">
                    <h4>Bệnh viện ABC</h4>
                    <p>123 Nguyễn Trãi, Hà Nội</p>
                </div>
                <div className="invoice-title">
                    <h2>Phiếu tạo hóa đơn</h2>
                    <p>Ngày tạo: 05/09/2025</p>
                    <p>Mẫu phiếu: MHD-001</p>
                </div>
                <div className="signature">
                    <p>Ký hiện phiếu</p>
                </div>
            </div>

            {/* Thông tin bệnh nhân */}
            <div className="patient-form">
                <h3>Thông tin bệnh nhân</h3>
                <form>
                    <input type="text" placeholder="Tên bệnh nhân" />
                    <input type="date" placeholder="Ngày sinh" />
                    <input type="text" placeholder="Số tài khoản" />
                    <input type="text" placeholder="Giới tính" />
                    <input type="text" placeholder="Số điện thoại" />
                    <input type="text" placeholder="Mã số thuế" />
                    <input type="text" placeholder="Người giám hộ" />
                    <input type="text" placeholder="Hình thức thanh toán" />
                    <input type="text" placeholder="Phòng khám" />
                    <input type="text" placeholder="Khoa" />
                    <input type="text" placeholder="Triệu chứng" />
                </form>
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
                    {services.map((s, index) => (
                        <tr key={s.id}>
                            <td>{index + 1}</td>
                            <td>{s.name}</td>
                            <td>{s.unit}</td>
                            <td>{s.quantity}</td>
                            <td>{formatCurrency(s.price)}</td>
                            <td>{formatCurrency(s.price * s.quantity)}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
                            Tổng tiền (số): {formatCurrency(totalAmount)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="6" style={{ textAlign: "right" }}>
                            Tổng tiền (chữ): Một triệu không trăm ...
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="6" style={{ textAlign: "right" }}>
                            Thời hạn thanh toán: 7 ngày – Nơi thanh toán: Quầy thu ngân
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            {/* Ô chữ ký */}
            <div className="signature-section">
                <div>
                    <p><strong>Người thu tiền</strong></p>
                </div>
                <div>
                    <p><strong>Bác sĩ khám</strong></p>
                </div>
                <div>
                    <p>Hà Nội, ngày 05 tháng 09, 2025</p>
                    <p><strong>Người nộp tiền</strong></p>
                </div>
            </div>

            {/* Nút tạo hóa đơn */}
            <div className="create-btn">
                <button onClick={() => setShowPopup(true)}>Tạo hóa đơn</button>
            </div>

            {/* Pop-up */}
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <p>Tạo hóa đơn cho bệnh nhân thành công!</p>
                        <button onClick={() => setShowPopup(false)}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateInvoicePage;
