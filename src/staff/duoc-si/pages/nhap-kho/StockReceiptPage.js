import React from 'react';
import './StockReceiptPage.css';

const StockReceiptPage = () => {
    return (
        <div className="stock-receipt-page">
            <div className="receipt-header">
                <div className="col">
                    <p><strong>BỆNH VIỆN ABC</strong></p>
                    <p>Địa chỉ: 123 Phố X, Hà Nội</p>
                    <p>Điện thoại: 0123 456 789</p>
                </div>
                <div className="col center">
                    <h2>PHIẾU NHẬP KHO</h2>
                    <p>Ngày tạo phiếu: 30/09/2025</p>
                    <p>Mã số phiếu: PN001</p>
                </div>
                <div className="col right">
                    <p>Mẫu số: 01-PNK</p>
                    <p>Ký hiệu: ABC/2025</p>
                </div>
            </div>

            <div className="receipt-info">
                <p>Họ tên người giao: .................................................... Ngày sinh: ....................................................</p>
                <p>Người giao hàng: .................................................... Địa chỉ gửi: ....................................................</p>
                <p>Người nhận hàng: .................................................... Địa chỉ gửi: ....................................................</p>
                <p>Mã Kho: ............................ Tên kho: ............................ Mã hóa đơn: ............................</p>
                <p>Ngày gửi hàng: .................................................... Ngày nhận hàng: ....................................................</p>
                <p>Tên nhà cung cấp: .................................................... Địa chỉ: ....................................................</p>
            </div>

            <table className="items-table">
                <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên mặt hàng</th>
                    <th>Đơn vị</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Thành tiền</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1</td>
                    <td>Paracetamol 500mg</td>
                    <td>Viên</td>
                    <td>100</td>
                    <td>2,000</td>
                    <td>200,000</td>
                </tr>
                <tr className="total-row">
                    <td colSpan="5">Cộng tiền</td>
                    <td>200,000</td>
                </tr>
                </tbody>
            </table>

            <p><strong>Thành tiền (bằng chữ):</strong> Hai trăm nghìn đồng</p>
            <p><strong>Thời hạn thanh toán:</strong> 30 ngày</p>
            <p><strong>Phương thức thanh toán:</strong> Tiền mặt / Chuyển khoản</p>

            <div className="receipt-footer">
                <div className="col">
                    <p><strong>Người nộp tiền</strong></p>
                    <p>(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="col right">
                    <p>Hà Nội, ngày 05 tháng 09, 2025</p>
                    <p><strong>Người thu tiền</strong></p>
                    <p>(Ký, ghi rõ họ tên)</p>
                </div>
            </div>

            <div className="actions">
                <button className="btn-pay">Thanh toán</button>
            </div>
        </div>
    );
};

export default StockReceiptPage;
