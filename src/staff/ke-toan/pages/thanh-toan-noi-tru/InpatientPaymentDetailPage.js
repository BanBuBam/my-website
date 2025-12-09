import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financeInpatientAPI, financeTransactionAPI, financeInvoiceAPI } from '../../../../services/staff/financeAPI';
import SettlementModal from './SettlementModal';
import TransactionHistoryModal from './TransactionHistoryModal';
import RefundHistoryModal from './RefundHistoryModal';
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
    FiCheck,
    FiList,
    FiRotateCcw
} from 'react-icons/fi';
import './InpatientPaymentDetailPage.css';

const InpatientPaymentDetailPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    const [stay, setStay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [advanceBalance, setAdvanceBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    // Advance Payment Modal State
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [processingAdvance, setProcessingAdvance] = useState(false);
    const [advanceFormData, setAdvanceFormData] = useState({
        amount: '',
        paymentMethod: 'CASH',
    });
    const [advanceResult, setAdvanceResult] = useState(null);

    // Invoice Modal State
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
        paymentMethod: 'ADVANCE',
        transactionReferenceId: '',
        notes: '',
        waiverType: '',
        waiverReason: '',
        waiverPercentage: '',
        originalAmount: '',
        waiverAmount: '',
        justification: '',
        supportingDocuments: '',
        requestedByEmployeeId: '',
        approvedByEmployeeId: '',
    });
    const [paymentResult, setPaymentResult] = useState(null);
    const [useAdvanceResult, setUseAdvanceResult] = useState(null);
    const [processingUseAdvance, setProcessingUseAdvance] = useState(false);

    // Refund Modal State
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [processingRefund, setProcessingRefund] = useState(false);
    const [refundFormData, setRefundFormData] = useState({
        originalPaymentId: '',
        amount: '',
        reason: '',
        refundMethod: 'ORIGINAL_METHOD',
        notes: '',
    });
    const [refundResult, setRefundResult] = useState(null);
    const [availableTransactions, setAvailableTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    // Settlement Modal State
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [processingSettlement, setProcessingSettlement] = useState(false);
    const [settlementResult, setSettlementResult] = useState(null);
    const [refundMethod, setRefundMethod] = useState('CASH');

    // Transaction History Modal State
    const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Refund History Modal State
    const [showRefundHistoryModal, setShowRefundHistoryModal] = useState(false);
    const [refundHistory, setRefundHistory] = useState([]);
    const [loadingRefundHistory, setLoadingRefundHistory] = useState(false);
    
    useEffect(() => {
        fetchStayDetail();
    }, [inpatientStayId]);

    const fetchStayDetail = async () => {
        try {
            setLoading(true);
            const response = await financeInpatientAPI.getInpatientStayDetail(inpatientStayId);
            if (response && response.data) {
                setStay(response.data);
                // Fetch advance balance after getting stay details
                if (response.data.patientId) {
                    fetchAdvanceBalance(response.data.patientId);
                }
            }
        } catch (err) {
            console.error('Error loading stay detail:', err);
            setError(err.message || 'Không thể tải thông tin điều trị nội trú');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdvanceBalance = async (patientId) => {
        try {
            setLoadingBalance(true);
            const response = await financeInpatientAPI.getAdvanceBalance(patientId);
            if (response && response.data !== undefined) {
                setAdvanceBalance(response.data);
            }
        } catch (err) {
            console.error('Error loading advance balance:', err);
            setAdvanceBalance(null);
        } finally {
            setLoadingBalance(false);
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
                // Refresh advance balance
                fetchAdvanceBalance(stay.patientId);
            }
        } catch (err) {
            console.error('Error processing advance payment:', err);
            alert(err.message || 'Không thể xử lý đặt cọc');
        } finally {
            setProcessingAdvance(false);
        }
    };

    // Handle view invoice
    const handleViewInvoice = async () => {
        if (!stay || !stay.encounterId) {
            alert('Không tìm thấy thông tin encounter');
            return;
        }

        try {
            setLoadingInvoice(true);
            // Get invoice by encounter ID (same as outpatient payment)
            const response = await financeInvoiceAPI.getInvoiceByEncounterId(stay.encounterId);

            if (response && response.data) {
                // Navigate to invoice detail page
                navigate(`/staff/tai-chinh/quan-ly-hoa-don/${response.data.invoiceId}`);
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
            alert(err.message || 'Không thể tải hóa đơn cho lượt điều trị này. Có thể chưa có hóa đơn được tạo.');
        } finally {
            setLoadingInvoice(false);
        }
    };

    // Invoice Modal Handlers
    const handleShowInvoiceModal = () => {
        setShowInvoiceModal(true);
        setGeneratedInvoice(null);
    };

    const handleCloseInvoiceModal = () => {
        setShowInvoiceModal(false);
        setInvoiceFormData({
            healthInsuranceId: '',
            notes: '',
            includePendingItems: true,
        });
        setGeneratedInvoice(null);
    };

    const handleInvoiceFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInvoiceFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleGenerateInvoice = async () => {
        if (!stay || !stay.encounterId) {
            alert('Không tìm thấy thông tin encounter');
            return;
        }

        try {
            setGeneratingInvoice(true);

            const requestData = {
                encounterId: parseInt(stay.encounterId),
                healthInsuranceId: invoiceFormData.healthInsuranceId ? parseInt(invoiceFormData.healthInsuranceId) : null,
                notes: invoiceFormData.notes || null,
                includePendingItems: invoiceFormData.includePendingItems,
            };

            const response = await financeInpatientAPI.generateInpatientInvoice(requestData);

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

    // Payment Modal Handlers
    const handleShowPaymentModal = async () => {
        if (!stay || !stay.encounterId) {
            alert('Không tìm thấy thông tin encounter');
            return;
        }

        // Try to fetch invoice for this encounter
        try {
            setLoadingInvoice(true);
            const response = await financeInvoiceAPI.getInvoiceByEncounterId(stay.encounterId);

            if (response && response.data) {
                // Auto-fill invoiceId
                setPaymentFormData(prev => ({
                    ...prev,
                    invoiceId: response.data.invoiceId.toString(),
                }));
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
            // Don't show error, just let user enter manually
        } finally {
            setLoadingInvoice(false);
        }

        setShowPaymentModal(true);
        setPaymentResult(null);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentFormData({
            invoiceId: '',
            amount: '',
            paymentMethod: 'ADVANCE',
            transactionReferenceId: '',
            notes: '',
            waiverType: '',
            waiverReason: '',
            waiverPercentage: '',
            originalAmount: '',
            waiverAmount: '',
            justification: '',
            supportingDocuments: '',
            requestedByEmployeeId: '',
            approvedByEmployeeId: '',
        });
        setPaymentResult(null);
    };

    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProcessPayment = async () => {
        // Validation
        if (!paymentFormData.invoiceId || !paymentFormData.amount) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (parseFloat(paymentFormData.amount) <= 0) {
            alert('Số tiền phải lớn hơn 0');
            return;
        }

        try {
            setProcessingPayment(true);

            const requestData = {
                patientId: stay.patientId,
                invoiceId: parseInt(paymentFormData.invoiceId),
                transactionType: paymentFormData.paymentMethod === 'ADVANCE' ? 'ADVANCE_USED' : 'INVOICE_PAYMENT',
                amount: parseFloat(paymentFormData.amount),
                paymentMethod: paymentFormData.paymentMethod,
            };

            // Add optional fields if they have values
            if (paymentFormData.transactionReferenceId) {
                requestData.transactionReferenceId = paymentFormData.transactionReferenceId;
            }
            if (paymentFormData.notes) {
                requestData.notes = paymentFormData.notes;
            }
            if (paymentFormData.waiverType) {
                requestData.waiverType = paymentFormData.waiverType;
            }
            if (paymentFormData.waiverReason) {
                requestData.waiverReason = paymentFormData.waiverReason;
            }
            if (paymentFormData.waiverPercentage) {
                requestData.waiverPercentage = parseFloat(paymentFormData.waiverPercentage);
            }
            if (paymentFormData.originalAmount) {
                requestData.originalAmount = parseFloat(paymentFormData.originalAmount);
            }
            if (paymentFormData.waiverAmount) {
                requestData.waiverAmount = parseFloat(paymentFormData.waiverAmount);
            }
            if (paymentFormData.justification) {
                requestData.justification = paymentFormData.justification;
            }
            if (paymentFormData.supportingDocuments) {
                requestData.supportingDocuments = paymentFormData.supportingDocuments;
            }
            if (paymentFormData.requestedByEmployeeId) {
                requestData.requestedByEmployeeId = parseInt(paymentFormData.requestedByEmployeeId);
            }
            if (paymentFormData.approvedByEmployeeId) {
                requestData.approvedByEmployeeId = parseInt(paymentFormData.approvedByEmployeeId);
            }

            const response = await financeInpatientAPI.processInpatientPayment(requestData);

            if (response && response.data) {
                setPaymentResult(response.data);
                alert('Thanh toán thành công!');
                // Refresh advance balance if using advance payment
                if (paymentFormData.paymentMethod === 'ADVANCE') {
                    fetchAdvanceBalance(stay.patientId);
                }
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            alert(err.message || 'Không thể xử lý thanh toán');
        } finally {
            setProcessingPayment(false);
        }
    };

    // Handle use advance deposit
    const handleUseAdvanceDeposit = async () => {
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
            setProcessingUseAdvance(true);

            const response = await financeTransactionAPI.useAdvanceDeposit(
                stay.patientId,
                parseInt(paymentFormData.invoiceId),
                parseFloat(paymentFormData.amount)
            );

            if (response && response.data) {
                setUseAdvanceResult(response.data);
                alert('Sử dụng tiền tạm ứng thành công!');
                // Refresh advance balance
                fetchAdvanceBalance(stay.patientId);
            }
        } catch (err) {
            console.error('Error using advance deposit:', err);
            alert(err.message || 'Không thể sử dụng tiền tạm ứng');
        } finally {
            setProcessingUseAdvance(false);
        }
    };

    // Refund Modal Handlers
    const handleShowRefundModal = async () => {
        setShowRefundModal(true);
        setRefundResult(null);
        
        // Fetch available transactions for refund
        try {
            setLoadingTransactions(true);
            const response = await financeInpatientAPI.getTransactionsByStayId(inpatientStayId);
            if (response && response.data) {
                // Filter only completed payment transactions
                const paymentTransactions = response.data.filter(t => 
                    (t.transactionType === 'INVOICE_PAYMENT' || t.transactionType === 'ADVANCE_PAYMENT') && 
                    t.status === 'COMPLETED'
                );
                setAvailableTransactions(paymentTransactions);
            }
        } catch (err) {
            console.error('Error loading transactions:', err);
            setAvailableTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleCloseRefundModal = () => {
        setShowRefundModal(false);
        setRefundFormData({
            originalPaymentId: '',
            amount: '',
            reason: '',
            refundMethod: 'ORIGINAL_METHOD',
            notes: '',
        });
        setRefundResult(null);
    };

    const handleRefundFormChange = (e) => {
        const { name, value } = e.target;
        setRefundFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProcessRefund = async () => {
        // Validation
        if (!refundFormData.originalPaymentId || !refundFormData.amount || !refundFormData.reason) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (parseFloat(refundFormData.amount) <= 0) {
            alert('Số tiền phải lớn hơn 0');
            return;
        }

        try {
            setProcessingRefund(true);

            const requestData = {
                originalPaymentId: parseInt(refundFormData.originalPaymentId),
                amount: parseFloat(refundFormData.amount),
                reason: refundFormData.reason,
                refundMethod: refundFormData.refundMethod,
                notes: refundFormData.notes || null,
            };

            const response = await financeInpatientAPI.processRefund(requestData);

            if (response && response.data) {
                setRefundResult(response.data);
                alert('Hoàn tiền thành công!');
            }
        } catch (err) {
            console.error('Error processing refund:', err);
            alert(err.message || 'Không thể xử lý hoàn tiền');
        } finally {
            setProcessingRefund(false);
        }
    };

    // Settlement Handlers
    const handleShowSettlementModal = async () => {
        if (!stay || !stay.encounterId) {
            alert('Không tìm thấy thông tin encounter');
            return;
        }

        // Try to fetch invoice for this encounter
        try {
            const response = await financeInvoiceAPI.getInvoiceByEncounterId(stay.encounterId);
            if (response && response.data) {
                setShowSettlementModal(true);
                setSettlementResult(null);
            } else {
                alert('Chưa có hóa đơn cho lượt điều trị này. Vui lòng tạo hóa đơn trước khi quyết toán.');
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
            alert('Chưa có hóa đơn cho lượt điều trị này. Vui lòng tạo hóa đơn trước khi quyết toán.');
        }
    };

    const handleCloseSettlementModal = () => {
        setShowSettlementModal(false);
        setSettlementResult(null);
        setRefundMethod('CASH');
    };

    const handleProcessSettlement = async () => {
        if (!stay || !stay.patientId) {
            alert('Không tìm thấy thông tin bệnh nhân');
            return;
        }

        try {
            setProcessingSettlement(true);

            // Get invoice ID
            const invoiceResponse = await financeInvoiceAPI.getInvoiceByEncounterId(stay.encounterId);
            if (!invoiceResponse || !invoiceResponse.data) {
                alert('Không tìm thấy hóa đơn');
                return;
            }

            const invoiceId = invoiceResponse.data.invoiceId;

            const response = await financeInpatientAPI.settleDeposit(
                stay.patientId,
                invoiceId,
                refundMethod
            );

            if (response && response.data) {
                setSettlementResult(response.data);
                alert('Quyết toán thành công!');
                // Refresh advance balance
                fetchAdvanceBalance(stay.patientId);
            }
        } catch (err) {
            console.error('Error processing settlement:', err);
            alert(err.message || 'Không thể xử lý quyết toán');
        } finally {
            setProcessingSettlement(false);
        }
    };

    // Transaction History Handlers
    const handleShowTransactionHistory = async () => {
        setShowTransactionHistoryModal(true);
        setLoadingHistory(true);
        
        try {
            const response = await financeInpatientAPI.getTransactionsByStayId(inpatientStayId);
            if (response && response.data) {
                setTransactionHistory(response.data);
            }
        } catch (err) {
            console.error('Error loading transaction history:', err);
            setTransactionHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCloseTransactionHistory = () => {
        setShowTransactionHistoryModal(false);
    };

    // Refund History Handlers
    const handleShowRefundHistory = async () => {
        if (!stay || !stay.encounterId) {
            alert('Không tìm thấy thông tin encounter');
            return;
        }

        setShowRefundHistoryModal(true);
        setLoadingRefundHistory(true);
        
        try {
            // Get invoice ID first
            const invoiceResponse = await financeInvoiceAPI.getInvoiceByEncounterId(stay.encounterId);
            if (!invoiceResponse || !invoiceResponse.data) {
                setRefundHistory([]);
                return;
            }

            const invoiceId = invoiceResponse.data.invoiceId;
            const response = await financeInvoiceAPI.getRefundsByInvoiceId(invoiceId);
            if (response && response.data) {
                setRefundHistory(response.data);
            }
        } catch (err) {
            console.error('Error loading refund history:', err);
            setRefundHistory([]);
        } finally {
            setLoadingRefundHistory(false);
        }
    };

    const handleCloseRefundHistory = () => {
        setShowRefundHistoryModal(false);
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
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="action-buttons-row">
                <button className="btn-view-invoice" onClick={handleViewInvoice} disabled={loadingInvoice}>
                    <FiFileText /> {loadingInvoice ? 'Đang tải...' : 'Xem hóa đơn'}
                </button>
                <button className="btn-advance-payment" onClick={handleShowAdvanceModal}>
                    <FiDollarSign /> Đặt cọc
                </button>
                <button className="btn-create-invoice" onClick={handleShowInvoiceModal}>
                    <FiFileText /> Tạo hóa đơn
                </button>
                <button className="btn-payment" onClick={handleShowPaymentModal}>
                    <FiDollarSign /> Thanh toán
                </button>
                <button className="btn-refund" onClick={handleShowRefundModal}>
                    <FiRotateCcw /> Hoàn tiền
                </button>
                <button className="btn-settlement" onClick={handleShowSettlementModal}>
                    <FiCheck /> Quyết toán
                </button>
                <button className="btn-transaction-history" onClick={handleShowTransactionHistory}>
                    <FiList /> Lịch sử giao dịch
                </button>
                <button className="btn-refund-history" onClick={handleShowRefundHistory}>
                    <FiRotateCcw /> Lịch sử hoàn tiền
                </button>
            </div>

            {/* Status and Balance Section */}
            <div className="status-balance-section">
                <span className={`status-badge ${getStatusBadgeClass(stay.currentStatus)}`}>
                    {stay.statusDisplay || stay.currentStatus}
                </span>
                <div className="balance-info">
                    <label>Số dư tạm ứng:</label>
                    {loadingBalance ? (
                        <span className="balance-loading">Đang tải...</span>
                    ) : (
                        <span className="balance-amount">
                            {advanceBalance !== null ? `${advanceBalance.toLocaleString('vi-VN')} VNĐ` : 'Chưa có dữ liệu'}
                        </span>
                    )}
                </div>
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
                    formatDateTime={formatDateTime}
                    onUseAdvance={handleUseAdvanceDeposit}
                    processingUseAdvance={processingUseAdvance}
                    useAdvanceResult={useAdvanceResult}
                />
            )}

            {/* Refund Modal */}
            {showRefundModal && (
                <RefundModal
                    refundFormData={refundFormData}
                    onFormChange={handleRefundFormChange}
                    onProcess={handleProcessRefund}
                    onClose={handleCloseRefundModal}
                    processing={processingRefund}
                    refundResult={refundResult}
                    formatCurrency={formatCurrency}
                    formatDateTime={formatDateTime}
                    availableTransactions={availableTransactions}
                    loadingTransactions={loadingTransactions}
                />
            )}

            {/* Settlement Modal */}
            <SettlementModal
                isOpen={showSettlementModal}
                onClose={handleCloseSettlementModal}
                onSettle={handleProcessSettlement}
                processing={processingSettlement}
                settlementData={{
                    patientName: stay.patientName,
                    patientCode: stay.patientCode,
                    invoiceId: null, // Will be fetched in handler
                }}
                settlementResult={settlementResult}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
            />

            {/* Transaction History Modal */}
            <TransactionHistoryModal
                isOpen={showTransactionHistoryModal}
                onClose={handleCloseTransactionHistory}
                transactions={transactionHistory}
                loading={loadingHistory}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
            />

            {/* Refund History Modal */}
            <RefundHistoryModal
                isOpen={showRefundHistoryModal}
                onClose={handleCloseRefundHistory}
                refunds={refundHistory}
                loading={loadingRefundHistory}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
            />
        </div>
    );
};

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Invoice Modal Component
const InvoiceModal = ({ invoiceFormData, onFormChange, onGenerate, onClose, generating, generatedInvoice, formatCurrency }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Tạo hóa đơn nội trú</h3>
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
const PaymentModal = ({ 
    paymentFormData, 
    onFormChange, 
    onProcess, 
    onClose, 
    processing, 
    paymentResult, 
    formatCurrency, 
    formatDateTime,
    onUseAdvance,
    processingUseAdvance,
    useAdvanceResult
}) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Thanh toán hóa đơn</h3>
                    <button className="btn-close" onClick={onClose} disabled={processing || processingUseAdvance}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {!paymentResult && !useAdvanceResult ? (
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
                                    <option value="ADVANCE">Tạm ứng</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                                    <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                                    <option value="E_WALLET">Ví điện tử</option>
                                </select>
                            </div>
                        </div>
                    ) : useAdvanceResult ? (
                        <div className="payment-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Sử dụng tiền tạm ứng thành công!</h4>
                            </div>
                            <div className="payment-details">
                                <div className="detail-row">
                                    <span className="label">Mã giao dịch:</span>
                                    <span className="value">{useAdvanceResult.transactionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số biên lai:</span>
                                    <span className="value">{useAdvanceResult.receiptNumber || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Bệnh nhân:</span>
                                    <span className="value">{useAdvanceResult.patientName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Loại giao dịch:</span>
                                    <span className="value">{useAdvanceResult.transactionType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số tiền:</span>
                                    <span className="value highlight">{formatCurrency(useAdvanceResult.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className="value">{useAdvanceResult.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Ngày giao dịch:</span>
                                    <span className="value">{formatDateTime(useAdvanceResult.transactionDate)}</span>
                                </div>
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
                                    <span className="label">Mã giao dịch:</span>
                                    <span className="value">{paymentResult.transactionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số biên lai:</span>
                                    <span className="value">{paymentResult.receiptNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tên bệnh nhân:</span>
                                    <span className="value">{paymentResult.patientName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số hóa đơn:</span>
                                    <span className="value">{paymentResult.invoiceNumber}</span>
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
                                <div className="detail-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className="value">{paymentResult.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Ngày giao dịch:</span>
                                    <span className="value">{formatDateTime(paymentResult.transactionDate)}</span>
                                </div>
                                {paymentResult.processedByEmployeeName && (
                                    <div className="detail-row">
                                        <span className="label">Người xử lý:</span>
                                        <span className="value">{paymentResult.processedByEmployeeName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={processing || processingUseAdvance}>
                        {(paymentResult || useAdvanceResult) ? 'Đóng' : 'Hủy'}
                    </button>
                    {!paymentResult && !useAdvanceResult && (
                        <>
                            <button 
                                className="btn-use-advance" 
                                onClick={onUseAdvance} 
                                disabled={processing || processingUseAdvance}
                            >
                                {processingUseAdvance ? 'Đang xử lý...' : <><FiDollarSign /> Dùng tiền tạm ứng</>}
                            </button>
                            <button 
                                className="btn-confirm" 
                                onClick={onProcess} 
                                disabled={processing || processingUseAdvance}
                            >
                                {processing ? 'Đang xử lý...' : <><FiCheck /> Thanh toán</>}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Refund Modal Component
const RefundModal = ({ 
    refundFormData, 
    onFormChange, 
    onProcess, 
    onClose, 
    processing, 
    refundResult, 
    formatCurrency, 
    formatDateTime,
    availableTransactions,
    loadingTransactions
}) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Hoàn tiền</h3>
                    <button className="btn-close" onClick={onClose} disabled={processing}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {!refundResult ? (
                        <div className="refund-form">
                            <div className="form-group">
                                <label>Giao dịch gốc <span className="required">*</span></label>
                                {loadingTransactions ? (
                                    <div className="loading-select">Đang tải danh sách giao dịch...</div>
                                ) : (
                                    <select
                                        name="originalPaymentId"
                                        value={refundFormData.originalPaymentId}
                                        onChange={onFormChange}
                                        required
                                    >
                                        <option value="">-- Chọn giao dịch --</option>
                                        {availableTransactions.map(t => (
                                            <option key={t.transactionId} value={t.transactionId}>
                                                ID: {t.transactionId} - {t.transactionType} - {formatCurrency(t.amount)} - {formatDateTime(t.transactionDate)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Số tiền hoàn <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={refundFormData.amount}
                                    onChange={onFormChange}
                                    placeholder="Nhập số tiền hoàn..."
                                    min="0"
                                    step="1000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Lý do hoàn tiền <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="reason"
                                    value={refundFormData.reason}
                                    onChange={onFormChange}
                                    placeholder="Nhập lý do hoàn tiền..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phương thức hoàn tiền <span className="required">*</span></label>
                                <select
                                    name="refundMethod"
                                    value={refundFormData.refundMethod}
                                    onChange={onFormChange}
                                    required
                                >
                                    <option value="ORIGINAL_METHOD">Phương thức gốc</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    name="notes"
                                    value={refundFormData.notes}
                                    onChange={onFormChange}
                                    placeholder="Nhập ghi chú..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="refund-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Hoàn tiền thành công!</h4>
                            </div>
                            <div className="refund-details">
                                <div className="detail-row">
                                    <span className="label">Mã giao dịch:</span>
                                    <span className="value">{refundResult.transactionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số biên lai:</span>
                                    <span className="value">{refundResult.receiptNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tên bệnh nhân:</span>
                                    <span className="value">{refundResult.patientName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Loại giao dịch:</span>
                                    <span className="value">{refundResult.transactionType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số tiền hoàn:</span>
                                    <span className="value highlight">{formatCurrency(refundResult.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phương thức:</span>
                                    <span className="value">{refundResult.paymentMethod}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className="value">{refundResult.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Ngày giao dịch:</span>
                                    <span className="value">{formatDateTime(refundResult.transactionDate)}</span>
                                </div>
                                {refundResult.processedByEmployeeName && (
                                    <div className="detail-row">
                                        <span className="label">Người xử lý:</span>
                                        <span className="value">{refundResult.processedByEmployeeName}</span>
                                    </div>
                                )}
                                {refundResult.notes && (
                                    <div className="detail-row">
                                        <span className="label">Ghi chú:</span>
                                        <span className="value">{refundResult.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={processing}>
                        {refundResult ? 'Đóng' : 'Hủy'}
                    </button>
                    {!refundResult && (
                        <button className="btn-confirm" onClick={onProcess} disabled={processing}>
                            {processing ? 'Đang xử lý...' : <><FiCheck /> Hoàn tiền</>}
                        </button>
                    )}
                </div>
            </div>
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

