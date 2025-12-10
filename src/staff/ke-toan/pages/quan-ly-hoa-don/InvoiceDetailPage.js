import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiFileText, FiUser, FiCalendar, FiDollarSign, FiActivity, FiAlertCircle, FiShoppingCart } from 'react-icons/fi';
import { financeInvoiceAPI } from '../../../../services/staff/financeAPI';
import './InvoiceDetailPage.css';

const InvoiceDetailPage = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState({});
    const [loadingItems, setLoadingItems] = useState(false);

    useEffect(() => {
        fetchInvoiceDetail();
        fetchInvoiceItems();
    }, [invoiceId]);

    const fetchInvoiceDetail = async () => {
        try {
            setLoading(true);
            const response = await financeInvoiceAPI.getInvoiceById(invoiceId);
            if (response && response.data) {
                setInvoice(response.data);
            }
        } catch (err) {
            console.error('Error loading invoice detail:', err);
            setError(err.message || 'Không thể tải thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoiceItems = async () => {
        try {
            setLoadingItems(true);
            const response = await financeInvoiceAPI.getInvoiceItems(invoiceId);
            if (response && response.data) {
                setInvoiceItems(response.data);
            }
        } catch (err) {
            console.error('Error loading invoice items:', err);
            // Don't show error, items are optional
        } finally {
            setLoadingItems(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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
            'ISSUED': 'status-issued',
            'PARTIAL_PAID': 'status-partial',
            'PAID': 'status-paid',
            'CANCELLED': 'status-cancelled',
        };
        return statusMap[status] || 'status-default';
    };

    const getPaymentStatusBadgeClass = (paymentStatus) => {
        const statusMap = {
            'PAID': 'payment-paid',
            'PARTIAL': 'payment-partial',
            'UNPAID': 'payment-unpaid',
        };
        return statusMap[paymentStatus] || 'payment-default';
    };

    if (loading) {
        return (
            <div className="invoice-detail-page">
                <div className="loading-state">
                    <FiActivity className="spinner" />
                    <p>Đang tải thông tin hóa đơn...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="invoice-detail-page">
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

    if (!invoice) {
        return (
            <div className="invoice-detail-page">
                <div className="empty-state">
                    <FiAlertCircle />
                    <p>Không tìm thấy hóa đơn</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="invoice-detail-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiFileText className="header-icon" />
                    <div>
                        <h1>Chi tiết Hóa đơn</h1>
                        <p>Invoice ID: #{invoice.invoiceId} | Số hóa đơn: {invoice.invoiceNumber}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchInvoiceDetail}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>

            {/* Status Section */}
            <div className="status-section">
                <div className="status-group">
                    <label>Trạng thái hóa đơn:</label>
                    <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status}
                    </span>
                </div>
                <div className="status-group">
                    <label>Trạng thái thanh toán:</label>
                    <span className={`status-badge ${getPaymentStatusBadgeClass(invoice.paymentStatus)}`}>
                        {invoice.paymentStatus}
                    </span>
                </div>
                {invoice.isOverdue && (
                    <div className="overdue-warning">
                        ⚠️ Hóa đơn đã quá hạn thanh toán
                    </div>
                )}
            </div>

            {/* Patient Information */}
            <div className="info-section">
                <h2><FiUser /> Thông tin Bệnh nhân</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Tên bệnh nhân:</label>
                        <span>{invoice.patientName}</span>
                    </div>
                    <div className="info-item">
                        <label>ID Bệnh nhân:</label>
                        <span>{invoice.patientId}</span>
                    </div>
                    <div className="info-item">
                        <label>Số BHYT:</label>
                        <span>{invoice.healthInsuranceNumber || 'Không có'}</span>
                    </div>
                    <div className="info-item">
                        <label>ID BHYT:</label>
                        <span>{invoice.healthInsuranceId || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Trạng thái bảo hiểm:</label>
                        <span>{invoice.insuranceClaimStatus || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Invoice Information */}
            <div className="info-section">
                <h2><FiFileText /> Thông tin Hóa đơn</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Số hóa đơn:</label>
                        <span className="highlight">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="info-item">
                        <label>ID Hóa đơn:</label>
                        <span>{invoice.invoiceId}</span>
                    </div>
                    <div className="info-item">
                        <label>ID Lượt khám:</label>
                        <span>{invoice.encounterId || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label><FiCalendar /> Ngày phát hành:</label>
                        <span>{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="info-item">
                        <label><FiCalendar /> Ngày đến hạn:</label>
                        <span className={invoice.isOverdue ? 'overdue-text' : ''}>
                            {formatDate(invoice.dueDate)}
                        </span>
                    </div>
                    <div className="info-item">
                        <label>Người tạo:</label>
                        <span>{invoice.createdByEmployeeName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Người cập nhật:</label>
                        <span>{invoice.updatedByEmployeeName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày tạo:</label>
                        <span>{formatDateTime(invoice.createdAt)}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày cập nhật:</label>
                        <span>{formatDateTime(invoice.updatedAt)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div className="info-section payment-section">
                <h2><FiDollarSign /> Thông tin Thanh toán</h2>
                <div className="payment-grid">
                    <div className="payment-item total">
                        <label>Tổng tiền:</label>
                        <span className="amount">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    <div className="payment-item insurance">
                        <label>Bảo hiểm chi trả:</label>
                        <span className="amount">{formatCurrency(invoice.insuranceCoveredAmount)}</span>
                    </div>
                    <div className="payment-item patient-responsible">
                        <label>Bệnh nhân phải trả:</label>
                        <span className="amount">{formatCurrency(invoice.patientResponsibleAmount)}</span>
                    </div>
                    <div className="payment-item paid">
                        <label>Đã thanh toán:</label>
                        <span className="amount">{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                    <div className="payment-item unpaid">
                        <label>Còn lại:</label>
                        <span className="amount">{formatCurrency(invoice.unpaidAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Invoice Items */}
            {Object.keys(invoiceItems).length > 0 && (
                <div className="info-section">
                    <h2><FiShoppingCart /> Chi tiết Hóa đơn</h2>
                    {loadingItems ? (
                        <div className="loading-items">
                            <FiActivity className="spinner" />
                            <p>Đang tải chi tiết...</p>
                        </div>
                    ) : (
                        <div className="items-container">
                            {Object.entries(invoiceItems).map(([itemType, items]) => (
                                <div key={itemType} className="item-type-section">
                                    <h3 className="item-type-title">{itemType}</h3>
                                    <div className="items-table-wrapper">
                                        <table className="items-table">
                                            <thead>
                                                <tr>
                                                    <th>Mã</th>
                                                    <th>Tên</th>
                                                    <th>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                    <th>Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.itemId}>
                                                        <td>{item.itemCode || '-'}</td>
                                                        <td className="item-name">{item.itemName}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                                        <td className="text-right highlight">{formatCurrency(item.totalPrice)}</td>
                                                        <td className="item-notes">{item.notes || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" className="text-right"><strong>Tổng cộng ({itemType}):</strong></td>
                                                    <td className="text-right total-amount">
                                                        <strong>{formatCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0))}</strong>
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notes */}
            {invoice.notes && (
                <div className="info-section">
                    <h2>Ghi chú</h2>
                    <div className="notes-content">
                        {invoice.notes}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetailPage;

