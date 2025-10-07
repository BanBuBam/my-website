import React from "react";
import { FiEdit } from "react-icons/fi";
import "./UnpaidInvoiceDetailPage.css";

const UnpaidInvoiceDetailPage = () => {
    // Mock dữ liệu
    const invoice = {
        id: "HD2025001",
        createdDate: "30/09/2025",
        invoiceTemplate: "Mẫu 01GTKT0/001",
        customer: {
            fullName: "Nguyễn Văn A",
            dob: "12/08/1985",
            address: "123 Nguyễn Trãi, Hà Nội",
            taxCode: "0101234567",
            bankAccount: "1234567890 - Vietcombank",
            paymentMethod: "Chuyển khoản"
        },
        services: [
            {
                id: 1,
                name: "Khám tổng quát",
                unit: "Lần",
                quantity: 1,
                price: 500000,
            },
            {
                id: 2,
                name: "Xét nghiệm máu",
                unit: "Lần",
                quantity: 1,
                price: 250000,
            },
            {
                id: 3,
                name: "Thuốc hạ sốt Paracetamol",
                unit: "Hộp",
                quantity: 2,
                price: 120000,
            },
        ],
        paymentStatus: "Chưa thanh toán",
        dueDate: "10/10/2025",
    };

    // Tính tổng tiền
    const totalAmount = invoice.services.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const formatCurrency = (value) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    return (
        <div className="invoice-detail-page">
            {/* Tiêu đề */}
            <div className="invoice-header">
                <h2>Hóa đơn chưa thanh toán</h2>
                <p>Ngày tạo: {invoice.createdDate}</p>
                <p>Mẫu hóa đơn: {invoice.invoiceTemplate}</p>
            </div>

            {/* Thông tin khách hàng */}
            <div className="customer-info">
                <h3>Thông tin khách hàng</h3>
                <div className="info-grid">
                    <div><strong>Họ tên:</strong> {invoice.customer.fullName}</div>
                    <div><strong>Ngày sinh:</strong> {invoice.customer.dob}</div>
                    <div><strong>Địa chỉ:</strong> {invoice.customer.address}</div>
                    <div><strong>Mã số thuế:</strong> {invoice.customer.taxCode}</div>
                    <div><strong>Số tài khoản:</strong> {invoice.customer.bankAccount}</div>
                    <div><strong>Hình thức thanh toán:</strong> {invoice.customer.paymentMethod}</div>
                </div>
            </div>

            {/* Danh sách dịch vụ / sản phẩm */}
            <div className="service-table">
                <h3>Danh sách dịch vụ / sản phẩm đã sử dụng</h3>
                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm / dịch vụ</th>
                        <th>Đơn vị</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoice.services.map((item, index) => (
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
                        <td colSpan="5" className="total-label">
                            Tổng tiền:
                        </td>
                        <td className="total-value">{formatCurrency(totalAmount)}</td>
                    </tr>
                    <tr>
                        <td colSpan="6" className="total-text">
                            Tổng tiền bằng chữ: Một triệu chín trăm chín mươi nghìn đồng
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            {/* Trạng thái */}
            <div className="payment-info">
                <p><strong>Tình trạng thanh toán:</strong> {invoice.paymentStatus}</p>
                <p><strong>Hạn thanh toán:</strong> {invoice.dueDate}</p>
            </div>

            {/* Nút hành động */}
            <div className="action-buttons">
                <button className="edit-button">
                    <FiEdit /> Thay đổi thông tin
                </button>
            </div>
        </div>
    );
};

export default UnpaidInvoiceDetailPage;
