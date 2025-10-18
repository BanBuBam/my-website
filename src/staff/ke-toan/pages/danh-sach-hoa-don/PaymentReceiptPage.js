import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentReceiptPage.css';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

const PaymentReceiptPage = () => {
    const navigate = useNavigate();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        invoiceCode: '',
        patientName: '',
        patientPhone: '',
        patientAddress: '',
        paymentMethod: 'Tiền mặt',
        bankName: '',
        accountNumber: '',
        transactionCode: '',
        amount: '',
        note: '',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCurrency = (value) => {
        if (!value) return '';
        return parseInt(value).toLocaleString('vi-VN');
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({
            ...prev,
            amount: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate form
        if (!formData.patientName || !formData.amount) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }
        
        // Show success popup
        setShowSuccessPopup(true);
        
        // Redirect after 2 seconds
        setTimeout(() => {
            navigate('/staff/tai-chinh/ds-hoa-don');
        }, 2000);
    };

    const handleBack = () => {
        navigate('/staff/tai-chinh/ds-hoa-don');
    };

    return (
        <div className="payment-receipt-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>Phiếu Thanh Toán</h2>
                <div></div>
            </div>

            {/* Receipt Header */}
            <div className="receipt-header">
                <div className="hospital-info">
                    <h3>BỆNH VIỆN ABC</h3>
                    <p>123 Nguyễn Trãi, Hà Nội</p>
                    <p>ĐT: (024) 1234 5678</p>
                    <p>Email: info@benhvienabc.vn</p>
                </div>
                <div className="receipt-title">
                    <h2>PHIẾU THANH TOÁN</h2>
                    <p>Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                    <p>Số phiếu: PT{Date.now().toString().slice(-6)}</p>
                </div>
            </div>

            {/* Payment Form */}
            <form className="payment-form" onSubmit={handleSubmit}>
                {/* Thông tin hóa đơn */}
                <div className="form-section">
                    <h3>Thông tin hóa đơn</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Mã hóa đơn:</label>
                            <input
                                type="text"
                                name="invoiceCode"
                                value={formData.invoiceCode}
                                onChange={handleChange}
                                placeholder="Nhập mã hóa đơn (nếu có)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày thanh toán: <span className="required">*</span></label>
                            <input
                                type="date"
                                name="paymentDate"
                                value={formData.paymentDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Thông tin người thanh toán */}
                <div className="form-section">
                    <h3>Thông tin người thanh toán</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Họ và tên: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                placeholder="Nhập họ tên người thanh toán"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại:</label>
                            <input
                                type="tel"
                                name="patientPhone"
                                value={formData.patientPhone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ:</label>
                            <input
                                type="text"
                                name="patientAddress"
                                value={formData.patientAddress}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                            />
                        </div>
                    </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="form-section">
                    <h3>Thông tin thanh toán</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Hình thức thanh toán: <span className="required">*</span></label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                required
                            >
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                                <option value="Ví điện tử">Ví điện tử</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Số tiền thanh toán: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="amount"
                                value={formatCurrency(formData.amount)}
                                onChange={handleAmountChange}
                                placeholder="Nhập số tiền"
                                required
                            />
                            <span className="currency-label">VNĐ</span>
                        </div>

                        {/* Hiển thị thêm thông tin nếu chọn chuyển khoản */}
                        {formData.paymentMethod === 'Chuyển khoản' && (
                            <>
                                <div className="form-group">
                                    <label>Tên ngân hàng:</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên ngân hàng"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số tài khoản:</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        placeholder="Nhập số tài khoản"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Mã giao dịch:</label>
                                    <input
                                        type="text"
                                        name="transactionCode"
                                        value={formData.transactionCode}
                                        onChange={handleChange}
                                        placeholder="Nhập mã giao dịch"
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group full-width">
                            <label>Ghi chú:</label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Nhập ghi chú (nếu có)"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                {/* Tổng tiền */}
                <div className="total-section">
                    <div className="total-row">
                        <span>Tổng tiền thanh toán:</span>
                        <span className="total-amount">
                            {formatCurrency(formData.amount)} VNĐ
                        </span>
                    </div>
                    <div className="total-text">
                        Bằng chữ: <strong>{formData.amount ? 'Một triệu năm trăm nghìn đồng' : '...'}</strong>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="signature-section">
                    <div className="signature-box">
                        <p><strong>Người thu tiền</strong></p>
                        <p className="note">(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div className="signature-box">
                        <p><strong>Kế toán trưởng</strong></p>
                        <p className="note">(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div className="signature-box">
                        <p>Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</p>
                        <p><strong>Người nộp tiền</strong></p>
                        <p className="note">(Ký, ghi rõ họ tên)</p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={handleBack}>
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit">
                        <FiCheck /> Xác nhận thanh toán
                    </button>
                </div>
            </form>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content success">
                        <div className="success-icon">
                            <FiCheck />
                        </div>
                        <h3>Thanh toán thành công!</h3>
                        <p>Phiếu thanh toán đã được tạo và lưu vào hệ thống.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentReceiptPage;

