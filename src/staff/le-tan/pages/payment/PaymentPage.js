import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';
import {
    FiSearch, FiDollarSign, FiFileText, FiCheckCircle,
    FiAlertCircle, FiPackage, FiActivity, FiShoppingBag, FiBox, FiEye
} from 'react-icons/fi';
import { receptionistPaymentAPI } from '../../../../services/staff/receptionistAPI';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [encounterId, setEncounterId] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    // Form data for invoice generation
    const [invoiceFormData, setInvoiceFormData] = useState({
        notes: '',
        includePendingItems: true
    });

    // Invoice detail modal states
    const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
    const [invoiceDetail, setInvoiceDetail] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            setError('Vui lòng nhập Encounter ID');
            return;
        }

        setLoading(true);
        setError(null);
        setInvoice(null);

        try {
            const response = await receptionistPaymentAPI.getInvoiceByEncounter(parseInt(encounterId));
            if (response && response.data) {
                setInvoice(response.data);
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
            setError(err.message || 'Không tìm thấy invoice cho encounter này');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!encounterId.trim()) {
            setError('Vui lòng nhập Encounter ID');
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            const requestData = {
                encounterId: parseInt(encounterId),
                notes: invoiceFormData.notes || '',
                includePendingItems: invoiceFormData.includePendingItems
            };

            const response = await receptionistPaymentAPI.generateInvoice(requestData);

            if (response && response.data) {
                setInvoice(response.data);
                alert('Tạo invoice thành công!');
            }
        } catch (err) {
            console.error('Error generating invoice:', err);
            setError(err.message || 'Không thể tạo invoice');
        } finally {
            setGenerating(false);
        }
    };

    const handleViewInvoiceDetail = async (invoiceId) => {
        setLoadingDetail(true);
        setShowInvoiceDetail(true);
        setInvoiceDetail(null);
        setInvoiceItems(null);

        try {
            const [detailResponse, itemsResponse] = await Promise.all([
                receptionistPaymentAPI.getInvoiceDetail(invoiceId),
                receptionistPaymentAPI.getInvoiceItems(invoiceId)
            ]);

            if (detailResponse && detailResponse.data) {
                setInvoiceDetail(detailResponse.data);
            }

            if (itemsResponse && itemsResponse.data) {
                setInvoiceItems(itemsResponse.data);
            }
        } catch (err) {
            console.error('Error fetching invoice detail:', err);
            alert('Lỗi: ' + (err.message || 'Không thể tải chi tiết invoice'));
        } finally {
            setLoadingDetail(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { class: 'badge-pending', icon: <FiAlertCircle />, text: 'Chờ thanh toán' },
            'PAID': { class: 'badge-paid', icon: <FiCheckCircle />, text: 'Đã thanh toán' },
            'CANCELLED': { class: 'badge-cancelled', icon: <FiAlertCircle />, text: 'Đã hủy' },
            'PARTIAL': { class: 'badge-partial', icon: <FiAlertCircle />, text: 'Thanh toán một phần' },
        };

        const statusInfo = statusMap[status] || { class: 'badge-default', icon: <FiAlertCircle />, text: status };

        return (
            <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusInfo.text}
            </span>
        );
    };

    return (
        <div className="payment-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Thanh toán</h2>
                    <p>Tạo và quản lý hóa đơn thanh toán cho bệnh nhân</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <FiSearch className="search-icon" />
                        <input
                            type="number"
                            placeholder="Nhập Encounter ID để tìm kiếm..."
                            value={encounterId}
                            onChange={(e) => setEncounterId(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Invoice Generation Form */}
            {encounterId && !invoice && (
                <div className="invoice-form-card">
                    <div className="card-header">
                        <FiFileText />
                        <h3>Tạo Invoice cho Encounter #{encounterId}</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="notes">Ghi chú (tùy chọn):</label>
                            <textarea
                                id="notes"
                                value={invoiceFormData.notes}
                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                                placeholder="Nhập ghi chú cho invoice..."
                                rows="4"
                                className="form-textarea"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={invoiceFormData.includePendingItems}
                                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, includePendingItems: e.target.checked })}
                                />
                                <span>Bao gồm các mục đang chờ xử lý (Pending Items)</span>
                            </label>
                        </div>
                        <button
                            className="btn-generate"
                            onClick={handleGenerateInvoice}
                            disabled={generating}
                        >
                            <FiDollarSign /> {generating ? 'Đang tạo invoice...' : 'Tạo Invoice'}
                        </button>
                    </div>
                </div>
            )}

            {/* Invoice Details */}
            {invoice && (
                <div className="invoice-details">
                    {/* Invoice Header */}
                    <div className="invoice-header-card">
                        <div className="invoice-header-content">
                            <div className="invoice-title">
                                <FiFileText className="invoice-icon" />
                                <div>
                                    <h3>Invoice #{invoice.invoiceNumber || invoice.invoiceId}</h3>
                                    <p>Invoice ID: {invoice.invoiceId}</p>
                                </div>
                            </div>
                            <div className="invoice-status">
                                {getStatusBadge(invoice.paymentStatus || invoice.status)}
                            </div>
                        </div>
                        <div className="invoice-actions">
                            <button
                                className="btn-view-detail"
                                onClick={() => handleViewInvoiceDetail(invoice.invoiceId)}
                            >
                                <FiEye /> Xem chi tiết
                            </button>
                        </div>
                        {invoice.message && (
                            <div className="invoice-message">
                                <FiAlertCircle />
                                <span>{invoice.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Patient & Encounter Info */}
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="card-header">
                                <h4>Thông tin Bệnh nhân</h4>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Mã bệnh nhân:</span>
                                    <span className="info-value">{invoice.patientId}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tên bệnh nhân:</span>
                                    <span className="info-value strong">{invoice.patientName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="card-header">
                                <h4>Thông tin Encounter</h4>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Encounter ID:</span>
                                    <span className="info-value strong">{invoice.encounterId}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Bảo hiểm y tế:</span>
                                    <span className="info-value">
                                        {invoice.healthInsuranceId ? `ID: ${invoice.healthInsuranceId}` : 'Không có'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Summary */}
                    <div className="items-summary-card">
                        <div className="card-header">
                            <h4>Tổng quan các mục</h4>
                        </div>
                        <div className="card-body">
                            <div className="items-grid">
                                <div className="item-stat">
                                    <div className="item-icon medicine">
                                        <FiActivity />
                                    </div>
                                    <div className="item-info">
                                        <span className="item-count">{invoice.medicineItemsCount}</span>
                                        <span className="item-label">Thuốc</span>
                                        <span className="item-amount">{formatCurrency(invoice.medicineTotal)}</span>
                                    </div>
                                </div>

                                <div className="item-stat">
                                    <div className="item-icon service">
                                        <FiPackage />
                                    </div>
                                    <div className="item-info">
                                        <span className="item-count">{invoice.serviceItemsCount}</span>
                                        <span className="item-label">Dịch vụ</span>
                                        <span className="item-amount">{formatCurrency(invoice.serviceTotal)}</span>
                                    </div>
                                </div>

                                <div className="item-stat">
                                    <div className="item-icon material">
                                        <FiBox />
                                    </div>
                                    <div className="item-info">
                                        <span className="item-count">{invoice.materialItemsCount}</span>
                                        <span className="item-label">Vật tư</span>
                                        <span className="item-amount">{formatCurrency(invoice.materialTotal)}</span>
                                    </div>
                                </div>

                                <div className="item-stat">
                                    <div className="item-icon package">
                                        <FiShoppingBag />
                                    </div>
                                    <div className="item-info">
                                        <span className="item-count">{invoice.packageItemsCount}</span>
                                        <span className="item-label">Gói dịch vụ</span>
                                        <span className="item-amount">{formatCurrency(invoice.packageTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="payment-summary-card">
                        <div className="card-header">
                            <h4>Tổng kết thanh toán</h4>
                        </div>
                        <div className="card-body">
                            <div className="summary-row">
                                <span className="summary-label">Tổng số mục:</span>
                                <span className="summary-value">{invoice.totalItemsCount} mục</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Tổng tiền:</span>
                                <span className="summary-value">{formatCurrency(invoice.totalAmount)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Bảo hiểm chi trả:</span>
                                <span className="summary-value insurance">{formatCurrency(invoice.insuranceCoveredAmount)}</span>
                            </div>
                            <div className="summary-row total">
                                <span className="summary-label">Bệnh nhân thanh toán:</span>
                                <span className="summary-value">{formatCurrency(invoice.patientResponsibleAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Detail Modal */}
            {showInvoiceDetail && (
                <div className="modal-overlay" onClick={() => setShowInvoiceDetail(false)}>
                    <div className="modal-content invoice-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Invoice</h3>
                            <button className="modal-close" onClick={() => setShowInvoiceDetail(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingDetail ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Đang tải chi tiết invoice...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Invoice Info */}
                                    {invoiceDetail && (
                                        <div className="detail-section">
                                            <h4>Thông tin Invoice</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">Invoice Number:</span>
                                                    <span className="detail-value">{invoiceDetail.invoiceNumber}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Encounter ID:</span>
                                                    <span className="detail-value">{invoiceDetail.encounterId}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Bệnh nhân:</span>
                                                    <span className="detail-value">{invoiceDetail.patientName}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Trạng thái:</span>
                                                    <span className="detail-value">{invoiceDetail.paymentStatus}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Ngày phát hành:</span>
                                                    <span className="detail-value">{invoiceDetail.issueDate}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Ngày đến hạn:</span>
                                                    <span className="detail-value">{invoiceDetail.dueDate}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Tổng tiền:</span>
                                                    <span className="detail-value">{formatCurrency(invoiceDetail.totalAmount)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Đã thanh toán:</span>
                                                    <span className="detail-value">{formatCurrency(invoiceDetail.amountPaid)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Chưa thanh toán:</span>
                                                    <span className="detail-value">{formatCurrency(invoiceDetail.unpaidAmount)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Bảo hiểm chi trả:</span>
                                                    <span className="detail-value">{formatCurrency(invoiceDetail.insuranceCoveredAmount)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Bệnh nhân trả:</span>
                                                    <span className="detail-value">{formatCurrency(invoiceDetail.patientResponsibleAmount)}</span>
                                                </div>
                                                {invoiceDetail.healthInsuranceNumber && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Số BHYT:</span>
                                                        <span className="detail-value">{invoiceDetail.healthInsuranceNumber}</span>
                                                    </div>
                                                )}
                                                {invoiceDetail.notes && (
                                                    <div className="detail-item full-width">
                                                        <span className="detail-label">Ghi chú:</span>
                                                        <span className="detail-value">{invoiceDetail.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Invoice Items */}
                                    {invoiceItems && (
                                        <div className="detail-section">
                                            <h4>Danh sách Items</h4>
                                            {Object.keys(invoiceItems).length === 0 ? (
                                                <p className="empty-message">Không có items nào</p>
                                            ) : (
                                                Object.entries(invoiceItems).map(([itemType, items]) => (
                                                    <div key={itemType} className="item-type-section">
                                                        <h5>{itemType}</h5>
                                                        <div className="items-table">
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Tên</th>
                                                                        <th>Mã</th>
                                                                        <th>SL</th>
                                                                        <th>Đơn giá</th>
                                                                        <th>Tổng</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {items.map((item) => (
                                                                        <tr key={item.itemId}>
                                                                            <td>{item.itemName}</td>
                                                                            <td>{item.itemCode}</td>
                                                                            <td>{item.quantity}</td>
                                                                            <td>{formatCurrency(item.unitPrice)}</td>
                                                                            <td>{formatCurrency(item.totalPrice)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;

