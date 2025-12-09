import React from 'react';
import { FiX, FiCheck, FiDollarSign } from 'react-icons/fi';

const SettlementModal = ({ 
    isOpen,
    onClose, 
    onSettle, 
    processing, 
    settlementData,
    settlementResult,
    formatCurrency,
    formatDateTime
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3><FiDollarSign /> Quyết toán tạm ứng</h3>
                    <button className="btn-close" onClick={onClose} disabled={processing}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {!settlementResult ? (
                        <div className="settlement-form">
                            <div className="info-box">
                                <p>Bạn có chắc chắn muốn quyết toán tạm ứng cho bệnh nhân này?</p>
                                <p className="warning-text">
                                    Hệ thống sẽ tự động tính toán và hoàn trả số tiền tạm ứng còn thừa (nếu có).
                                </p>
                            </div>
                            <div className="settlement-info">
                                <div className="info-row">
                                    <span className="label">Bệnh nhân:</span>
                                    <span className="value">{settlementData.patientName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Mã BN:</span>
                                    <span className="value">{settlementData.patientCode}</span>
                                </div>
                                {settlementData.invoiceId && (
                                    <div className="info-row">
                                        <span className="label">Invoice ID:</span>
                                        <span className="value">{settlementData.invoiceId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="settlement-result">
                            <div className="success-message">
                                <FiCheck className="success-icon" />
                                <h4>Quyết toán thành công!</h4>
                            </div>
                            <div className="settlement-details">
                                <div className="detail-row">
                                    <span className="label">Số dư ban đầu:</span>
                                    <span className="value">{formatCurrency(settlementResult.initial_balance)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Hóa đơn chưa thanh toán:</span>
                                    <span className="value">{formatCurrency(settlementResult.invoice_unpaid)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số dư còn lại:</span>
                                    <span className="value highlight">{formatCurrency(settlementResult.remaining_balance)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Số tiền hoàn trả:</span>
                                    <span className="value highlight">{formatCurrency(settlementResult.amount_refunded)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className="value">{settlementResult.status}</span>
                                </div>
                                
                                {settlementResult.refund_transaction && (
                                    <>
                                        <div className="section-divider">Thông tin giao dịch hoàn tiền</div>
                                        <div className="detail-row">
                                            <span className="label">Mã giao dịch:</span>
                                            <span className="value">{settlementResult.refund_transaction.transactionId}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Số biên lai:</span>
                                            <span className="value">{settlementResult.refund_transaction.receiptNumber}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Phương thức:</span>
                                            <span className="value">{settlementResult.refund_transaction.paymentMethod}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Ngày giao dịch:</span>
                                            <span className="value">{formatDateTime(settlementResult.refund_transaction.transactionDate)}</span>
                                        </div>
                                        {settlementResult.refund_transaction.notes && (
                                            <div className="detail-row">
                                                <span className="label">Ghi chú:</span>
                                                <span className="value">{settlementResult.refund_transaction.notes}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={processing}>
                        {settlementResult ? 'Đóng' : 'Hủy'}
                    </button>
                    {!settlementResult && (
                        <button className="btn-confirm" onClick={onSettle} disabled={processing}>
                            {processing ? 'Đang xử lý...' : <><FiCheck /> Xác nhận quyết toán</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettlementModal;
