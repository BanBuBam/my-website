import React from 'react';
import { FiX, FiList, FiAlertCircle } from 'react-icons/fi';

const TransactionHistoryModal = ({ 
    isOpen,
    onClose, 
    transactions,
    loading,
    formatCurrency,
    formatDateTime
}) => {
    if (!isOpen) return null;

    const getTransactionTypeDisplay = (type) => {
        const typeMap = {
            'INVOICE_PAYMENT': 'Thanh toán hóa đơn',
            'ADVANCE_PAYMENT': 'Nộp tạm ứng',
            'ADVANCE_USED': 'Sử dụng tạm ứng',
            'REFUND': 'Hoàn tiền',
            'ADVANCE_TRANSFER_IN': 'Chuyển tạm ứng vào',
            'ADVANCE_TRANSFER_OUT': 'Chuyển tạm ứng ra',
        };
        return typeMap[type] || type;
    };

    const getPaymentMethodDisplay = (method) => {
        const methodMap = {
            'CASH': 'Tiền mặt',
            'BANK_TRANSFER': 'Chuyển khoản',
            'CREDIT_CARD': 'Thẻ tín dụng',
            'DEBIT_CARD': 'Thẻ ghi nợ',
            'E_WALLET': 'Ví điện tử',
            'ADVANCE': 'Tạm ứng',
            'INSURANCE': 'Bảo hiểm',
        };
        return methodMap[method] || method;
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'COMPLETED': 'Hoàn thành',
            'PENDING': 'Đang chờ',
            'FAILED': 'Thất bại',
            'CANCELLED': 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classMap = {
            'COMPLETED': 'status-completed',
            'PENDING': 'status-pending',
            'FAILED': 'status-failed',
            'CANCELLED': 'status-cancelled',
        };
        return classMap[status] || '';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content transaction-history-modal">
                <div className="modal-header">
                    <h3><FiList /> Lịch sử giao dịch</h3>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải lịch sử giao dịch...</p>
                        </div>
                    ) : transactions && transactions.length > 0 ? (
                        <div className="transaction-list">
                            {transactions.map((transaction) => (
                                <div key={transaction.transactionId} className="transaction-item">
                                    <div className="transaction-header">
                                        <div className="transaction-id">
                                            <strong>#{transaction.transactionId}</strong>
                                            {transaction.receiptNumber && (
                                                <span className="receipt-number">{transaction.receiptNumber}</span>
                                            )}
                                        </div>
                                        <span className={`transaction-status ${getStatusClass(transaction.status)}`}>
                                            {getStatusDisplay(transaction.status)}
                                        </span>
                                    </div>
                                    <div className="transaction-body">
                                        <div className="transaction-row">
                                            <span className="label">Loại giao dịch:</span>
                                            <span className="value">{getTransactionTypeDisplay(transaction.transactionType)}</span>
                                        </div>
                                        <div className="transaction-row">
                                            <span className="label">Số tiền:</span>
                                            <span className={`value amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </div>
                                        <div className="transaction-row">
                                            <span className="label">Phương thức:</span>
                                            <span className="value">{getPaymentMethodDisplay(transaction.paymentMethod)}</span>
                                        </div>
                                        <div className="transaction-row">
                                            <span className="label">Ngày giao dịch:</span>
                                            <span className="value">{formatDateTime(transaction.transactionDate)}</span>
                                        </div>
                                        {transaction.invoiceNumber && (
                                            <div className="transaction-row">
                                                <span className="label">Số hóa đơn:</span>
                                                <span className="value">{transaction.invoiceNumber}</span>
                                            </div>
                                        )}
                                        {transaction.processedByEmployeeName && (
                                            <div className="transaction-row">
                                                <span className="label">Người xử lý:</span>
                                                <span className="value">{transaction.processedByEmployeeName}</span>
                                            </div>
                                        )}
                                        {transaction.notes && (
                                            <div className="transaction-row">
                                                <span className="label">Ghi chú:</span>
                                                <span className="value">{transaction.notes}</span>
                                            </div>
                                        )}
                                        {transaction.waiverType && (
                                            <>
                                                <div className="transaction-row">
                                                    <span className="label">Loại miễn giảm:</span>
                                                    <span className="value">{transaction.waiverType}</span>
                                                </div>
                                                <div className="transaction-row">
                                                    <span className="label">Lý do miễn giảm:</span>
                                                    <span className="value">{transaction.waiverReason}</span>
                                                </div>
                                                <div className="transaction-row">
                                                    <span className="label">Tỷ lệ miễn giảm:</span>
                                                    <span className="value">{transaction.waiverPercentage}%</span>
                                                </div>
                                                <div className="transaction-row">
                                                    <span className="label">Số tiền miễn giảm:</span>
                                                    <span className="value">{formatCurrency(transaction.waiverAmount)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FiAlertCircle />
                            <p>Chưa có giao dịch nào</p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryModal;
