import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financeInvoiceAPI, financeTransactionAPI, financeInpatientAPI } from '../../../../services/staff/financeAPI';
import { FiArrowLeft, FiRefreshCw, FiDollarSign, FiFileText, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './OutpatientRefundListPage.css';

const OutpatientRefundListPage = () => {
    const { encounterId } = useParams();
    const navigate = useNavigate();
    
    // State
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceId, setInvoiceId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    
    // Modal state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [processingRefund, setProcessingRefund] = useState(false);
    const [refundFormData, setRefundFormData] = useState({
        originalPaymentId: '',
        amount: '',
        reason: '',
        refundMethod: 'CASH',
        notes: '',
    });
    const [refundResult, setRefundResult] = useState(null);
    
    // Fetch invoice by encounter ID
    const fetchInvoiceByEncounter = async () => {
        try {
            const response = await financeInvoiceAPI.getInvoiceByEncounterId(encounterId);
            if (response && response.data) {
                setInvoiceId(response.data.invoiceId);
                return response.data.invoiceId;
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
            throw err;
        }
    };
    
    // Fetch refunds
    const fetchRefunds = async (invId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await financeInvoiceAPI.getRefundsByInvoiceId(invId);
            
            if (response && response.data) {
                setRefunds(response.data);
            }
        } catch (err) {
            console.error('Error fetching refunds:', err);
            setError(err.message || 'Không thể tải danh sách hoàn tiền');
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch transactions
    const fetchTransactions = async (invId) => {
        try {
            const response = await financeInvoiceAPI.getTransactionsByInvoiceId(invId);
            
            if (response && response.data) {
                setTransactions(response.data);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    };
    
    // Initial load
    useEffect(() => {
        const loadData = async () => {
            try {
                const invId = await fetchInvoiceByEncounter();
                await Promise.all([
                    fetchRefunds(invId),
                    fetchTransactions(invId)
                ]);
            } catch (err) {
                setError(err.message || 'Không thể tải dữ liệu');
                setLoading(false);
            }
        };
        
        if (encounterId) {
            loadData();
        }
    }, [encounterId]);
    
    // Handle back
    const handleBack = () => {
        navigate(`/staff/tai-chinh/thanh-toan-ngoai-tru/${encounterId}`);
    };
    
    // Handle refresh
    const handleRefresh = async () => {
        if (invoiceId) {
            await Promise.all([
                fetchRefunds(invoiceId),
                fetchTransactions(invoiceId)
            ]);
        }
    };
    
    // Handle show refund modal
    const handleShowRefundModal = () => {
        // Auto-select first payment transaction if available
        const paymentTransaction = transactions.find(t => 
            t.transactionType === 'INVOICE_PAYMENT' && t.status === 'COMPLETED'
        );
        
        setRefundFormData({
            originalPaymentId: paymentTransaction ? paymentTransaction.transactionId.toString() : '',
            amount: '',
            reason: '',
            refundMethod: 'CASH',
            notes: '',
        });
        setShowRefundModal(true);
        setRefundResult(null);
    };
    
    // Handle close refund modal
    const handleCloseRefundModal = () => {
        setShowRefundModal(false);
        setRefundFormData({
            originalPaymentId: '',
            amount: '',
            reason: '',
            refundMethod: 'CASH',
            notes: '',
        });
        setRefundResult(null);
    };
    
    // Handle refund form change
    const handleRefundFormChange = (e) => {
        const { name, value } = e.target;
        setRefundFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    // Handle process refund
    const handleProcessRefund = async () => {
        // Validation
        if (!refundFormData.originalPaymentId) {
            alert('Vui lòng chọn giao dịch thanh toán gốc');
            return;
        }
        if (!refundFormData.amount || parseFloat(refundFormData.amount) <= 0) {
            alert('Vui lòng nhập số tiền hoàn trả hợp lệ');
            return;
        }
        if (!refundFormData.reason) {
            alert('Vui lòng nhập lý do hoàn tiền');
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
                // Refresh data
                await handleRefresh();
            }
        } catch (err) {
            console.error('Error processing refund:', err);
            alert(err.message || 'Không thể xử lý hoàn tiền');
        } finally {
            setProcessingRefund(false);
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
            'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' },
            'PENDING': { label: 'Đang xử lý', className: 'status-pending' },
            'FAILED': { label: 'Thất bại', className: 'status-failed' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
        };
        
        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };
    
    if (loading) {
        return (
            <div className="outpatient-refund-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải danh sách hoàn tiền...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="outpatient-refund-page">
                <div className="error-container">
                    <FiAlertCircle className="error-icon" />
                    <p>{error}</p>
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="outpatient-refund-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Danh sách hoàn tiền</h1>
                    <p>Encounter ID: {encounterId} | Invoice ID: {invoiceId}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={handleRefresh}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-create-refund" onClick={handleShowRefundModal}>
                        <FiDollarSign /> Hoàn tiền
                    </button>
                </div>
            </div>
            
            {/* Refunds List */}
            <div className="refunds-section">
                <div className="section-header">
                    <h2>Danh sách hoàn tiền</h2>
                    <span className="count-badge">{refunds.length} giao dịch</span>
                </div>
                
                {refunds.length === 0 ? (
                    <div className="empty-state">
                        <FiFileText className="empty-icon" />
                        <p>Chưa có giao dịch hoàn tiền nào</p>
                    </div>
                ) : (
                    <div className="refunds-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã giao dịch</th>
                                    <th>Số biên lai</th>
                                    <th>Bệnh nhân</th>
                                    <th>Số tiền</th>
                                    <th>Phương thức</th>
                                    <th>Ngày hoàn tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Người xử lý</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refunds.map((refund) => (
                                    <tr key={refund.transactionId}>
                                        <td>{refund.transactionId}</td>
                                        <td>{refund.receiptNumber || '-'}</td>
                                        <td>
                                            <div className="patient-info">
                                                <span className="patient-name">{refund.patientName}</span>
                                                <span className="patient-id">ID: {refund.patientId}</span>
                                            </div>
                                        </td>
                                        <td className="amount">{formatCurrency(refund.amount)}</td>
                                        <td>{refund.paymentMethod || '-'}</td>
                                        <td>{formatDate(refund.transactionDate)}</td>
                                        <td>{getStatusBadge(refund.status)}</td>
                                        <td>{refund.processedByEmployeeName || '-'}</td>
                                        <td className="notes">{refund.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Available Transactions for Refund */}
            <div className="transactions-section">
                <div className="section-header">
                    <h2>Giao dịch thanh toán có thể hoàn tiền</h2>
                    <span className="count-badge">
                        {transactions.filter(t => t.transactionType === 'INVOICE_PAYMENT').length} giao dịch
                    </span>
                </div>
                
                {transactions.filter(t => t.transactionType === 'INVOICE_PAYMENT').length === 0 ? (
                    <div className="empty-state">
                        <FiFileText className="empty-icon" />
                        <p>Không có giao dịch thanh toán nào</p>
                    </div>
                ) : (
                    <div className="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã giao dịch</th>
                                    <th>Số biên lai</th>
                                    <th>Loại giao dịch</th>
                                    <th>Số tiền</th>
                                    <th>Phương thức</th>
                                    <th>Ngày giao dịch</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions
                                    .filter(t => t.transactionType === 'INVOICE_PAYMENT')
                                    .map((transaction) => (
                                        <tr key={transaction.transactionId}>
                                            <td>{transaction.transactionId}</td>
                                            <td>{transaction.receiptNumber || '-'}</td>
                                            <td>{transaction.transactionType}</td>
                                            <td className="amount">{formatCurrency(transaction.amount)}</td>
                                            <td>{transaction.paymentMethod || '-'}</td>
                                            <td>{formatDate(transaction.transactionDate)}</td>
                                            <td>{getStatusBadge(transaction.status)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Refund Modal */}
            {showRefundModal && (
                <RefundModal
                    refundFormData={refundFormData}
                    transactions={transactions.filter(t => 
                        t.transactionType === 'INVOICE_PAYMENT' && t.status === 'COMPLETED'
                    )}
                    onFormChange={handleRefundFormChange}
                    onProcess={handleProcessRefund}
                    onClose={handleCloseRefundModal}
                    processing={processingRefund}
                    refundResult={refundResult}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
};

// Refund Modal Component
const RefundModal = ({ 
    refundFormData, 
    transactions,
    onFormChange, 
    onProcess, 
    onClose, 
    processing, 
    refundResult,
    formatCurrency,
    formatDate
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
                                <label>Giao dịch thanh toán gốc <span className="required">*</span></label>
                                <select
                                    name="originalPaymentId"
                                    value={refundFormData.originalPaymentId}
                                    onChange={onFormChange}
                                    required
                                >
                                    <option value="">-- Chọn giao dịch --</option>
                                    {transactions.map(t => (
                                        <option key={t.transactionId} value={t.transactionId}>
                                            ID: {t.transactionId} - {formatCurrency(t.amount)} - {formatDate(t.transactionDate)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Số tiền hoàn trả <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={refundFormData.amount}
                                    onChange={onFormChange}
                                    placeholder="Nhập số tiền..."
                                    min="1"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Lý do hoàn tiền <span className="required">*</span></label>
                                <textarea
                                    name="reason"
                                    value={refundFormData.reason}
                                    onChange={onFormChange}
                                    placeholder="Nhập lý do hoàn tiền..."
                                    rows="3"
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
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                                    <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    name="notes"
                                    value={refundFormData.notes}
                                    onChange={onFormChange}
                                    placeholder="Nhập ghi chú (nếu có)..."
                                    rows="2"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="refund-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Hoàn tiền thành công!</h4>
                            </div>
                            <div className="result-details">
                                <div className="detail-row">
                                    <span className="label">Mã giao dịch:</span>
                                    <span className="value">{refundResult.transactionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số biên lai:</span>
                                    <span className="value">{refundResult.receiptNumber || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số tiền hoàn trả:</span>
                                    <span className="value highlight">{formatCurrency(refundResult.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phương thức:</span>
                                    <span className="value">{refundResult.paymentMethod}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Ngày hoàn tiền:</span>
                                    <span className="value">{formatDate(refundResult.transactionDate)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className="value">{refundResult.status}</span>
                                </div>
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
                            {processing ? 'Đang xử lý...' : <><FiCheck /> Xác nhận hoàn tiền</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutpatientRefundListPage;
