import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financeInpatientAPI, financeTransactionAPI } from '../../../../services/staff/financeAPI';
import {
    FiArrowLeft,
    FiUser,
    FiCalendar,
    FiActivity,
    FiAlertCircle,
    FiFileText,
    FiDollarSign,
    FiRefreshCw,
    FiX,
    FiCheck
} from 'react-icons/fi';
import './InpatientPaymentDetailPage.css';

const InpatientPaymentDetailPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    const [stay, setStay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Advance Payment Modal State
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [processingAdvance, setProcessingAdvance] = useState(false);
    const [advanceFormData, setAdvanceFormData] = useState({
        amount: '',
        paymentMethod: 'CASH',
    });
    const [advanceResult, setAdvanceResult] = useState(null);
    
    useEffect(() => {
        fetchStayDetail();
    }, [inpatientStayId]);
    
    const fetchStayDetail = async () => {
        try {
            setLoading(true);
            const response = await financeInpatientAPI.getInpatientStayDetail(inpatientStayId);
            if (response && response.data) {
                setStay(response.data);
            }
        } catch (err) {
            console.error('Error loading stay detail:', err);
            setError(err.message || 'Không thể tải thông tin điều trị nội trú');
        } finally {
            setLoading(false);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'status-active',
            'DISCHARGED': 'status-discharged',
            'TRANSFERRED': 'status-transferred',
        };
        return statusMap[status] || 'status-default';
    };
    
    // Handle show advance payment modal
    const handleShowAdvanceModal = () => {
        setShowAdvanceModal(true);
        setAdvanceResult(null);
    };
    
    // Handle close advance payment modal
    const handleCloseAdvanceModal = () => {
        setShowAdvanceModal(false);
        setAdvanceFormData({
            amount: '',
            paymentMethod: 'CASH',
        });
        setAdvanceResult(null);
    };
    
    // Handle advance form change
    const handleAdvanceFormChange = (e) => {
        const { name, value } = e.target;
        setAdvanceFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    // Handle process advance payment
    const handleProcessAdvance = async () => {
        // Validation
        if (!advanceFormData.amount || parseFloat(advanceFormData.amount) <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }
        
        try {
            setProcessingAdvance(true);
            
            const response = await financeTransactionAPI.advancePayment(
                stay.patientId,
                parseFloat(advanceFormData.amount),
                advanceFormData.paymentMethod
            );
            
            if (response && response.data) {
                setAdvanceResult(response.data);
                alert('Đặt cọc thành công!');
            }
        } catch (err) {
            console.error('Error processing advance payment:', err);
            alert(err.message || 'Không thể xử lý đặt cọc');
        } finally {
            setProcessingAdvance(false);
        }
    };
    
    if (loading) {
        return (
            <div className="inpatient-payment-detail-page">
                <div className="loading-state">
                    <FiActivity className="spinner" />
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="inpatient-payment-detail-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }
    
    if (!stay) {
        return (
            <div className="inpatient-payment-detail-page">
                <div className="empty-state">
                    <FiAlertCircle />
                    <p>Không tìm thấy thông tin điều trị nội trú</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="inpatient-payment-detail-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiActivity className="header-icon" />
                    <div>
                        <h1>Chi tiết Điều trị Nội trú</h1>
                        <p>Inpatient Stay ID: #{stay.inpatientStayId} | Encounter ID: #{stay.encounterId}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchStayDetail}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-advance-payment" onClick={handleShowAdvanceModal}>
                        <FiDollarSign /> Đặt cọc
                    </button>
                </div>
            </div>
            
            {/* Status Badge */}
            <div className="status-section">
                <span className={`status-badge ${getStatusBadgeClass(stay.currentStatus)}`}>
                    {stay.statusDisplay || stay.currentStatus}
                </span>
            </div>
            
            {/* Patient Information */}
            <div className="info-section">
                <h2><FiUser /> Thông tin Bệnh nhân</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Họ tên:</label>
                        <span>{stay.patientName}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã bệnh nhân:</label>
                        <span>{stay.patientCode}</span>
                    </div>
                    <div className="info-item">
                        <label>Giới tính:</label>
                        <span>{stay.patientGender === 'MALE' ? 'Nam' : stay.patientGender === 'FEMALE' ? 'Nữ' : stay.patientGender}</span>
                    </div>
                    <div className="info-item">
                        <label>Tuổi:</label>
                        <span>{stay.patientAge} tuổi</span>
                    </div>
                    <div className="info-item">
                        <label>Nhóm máu:</label>
                        <span>{stay.bloodType || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Dị ứng:</label>
                        <span>{stay.allergies || 'Không có'}</span>
                    </div>
                </div>
            </div>
            
            {/* Admission Information */}
            <div className="info-section">
                <h2><FiCalendar /> Thông tin Nhập viện</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Ngày nhập viện:</label>
                        <span>{formatDateTime(stay.admissionDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>Loại nhập viện:</label>
                        <span>{stay.admissionTypeDisplay || stay.admissionType}</span>
                    </div>
                    <div className="info-item">
                        <label>Nguồn nhập viện:</label>
                        <span>{stay.admissionSourceDisplay || stay.admissionSource || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Thời gian lưu trú:</label>
                        <span className="highlight">{stay.lengthOfStayDisplay || `${stay.lengthOfStay} ngày`}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Chẩn đoán nhập viện:</label>
                        <span>{stay.admissionDiagnosis || '-'}</span>
                    </div>
                </div>
            </div>
            
            {/* Bed Information */}
            <div className="info-section">
                <h2><FiFileText /> Thông tin Giường bệnh</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Giường:</label>
                        <span>{stay.bedDisplay || `${stay.bedNumber} - ${stay.roomNumber}`}</span>
                    </div>
                    <div className="info-item">
                        <label>Khoa:</label>
                        <span>{stay.departmentName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Bác sĩ điều trị:</label>
                        <span>{stay.attendingDoctorName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Bác sĩ nhập viện:</label>
                        <span>{stay.admittingDoctorName || '-'}</span>
                    </div>
                </div>
            </div>
            
            {/* Discharge Information (if discharged) */}
            {stay.isDischarged && (
                <div className="info-section">
                    <h2><FiFileText /> Thông tin Xuất viện</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Ngày xuất viện:</label>
                            <span>{formatDateTime(stay.dischargeDate)}</span>
                        </div>
                        <div className="info-item">
                            <label>Loại xuất viện:</label>
                            <span>{stay.dischargeTypeDisplay || stay.dischargeType || '-'}</span>
                        </div>
                        <div className="info-item full-width">
                            <label>Chẩn đoán xuất viện:</label>
                            <span>{stay.dischargeDiagnosis || '-'}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Advance Payment Modal */}
            {showAdvanceModal && (
                <AdvancePaymentModal
                    advanceFormData={advanceFormData}
                    onFormChange={handleAdvanceFormChange}
                    onProcess={handleProcessAdvance}
                    onClose={handleCloseAdvanceModal}
                    processing={processingAdvance}
                    advanceResult={advanceResult}
                    formatDateTime={formatDateTime}
                />
            )}
        </div>
    );
};

// Advance Payment Modal Component
const AdvancePaymentModal = ({ advanceFormData, onFormChange, onProcess, onClose, processing, advanceResult, formatDateTime }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Đặt cọc</h3>
                    <button className="btn-close" onClick={onClose} disabled={processing}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {!advanceResult ? (
                        <div className="advance-form">
                            <div className="form-group">
                                <label>Số tiền <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={advanceFormData.amount}
                                    onChange={onFormChange}
                                    placeholder="Nhập số tiền đặt cọc..."
                                    min="0"
                                    step="1000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phương thức thanh toán <span className="required">*</span></label>
                                <select
                                    name="paymentMethod"
                                    value={advanceFormData.paymentMethod}
                                    onChange={onFormChange}
                                    required
                                >
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                                    <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                                    <option value="E_WALLET">Ví điện tử</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="advance-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Đặt cọc thành công!</h4>
                            </div>
                            <div className="advance-details">
                                <div className="detail-row">
                                    <span className="label">Mã giao dịch:</span>
                                    <span className="value">{advanceResult.transactionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tên bệnh nhân:</span>
                                    <span className="value">{advanceResult.patientName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Loại giao dịch:</span>
                                    <span className="value">{advanceResult.transactionType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số tiền:</span>
                                    <span className="value highlight">{formatCurrency(advanceResult.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phương thức:</span>
                                    <span className="value">{advanceResult.paymentMethod}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className="value">{advanceResult.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Ngày giao dịch:</span>
                                    <span className="value">{formatDateTime(advanceResult.transactionDate)}</span>
                                </div>
                                {advanceResult.processedByEmployeeName && (
                                    <div className="detail-row">
                                        <span className="label">Người xử lý:</span>
                                        <span className="value">{advanceResult.processedByEmployeeName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={processing}>
                        {advanceResult ? 'Đóng' : 'Hủy'}
                    </button>
                    {!advanceResult && (
                        <button className="btn-confirm" onClick={onProcess} disabled={processing}>
                            {processing ? 'Đang xử lý...' : <><FiCheck /> Đặt cọc</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InpatientPaymentDetailPage;

