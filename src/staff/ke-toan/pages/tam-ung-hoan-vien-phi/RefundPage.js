import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RefundPage.css';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const RefundPage = () => {
    const navigate = useNavigate();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        patientName: '',
        dob: '',
        address: '',
        accountNumber: '',
        taxCode: '',
        paymentMethod: 'Tiền mặt',
        phone: '',
        department: '',
        room: '',
        refundAmount: '',
        refundDate: new Date().toISOString().split('T')[0],
        reason: ''
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
            refundAmount: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate
        if (!formData.patientName || !formData.refundAmount) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Show success popup
        setShowSuccessPopup(true);

        // Redirect after 2 seconds
        setTimeout(() => {
            navigate('/staff/tai-chinh/dashboard');
        }, 2000);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="refund-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>Phiếu Tạm ứng / Hoàn viện phí</h2>
                <div></div>
            </div>

            {/* Form Header */}
            <div className="form-header">
                <div className="hospital-info">
                    <h3>BỆNH VIỆN ABC</h3>
                    <p>123 Nguyễn Trãi, Hà Nội</p>
                    <p>ĐT: (024) 1234 5678</p>
                </div>
                <div className="form-title">
                    <h2>PHIẾU TẠM ỨNG / HOÀN VIỆN PHÍ</h2>
                    <p>Số phiếu: HVP{Date.now().toString().slice(-6)}</p>
                    <p>Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>

            {/* Main Form */}
            <form className="refund-form" onSubmit={handleSubmit}>
                {/* Thông tin bệnh nhân */}
                <div className="form-section">
                    <h3>Thông tin bệnh nhân</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tên bệnh nhân: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                placeholder="Nhập họ tên bệnh nhân"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày sinh:</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Địa chỉ:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                            />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại:</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
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

                        <div className="form-group">
                            <label>Mã số thuế:</label>
                            <input
                                type="text"
                                name="taxCode"
                                value={formData.taxCode}
                                onChange={handleChange}
                                placeholder="Nhập mã số thuế"
                            />
                        </div>

                        <div className="form-group">
                            <label>Hình thức thanh toán:</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Thông tin khám bệnh */}
                <div className="form-section">
                    <h3>Thông tin khám bệnh</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Khoa:</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Nhập tên khoa"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phòng khám:</label>
                            <input
                                type="text"
                                name="room"
                                value={formData.room}
                                onChange={handleChange}
                                placeholder="Nhập phòng khám"
                            />
                        </div>
                    </div>
                </div>

                {/* Thông tin hoàn tiền */}
                <div className="form-section highlight">
                    <h3>Thông tin hoàn tiền</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Số tiền hoàn: <span className="required">*</span></label>
                            <div className="input-with-currency">
                                <input
                                    type="text"
                                    name="refundAmount"
                                    value={formatCurrency(formData.refundAmount)}
                                    onChange={handleAmountChange}
                                    placeholder="Nhập số tiền hoàn"
                                    required
                                />
                                <span className="currency-label">VNĐ</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Ngày hoàn tiền: <span className="required">*</span></label>
                            <input
                                type="date"
                                name="refundDate"
                                value={formData.refundDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Lý do hoàn tiền:</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Nhập lý do hoàn tiền (nếu có)"
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* Hiển thị số tiền bằng chữ */}
                    <div className="amount-in-words">
                        <strong>Số tiền bằng chữ:</strong> 
                        <span>{formData.refundAmount ? 'Một triệu năm trăm nghìn đồng' : '...'}</span>
                    </div>
                </div>

                {/* Chữ ký */}
                <div className="signature-section">
                    <div className="signature-box left">
                        <p><strong>Người nộp tiền</strong></p>
                        <p className="note">(Ký, ghi rõ họ tên)</p>
                        <div className="signature-space"></div>
                    </div>

                    <div className="signature-box right">
                        <p className="date-location">
                            Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                        </p>
                        <p><strong>Người thu tiền</strong></p>
                        <p className="note">(Ký, ghi rõ họ tên)</p>
                        <div className="signature-space"></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={handleBack}>
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit">
                        <FiSave /> Lưu phiếu
                    </button>
                </div>
            </form>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <div className="success-icon">✓</div>
                        <h3>Lưu phiếu thành công!</h3>
                        <p>Phiếu tạm ứng/hoàn viện phí đã được lưu vào hệ thống.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundPage;

