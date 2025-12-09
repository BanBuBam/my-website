import React from 'react';
import { FiX, FiAlertCircle, FiRotateCcw } from 'react-icons/fi';

const RefundHistoryModal = ({ 
    isOpen,
    onClose, 
    refunds,
    loading,
    formatCurrency,
    formatDateTime
}) => {
    if (!isOpen) return null;

    const getPaymentMethodDisplay = (method) => {
        const methodMap = {
            'CASH': 'Tiền mặt',
            'BANK_TRANSFER': 'Chuyển khoản',
            'CREDIT_CARD': 'Thẻ tín dụng',
            'DEBIT_CARD': 'Thẻ ghi nợ',
            'E_WALLET': 'Ví điện tử',
            'ORIGINAL_METHOD': 'Phương thức gốc',
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
            <div className="modal-content refund-history-modal">
                <div className="modal-header">
                    <h3><FiRotateCcw /> Lịch sử hoàn tiền</h3>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải lịch sử hoàn tiền...</p>
                        </div>
                    ) : refunds && refunds.length > 0 ? (
                        <div className="refund-list">
                            {refunds.map((refund) => (
                                <div key={refund.transactionId} className="refund-item">
                                    <div className="refund-header">
                                        <div className="refund-id">
                                            <strong>#{refund.transactionId}</strong>
                                            {refund.receiptNumber && (
                                                <span className="receipt-number">{refund.receiptNumber}</span>
                                            )}
                                        </div>
                                        <span className={`refund-status ${getStatusClass(refund.status)}`}>
                                            {getStatusDisplay(refund.status)}
                                        </span>
                                    </div>
                                    <div className="refund-body">
                                        <div className="refund-row">
                                            <span className="label">Bệnh nhân:</span>
                                            <span className="value">{refund.patientName}</span>
                                        </div>
                                        <div className="refund-row">
                                            <span className="label">Số tiền hoàn:</span>
                                            <span className="value amount negative">
                                                {formatCurrency(Math.abs(refund.amount))}
                                            </span>
                                        </div>
                                        <div className="refund-row">
                                            <span className="label">Phương thức:</span>
                                            <span className="value">{getPaymentMethodDisplay(refund.paymentMethod)}</span>
                                        </div>
                                        <div className="refund-row">
                                            <span className="label">Ngày hoàn tiền:</span>
                                            <span className="value">{formatDateTime(refund.transactionDate)}</span>
                                        </div>
                                        {refund.invoiceNumber && (
                                            <div className="refund-row">
                                                <span className="label">Số hóa đơn:</span>
                                                <span className="value">{refund.invoiceNumber}</span>
                                            </div>
                                        )}
                                        {refund.processedByEmployeeName && (
                                            <div className="refund-row">
                                                <span className="label">Người xử lý:</span>
                                                <span className="value">{refund.processedByEmployeeName}</span>
                                            </div>
                                        )}
                                        {refund.notes && (
                                            <div className="refund-row">
                                                <span className="label">Ghi chú:</span>
                                                <span className="value">{refund.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FiAlertCircle />
                            <p>Chưa có giao dịch hoàn tiền nào</p>
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

export default RefundHistoryModal;
