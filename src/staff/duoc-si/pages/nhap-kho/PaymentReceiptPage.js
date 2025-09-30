import React from 'react';
import './PaymentReceiptPage.css';

const PaymentReceiptPage = () => {
    return (
        <div className="payment-receipt-page">
            <div className="receipt-header">
                <div className="col">
                    <p><strong>BỆNH VIỆN ABC</strong></p>
                    <p>Địa chỉ: 123 Phố X, Hà Nội</p>
                    <p>Điện thoại: 0123 456 789</p>
                </div>
                <div className="col center">
                    <h2>PHIẾU THANH TOÁN</h2>
                    <p>Ngày thanh toán: 30/09/2025</p>
                    <p>Số phiếu: PT001</p>
                </div>
                <div className="col right">
                    <p>Mẫu số: 02-PTT</p>
                    <p>Ký hiệu: ABC/2025</p>
                </div>
            </div>

            <div className="payment-info">
                <p>Người thanh toán: ............................................................</p>
                <p>Địa chỉ: ....................................................................</p>
                <p>Số điện thoại: ............................................................</p>
                <p>Hình thức thanh toán: [Tiền mặt / Chuyển khoản]</p>
            </div>

            <table className="items-table">
                <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên mặt hàng</th>
                    <th>Đơn vị</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
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
                <tr>
                    <td>2</td>
                    <td>Amoxicillin 500mg</td>
                    <td>Viên</td>
                    <td>50</td>
                    <td>3,500</td>
                    <td>175,000</td>
                </tr>
                <tr className="total-row">
                    <td colSpan="5">Tổng cộng</td>
                    <td>375,000</td>
                </tr>
                </tbody>
            </table>

            <p><strong>Thành tiền (bằng chữ):</strong> Ba trăm bảy mươi lăm nghìn đồng</p>
            <p><strong>Thuế VAT (8%):</strong> 30,000</p>
            <p><strong>Tổng thanh toán:</strong> 405,000</p>

            <div className="payment-footer">
                <div className="col">
                    <p><strong>Người nộp tiền</strong></p>
                    <p>(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="col center">
                    <p><strong>Thủ quỹ</strong></p>
                    <p>(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="col right">
                    <p>Hà Nội, ngày 30 tháng 09, 2025</p>
                    <p><strong>Người lập phiếu</strong></p>
                    <p>(Ký, ghi rõ họ tên)</p>
                </div>
            </div>

            <div className="actions">
                <button className="btn-print">In phiếu</button>
                <button className="btn-back" onClick={() => window.history.back()}>Quay lại</button>
            </div>
        </div>
    );
};

export default PaymentReceiptPage;
