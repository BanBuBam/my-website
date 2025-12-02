import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financeInvoiceAPI } from '../../../../services/staff/financeAPI';
import { FiArrowLeft, FiRefreshCw, FiDollarSign, FiFilter, FiCalendar, FiAlertCircle, FiActivity } from 'react-icons/fi';
import './TransactionListPage.css';

const TransactionListPage = () => {
    const { encounterId } = useParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('');
    const [invoiceId, setInvoiceId] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, [encounterId]);

    useEffect(() => {
        if (!filterType) {
            setFilteredTransactions(transactions);
        } else {
            const filtered = transactions.filter(t => t.transactionType === filterType);
            setFilteredTransactions(filtered);
        }
    }, [filterType, transactions]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // First, get invoice by encounter ID
            const invoiceResponse = await financeInvoiceAPI.getInvoiceByEncounterId(encounterId);
            if (!invoiceResponse || !invoiceResponse.data) {
                throw new Error('Không tìm thấy hóa đơn cho lượt khám này');
            }
            
            const invId = invoiceResponse.data.invoiceId;
            setInvoiceId(invId);
            
            // Then, get transactions by invoice ID
            const response = await financeInvoiceAPI.getTransactionsByInvoiceId(invId);
            if (response && response.data) {
                setTransactions(response.data);
                setFilteredTransactions(response.data);
            }
        } catch (err) {
            console.error('Error loading transactions:', err);
            setError(err.message || 'Không thể tải danh sách giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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

    const getTransactionTypeLabel = (type) => {
        const typeMap = {
            'ADVANCE_PAYMENT': 'Đặt cọc',
            'INVOICE_PAYMENT': 'Thanh toán hóa đơn',
            'REFUND': 'Hoàn tiền',
            'ADVANCE_USED': 'Sử dụng tạm ứng',
        };
        return typeMap[type] || type;
    };

    const getTransactionTypeBadgeClass = (type) => {
        const typeMap = {
            'ADVANCE_PAYMENT': 'type-advance',
            'INVOICE_PAYMENT': 'type-payment',
            'REFUND': 'type-refund',
            'ADVANCE_USED': 'type-advance-used',
        };
        return typeMap[type] || 'type-default';
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'COMPLETED': 'status-completed',
            'PENDING': 'status-pending',
            'CANCELLED': 'status-cancelled',
            'FAILED': 'status-failed',
        };
        return statusMap[status] || 'status-default';
    };

    const getPaymentMethodLabel = (method) => {
        const methodMap = {
            'CASH': 'Tiền mặt',
            'TRANSFER': 'Chuyển khoản',
            'CARD': 'Thẻ',
            'ADVANCE': 'Tạm ứng',
        };
        return methodMap[method] || method;
    };

    if (loading) {
        return (
            <div className="transaction-list-page">
                <div className="loading-state">
                    <FiActivity className="spinner" />
                    <p>Đang tải danh sách giao dịch...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="transaction-list-page">
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

    return (
        <div className="transaction-list-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiDollarSign className="header-icon" />
                    <div>
                        <h1>Danh sách Giao dịch</h1>
                        <p>Encounter ID: {encounterId} {invoiceId && `| Invoice ID: ${invoiceId}`}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchTransactions}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-group">
                    <FiFilter />
                    <label>Loại giao dịch:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="ADVANCE_PAYMENT">Đặt cọc</option>
                        <option value="INVOICE_PAYMENT">Thanh toán hóa đơn</option>
                        <option value="REFUND">Hoàn tiền</option>
                        <option value="ADVANCE_USED">Sử dụng tạm ứng</option>
                    </select>
                </div>
                <div className="stats">
                    <span className="stat-badge">
                        Tổng số: <strong>{filteredTransactions.length}</strong>
                    </span>
                    <span className="stat-badge">
                        Tổng tiền: <strong>{formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0))}</strong>
                    </span>
                </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                    <FiCalendar />
                    <p>Không có giao dịch nào</p>
                </div>
            ) : (
                <div className="transactions-grid">
                    {filteredTransactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.transactionId}
                            transaction={transaction}
                            formatCurrency={formatCurrency}
                            formatDateTime={formatDateTime}
                            getTransactionTypeLabel={getTransactionTypeLabel}
                            getTransactionTypeBadgeClass={getTransactionTypeBadgeClass}
                            getStatusBadgeClass={getStatusBadgeClass}
                            getPaymentMethodLabel={getPaymentMethodLabel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Transaction Card Component
const TransactionCard = ({
    transaction,
    formatCurrency,
    formatDateTime,
    getTransactionTypeLabel,
    getTransactionTypeBadgeClass,
    getStatusBadgeClass,
    getPaymentMethodLabel
}) => {
    return (
        <div className="transaction-card">
            <div className="card-header">
                <div className="card-title">
                    <h3>
                        <FiDollarSign /> {transaction.receiptNumber || `#${transaction.transactionId}`}
                    </h3>
                    <span className="transaction-date">{formatDateTime(transaction.transactionDate)}</span>
                </div>
                <div className="badges">
                    <span className={`badge ${getTransactionTypeBadgeClass(transaction.transactionType)}`}>
                        {getTransactionTypeLabel(transaction.transactionType)}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status}
                    </span>
                </div>
            </div>

            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <label>Số tiền:</label>
                        <span className="amount-highlight">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="info-item">
                        <label>Phương thức:</label>
                        <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                    </div>
                    <div className="info-item">
                        <label>Bệnh nhân:</label>
                        <span>{transaction.patientName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>ID Bệnh nhân:</label>
                        <span>{transaction.patientId || '-'}</span>
                    </div>
                    {transaction.invoiceNumber && (
                        <div className="info-item">
                            <label>Số hóa đơn:</label>
                            <span>{transaction.invoiceNumber}</span>
                        </div>
                    )}
                    {transaction.transactionReferenceId && (
                        <div className="info-item">
                            <label>Mã tham chiếu:</label>
                            <span>{transaction.transactionReferenceId}</span>
                        </div>
                    )}
                    <div className="info-item">
                        <label>Người xử lý:</label>
                        <span>{transaction.processedByEmployeeName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Cập nhật lúc:</label>
                        <span>{formatDateTime(transaction.updatedAt)}</span>
                    </div>
                </div>

                {/* Waiver Information */}
                {transaction.waiverType && (
                    <div className="waiver-info">
                        <h4>Thông tin miễn giảm</h4>
                        <div className="waiver-grid">
                            <div className="waiver-item">
                                <label>Loại:</label>
                                <span>{transaction.waiverType}</span>
                            </div>
                            <div className="waiver-item">
                                <label>Phần trăm:</label>
                                <span>{transaction.waiverPercentage}%</span>
                            </div>
                            <div className="waiver-item">
                                <label>Số tiền gốc:</label>
                                <span>{formatCurrency(transaction.originalAmount)}</span>
                            </div>
                            <div className="waiver-item">
                                <label>Số tiền miễn giảm:</label>
                                <span>{formatCurrency(transaction.waiverAmount)}</span>
                            </div>
                            {transaction.waiverReason && (
                                <div className="waiver-item full-width">
                                    <label>Lý do:</label>
                                    <span>{transaction.waiverReason}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {transaction.notes && (
                    <div className="notes-section">
                        <label>Ghi chú:</label>
                        <p>{transaction.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionListPage;

