import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EncounterDetailPage.css';
import {
    FiArrowLeft,
    FiUser,
    FiCalendar,
    FiActivity,
    FiMapPin,
    FiFileText,
    FiRefreshCw,
    FiDollarSign,
    FiX,
    FiCheck
} from 'react-icons/fi';
import { financeEncounterAPI, financeInvoiceGenerationAPI, financeTransactionAPI } from '../../../../services/staff/financeAPI';

const EncounterDetailPage = () => {
    const navigate = useNavigate();
    const { encounterId } = useParams();
    
    // State
    const [encounter, setEncounter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const [invoiceFormData, setInvoiceFormData] = useState({
        healthInsuranceId: '',
        notes: '',
        includePendingItems: true,
    });
    const [generatedInvoice, setGeneratedInvoice] = useState(null);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState({
        invoiceId: '',
        amount: '',
        paymentMethod: 'CASH',
    });
    const [paymentResult, setPaymentResult] = useState(null);

    // Advance Payment Modal State
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [processingAdvance, setProcessingAdvance] = useState(false);
    const [advanceFormData, setAdvanceFormData] = useState({
        amount: '',
        paymentMethod: 'CASH',
    });
    const [advanceResult, setAdvanceResult] = useState(null);
    
    // Fetch encounter detail
    const fetchEncounterDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await financeEncounterAPI.getEncounterDetail(encounterId);
            
            if (response && response.data) {
                setEncounter(response.data);
            }
        } catch (err) {
            console.error('Error fetching encounter detail:', err);
            setError(err.message || 'Không thể tải thông tin lượt khám');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (encounterId) {
            fetchEncounterDetail();
        }
    }, [encounterId]);
    
    // Handle back
    const handleBack = () => {
        navigate('/staff/tai-chinh/thanh-toan-ngoai-tru');
    };
    
    // Handle show invoice modal
    const handleShowInvoiceModal = () => {
        setShowInvoiceModal(true);
        setGeneratedInvoice(null);
    };
    
    // Handle close invoice modal
    const handleCloseInvoiceModal = () => {
        setShowInvoiceModal(false);
        setInvoiceFormData({
            healthInsuranceId: '',
            notes: '',
            includePendingItems: true,
        });
        setGeneratedInvoice(null);
    };
    
    // Handle invoice form change
    const handleInvoiceFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInvoiceFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    // Handle generate invoice
    const handleGenerateInvoice = async () => {
        try {
            setGeneratingInvoice(true);

            const requestData = {
                encounterId: parseInt(encounterId),
                healthInsuranceId: invoiceFormData.healthInsuranceId ? parseInt(invoiceFormData.healthInsuranceId) : null,
                notes: invoiceFormData.notes || null,
                includePendingItems: invoiceFormData.includePendingItems,
            };

            const response = await financeInvoiceGenerationAPI.generateInvoice(requestData);

            if (response && response.data) {
                setGeneratedInvoice(response.data);
                alert('Tạo hóa đơn thành công!');
            }
        } catch (err) {
            console.error('Error generating invoice:', err);
            alert(err.message || 'Không thể tạo hóa đơn');
        } finally {
            setGeneratingInvoice(false);
        }
    };

    // Handle show payment modal
    const handleShowPaymentModal = () => {
        setShowPaymentModal(true);
        setPaymentResult(null);
    };

    // Handle close payment modal
    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentFormData({
            invoiceId: '',
            amount: '',
            paymentMethod: 'CASH',
        });
        setPaymentResult(null);
    };

    // Handle payment form change
    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle process payment
    const handleProcessPayment = async () => {
        // Validation
        if (!paymentFormData.invoiceId) {
            alert('Vui lòng nhập Invoice ID');
            return;
        }
        if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        try {
            setProcessingPayment(true);

            const requestData = {
                patient_id: encounter.patientId,
                invoice_id: parseInt(paymentFormData.invoiceId),
                transaction_type: 'INVOICE_PAYMENT',
                amount: parseFloat(paymentFormData.amount),
                payment_method: paymentFormData.paymentMethod,
            };

            const response = await financeTransactionAPI.processPayment(requestData);

            if (response) {
                setPaymentResult(response);
                alert('Thanh toán thành công!');
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            alert(err.message || 'Không thể xử lý thanh toán');
        } finally {
            setProcessingPayment(false);
        }
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
                encounter.patientId,
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
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };
    
    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'PLANNED': { label: 'Đã lên lịch', className: 'status-planned' },
            'ARRIVED': { label: 'Đã đến', className: 'status-arrived' },
            'IN_PROGRESS': { label: 'Đang khám', className: 'status-in-progress' },
            'FINISHED': { label: 'Hoàn thành', className: 'status-finished' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
        };
        
        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };
    
    if (loading) {
        return (
            <div className="encounter-detail-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải thông tin lượt khám...</p>
                </div>
            </div>
        );
    }
    
    if (error || !encounter) {
        return (
            <div className="encounter-detail-page">
                <div className="error-container">
                    <p>{error || 'Không tìm thấy thông tin lượt khám'}</p>
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="encounter-detail-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Chi tiết lượt khám</h1>
                    <p>Encounter ID: {encounter.encounterId}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchEncounterDetail}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-advance-payment" onClick={handleShowAdvanceModal}>
                        <FiDollarSign /> Đặt cọc
                    </button>
                    <button className="btn-payment" onClick={handleShowPaymentModal}>
                        <FiDollarSign /> Thanh toán
                    </button>
                    <button className="btn-create-invoice" onClick={handleShowInvoiceModal}>
                        <FiDollarSign /> Tạo hóa đơn
                    </button>
                </div>
            </div>
            
            {/* Encounter Info */}
            <div className="encounter-info-section">
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Thông tin bệnh nhân</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Mã bệnh nhân:</span>
                            <span className="value">{encounter.patientCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Tên bệnh nhân:</span>
                            <span className="value">{encounter.patientName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">ID bệnh nhân:</span>
                            <span className="value">{encounter.patientId}</span>
                        </div>
                    </div>
                </div>
                
                <div className="info-card">
                    <div className="card-header">
                        <FiActivity />
                        <h3>Thông tin lượt khám</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Loại lượt khám:</span>
                            <span className="value">{encounter.encounterType || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Trạng thái:</span>
                            <span className="value">{getStatusBadge(encounter.status)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Loại khám:</span>
                            <span className="value">{encounter.visitType || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Kết quả:</span>
                            <span className="value">{encounter.disposition || '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="info-card">
                    <div className="card-header">
                        <FiMapPin />
                        <h3>Thông tin khoa/phòng</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Khoa:</span>
                            <span className="value">{encounter.departmentName || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">ID Khoa:</span>
                            <span className="value">{encounter.departmentId || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Vị trí:</span>
                            <span className="value">{encounter.location || '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="info-card">
                    <div className="card-header">
                        <FiCalendar />
                        <h3>Thời gian</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Ngày bắt đầu:</span>
                            <span className="value">{formatDate(encounter.startDatetime)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Ngày kết thúc:</span>
                            <span className="value">{formatDate(encounter.endDatetime)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Ngày tạo:</span>
                            <span className="value">{formatDate(encounter.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cập nhật lần cuối:</span>
                            <span className="value">{formatDate(encounter.updatedAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="info-card">
                    <div className="card-header">
                        <FiFileText />
                        <h3>Thông tin khác</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Booking ID:</span>
                            <span className="value">{encounter.bookingId || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Người tạo:</span>
                            <span className="value">{encounter.createdByEmployeeName || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Mô tả trạng thái:</span>
                            <span className="value">{encounter.statusDescription || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Invoice Modal */}
            {showInvoiceModal && (
                <InvoiceModal
                    invoiceFormData={invoiceFormData}
                    onFormChange={handleInvoiceFormChange}
                    onGenerate={handleGenerateInvoice}
                    onClose={handleCloseInvoiceModal}
                    generating={generatingInvoice}
                    generatedInvoice={generatedInvoice}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    paymentFormData={paymentFormData}
                    onFormChange={handlePaymentFormChange}
                    onProcess={handleProcessPayment}
                    onClose={handleClosePaymentModal}
                    processing={processingPayment}
                    paymentResult={paymentResult}
                    formatCurrency={formatCurrency}
                />
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
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
};

// Invoice Modal Component
const InvoiceModal = ({ invoiceFormData, onFormChange, onGenerate, onClose, generating, generatedInvoice, formatCurrency }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Tạo hóa đơn</h3>
                    <button className="btn-close" onClick={onClose} disabled={generating}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {!generatedInvoice ? (
                        <div className="invoice-form">
                            <div className="form-group">
                                <label>ID Bảo hiểm y tế</label>
                                <input
                                    type="number"
                                    name="healthInsuranceId"
                                    value={invoiceFormData.healthInsuranceId}
                                    onChange={onFormChange}
                                    placeholder="Nhập ID bảo hiểm (nếu có)..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    name="notes"
                                    value={invoiceFormData.notes}
                                    onChange={onFormChange}
                                    placeholder="Nhập ghi chú..."
                                    rows="3"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="includePendingItems"
                                        checked={invoiceFormData.includePendingItems}
                                        onChange={onFormChange}
                                    />
                                    <span>Bao gồm các mục đang chờ xử lý</span>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="invoice-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Tạo hóa đơn thành công!</h4>
                            </div>
                            <div className="invoice-details">
                                <div className="detail-row">
                                    <span className="label">Số hóa đơn:</span>
                                    <span className="value">{generatedInvoice.invoiceNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tên bệnh nhân:</span>
                                    <span className="value">{generatedInvoice.patientName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tổng số mục:</span>
                                    <span className="value">{generatedInvoice.totalItemsCount}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tổng tiền:</span>
                                    <span className="value highlight">{formatCurrency(generatedInvoice.totalAmount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Bảo hiểm chi trả:</span>
                                    <span className="value">{formatCurrency(generatedInvoice.insuranceCoveredAmount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Bệnh nhân thanh toán:</span>
                                    <span className="value highlight">{formatCurrency(generatedInvoice.patientResponsibleAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={generating}>
                        {generatedInvoice ? 'Đóng' : 'Hủy'}
                    </button>
                    {!generatedInvoice && (
                        <button className="btn-confirm" onClick={onGenerate} disabled={generating}>
                            {generating ? 'Đang tạo...' : <><FiCheck /> Tạo hóa đơn</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Payment Modal Component
const PaymentModal = ({ paymentFormData, onFormChange, onProcess, onClose, processing, paymentResult, formatCurrency }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Thanh toán hóa đơn</h3>
                    <button className="btn-close" onClick={onClose} disabled={processing}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {!paymentResult ? (
                        <div className="payment-form">
                            <div className="form-group">
                                <label>Invoice ID <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="invoiceId"
                                    value={paymentFormData.invoiceId}
                                    onChange={onFormChange}
                                    placeholder="Nhập Invoice ID..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số tiền <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={paymentFormData.amount}
                                    onChange={onFormChange}
                                    placeholder="Nhập số tiền..."
                                    min="0"
                                    step="1000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phương thức thanh toán <span className="required">*</span></label>
                                <select
                                    name="paymentMethod"
                                    value={paymentFormData.paymentMethod}
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
                        <div className="payment-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Thanh toán thành công!</h4>
                            </div>
                            <div className="payment-details">
                                <div className="detail-row">
                                    <span className="label">Patient ID:</span>
                                    <span className="value">{paymentResult.patientId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Invoice ID:</span>
                                    <span className="value">{paymentResult.invoiceId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Loại giao dịch:</span>
                                    <span className="value">{paymentResult.transactionType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số tiền:</span>
                                    <span className="value highlight">{formatCurrency(paymentResult.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phương thức:</span>
                                    <span className="value">{paymentResult.paymentMethod}</span>
                                </div>
                                {paymentResult.transactionReferenceId && (
                                    <div className="detail-row">
                                        <span className="label">Mã tham chiếu:</span>
                                        <span className="value">{paymentResult.transactionReferenceId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={processing}>
                        {paymentResult ? 'Đóng' : 'Hủy'}
                    </button>
                    {!paymentResult && (
                        <button className="btn-confirm" onClick={onProcess} disabled={processing}>
                            {processing ? 'Đang xử lý...' : <><FiCheck /> Thanh toán</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Advance Payment Modal Component
const AdvancePaymentModal = ({ advanceFormData, onFormChange, onProcess, onClose, processing, advanceResult, formatCurrency, formatDate }) => {
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
                                    <span className="value">{formatDate(advanceResult.transactionDate)}</span>
                                </div>
                                {advanceResult.processedByEmployeeName && (
                                    <div className="detail-row">
                                        <span className="label">Người xử lý:</span>
                                        <span className="value">{advanceResult.processedByEmployeeName}</span>
                                    </div>
                                )}
                                {advanceResult.transactionReferenceId && (
                                    <div className="detail-row">
                                        <span className="label">Mã tham chiếu:</span>
                                        <span className="value">{advanceResult.transactionReferenceId}</span>
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

export default EncounterDetailPage;

