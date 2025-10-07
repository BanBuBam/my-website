import React from "react";
import "./VisitDetailPage.css";

const VisitDetailPage = () => {
    // Mock dữ liệu lượt khám
    const visitDetail = {
        id: "LK001",
        patient: {
            name: "Nguyễn Văn A",
            dob: "12/08/1985",
            gender: "Nam",
            address: "123 Nguyễn Trãi, Hà Nội",
            phone: "0987 654 321",
        },
        department: "Khoa Nội",
        visitDate: "2025-09-30",
        symptom: "Sốt cao, đau đầu, mệt mỏi",
        services: [
            { id: 1, name: "Khám tổng quát", unit: "Lần", quantity: 1, price: 500000 },
            { id: 2, name: "Xét nghiệm máu", unit: "Lần", quantity: 1, price: 250000 },
            { id: 3, name: "Thuốc hạ sốt Paracetamol", unit: "Hộp", quantity: 2, price: 120000 },
        ]
    };

    const totalAmount = visitDetail.services.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const formatCurrency = (value) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    return (
        <div className="visit-detail-page">
            <h2>Chi tiết lượt khám của bệnh nhân</h2>

            {/* Thông tin bệnh nhân */}
            <div className="patient-info">
                <h3>Thông tin bệnh nhân</h3>
                <p><strong>Họ tên:</strong> {visitDetail.patient.name}</p>
                <p><strong>Ngày sinh:</strong> {visitDetail.patient.dob}</p>
                <p><strong>Giới tính:</strong> {visitDetail.patient.gender}</p>
                <p><strong>Địa chỉ:</strong> {visitDetail.patient.address}</p>
                <p><strong>Số điện thoại:</strong> {visitDetail.patient.phone}</p>
                <p><strong>Khoa khám:</strong> {visitDetail.department}</p>
                <p><strong>Ngày khám:</strong> {visitDetail.visitDate}</p>
                <p><strong>Triệu chứng:</strong> {visitDetail.symptom}</p>
            </div>

            {/* Danh sách dịch vụ */}
            <div className="service-table">
                <h3>Dịch vụ / sản phẩm đã sử dụng</h3>
                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên dịch vụ / sản phẩm</th>
                        <th>Đơn vị</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    {visitDetail.services.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.unit}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan="5" className="total-label">Tổng tiền:</td>
                        <td className="total-value">{formatCurrency(totalAmount)}</td>
                    </tr>
                    </tfoot>
                </table>
            </div>
            {/* Nút thêm hóa đơn */}
            <div className="add-invoice-btn">
                <button onClick={() => window.location.href = "/staff/tai-chinh/tao-hoa-don"}>
                    Thêm hóa đơn
                </button>
            </div>
        </div>
    );
};

export default VisitDetailPage;
