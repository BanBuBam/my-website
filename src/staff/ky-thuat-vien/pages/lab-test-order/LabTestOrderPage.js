import React, { useState } from 'react';
import './LabTestOrderPage.css';
import {
    FiClipboard, FiSearch, FiUser, FiActivity, FiClock,
    FiAlertCircle, FiCheckCircle, FiRefreshCw, FiFileText,
    FiPackage, FiInbox
} from 'react-icons/fi';
import { labTechnicianOrderAPI } from '../../../../services/staff/labTechnicianAPI';

const LabTestOrderPage = () => {
    const [encounterId, setEncounterId] = useState('');
    const [labOrders, setLabOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [processingOrderId, setProcessingOrderId] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            setError('Vui lòng nhập Encounter ID');
            return;
        }

        setLoading(true);
        setError(null);
        setLabOrders([]);

        try {
            const response = await labTechnicianOrderAPI.getLabTestOrders(encounterId.trim());
            console.log('Lab Orders Response:', response);

            if (response && response.data) {
                setLabOrders(response.data);
                if (response.data.length === 0) {
                    setError('Không tìm thấy lab test order nào cho encounter này');
                }
            }
        } catch (err) {
            console.error('Error fetching lab orders:', err);
            setError(err.message || 'Không thể tải danh sách lab test orders');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setEncounterId('');
        setLabOrders([]);
        setError(null);
    };

    const handleCollectSpecimen = async (labTestOrderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn lấy mẫu cho lab order này?')) {
            return;
        }

        setProcessingOrderId(labTestOrderId);
        try {
            const response = await labTechnicianOrderAPI.collectSpecimen(labTestOrderId);

            if (response) {
                alert('Lấy mẫu thành công!');
                // Refresh lab orders list
                handleSearch({ preventDefault: () => {} });
            }
        } catch (err) {
            console.error('Error collecting specimen:', err);
            alert(err.message || 'Không thể lấy mẫu');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleReceiveSpecimen = async (labTestOrderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn nhận mẫu cho lab order này?')) {
            return;
        }

        setProcessingOrderId(labTestOrderId);
        try {
            const response = await labTechnicianOrderAPI.receiveSpecimen(labTestOrderId);

            if (response) {
                alert('Nhận mẫu thành công!');
                // Refresh lab orders list
                handleSearch({ preventDefault: () => {} });
            }
        } catch (err) {
            console.error('Error receiving specimen:', err);
            alert(err.message || 'Không thể nhận mẫu');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'REQUESTED': { label: 'Đã yêu cầu', className: 'status-requested' },
            'SPECIMEN_COLLECTED': { label: 'Đã lấy mẫu', className: 'status-collected' },
            'SPECIMEN_RECEIVED': { label: 'Đã nhận mẫu', className: 'status-received' },
            'IN_PROGRESS': { label: 'Đang xử lý', className: 'status-in-progress' },
            'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
        };

        const config = statusConfig[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    return (
        <div className="lab-test-order-page">
            <div className="page-header">
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Lab Test Order</h1>
                        <p>Quản lý yêu cầu xét nghiệm</p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Nhập Encounter ID..."
                            value={encounterId}
                            onChange={(e) => setEncounterId(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                    <button type="button" className="btn-reset" onClick={handleReset}>
                        <FiRefreshCw /> Đặt lại
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

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <FiRefreshCw className="spinning" />
                    <p>Đang tải danh sách lab test orders...</p>
                </div>
            )}

            {/* Lab Orders List */}
            {!loading && labOrders.length > 0 && (
                <div className="orders-section">
                    <div className="section-header">
                        <h2>Danh sách Lab Test Orders</h2>
                        <span className="count-badge">{labOrders.length} order(s)</span>
                    </div>

                    <div className="orders-grid">
                        {labOrders.map((order) => (
                            <div key={order.labTestOrderId} className="order-card">
                                <div className="order-header">
                                    <div className="order-id">
                                        <FiFileText />
                                        <span>Order #{order.labTestOrderId}</span>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="order-body">
                                    <div className="info-row">
                                        <div className="info-item">
                                            <FiUser className="info-icon" />
                                            <div>
                                                <span className="info-label">Encounter ID</span>
                                                <span className="info-value">{order.encounterId}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <FiClock className="info-icon" />
                                            <div>
                                                <span className="info-label">Ngày yêu cầu</span>
                                                <span className="info-value">{formatDateTime(order.requestedDatetime)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-item">
                                            <FiUser className="info-icon" />
                                            <div>
                                                <span className="info-label">Người tạo</span>
                                                <span className="info-value">{order.createdByEmployeeName || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <FiActivity className="info-icon" />
                                            <div>
                                                <span className="info-label">Kỹ thuật viên</span>
                                                <span className="info-value">{order.technicianEmployeeName || 'Chưa phân công'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {order.completedDatetime && (
                                        <div className="info-row">
                                            <div className="info-item full-width">
                                                <FiCheckCircle className="info-icon" />
                                                <div>
                                                    <span className="info-label">Ngày hoàn thành</span>
                                                    <span className="info-value">{formatDateTime(order.completedDatetime)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Test Results */}
                                    {order.results && order.results.length > 0 && (
                                        <div className="results-section">
                                            <h4>Kết quả xét nghiệm ({order.results.length})</h4>
                                            <div className="results-list">
                                                {order.results.map((result) => (
                                                    <div key={result.labTestResultId} className="result-item">
                                                        <div className="result-header">
                                                            <span className="test-name">{result.testName}</span>
                                                            <span className="test-id">ID: {result.medicalTestId}</span>
                                                        </div>
                                                        <div className="result-details">
                                                            <div className="result-field">
                                                                <span className="field-label">Giá trị:</span>
                                                                <span className="field-value">{result.resultValue || 'Chưa có'}</span>
                                                            </div>
                                                            <div className="result-field">
                                                                <span className="field-label">Đơn vị:</span>
                                                                <span className="field-value">{result.unit || '-'}</span>
                                                            </div>
                                                            <div className="result-field">
                                                                <span className="field-label">Khoảng tham chiếu:</span>
                                                                <span className="field-value">{result.referenceRange || '-'}</span>
                                                            </div>
                                                            {result.notes && (
                                                                <div className="result-field full-width">
                                                                    <span className="field-label">Ghi chú:</span>
                                                                    <span className="field-value">{result.notes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="order-footer">
                                    <button
                                        className="btn-action btn-collect"
                                        onClick={() => handleCollectSpecimen(order.labTestOrderId)}
                                        disabled={processingOrderId === order.labTestOrderId || order.status !== 'REQUESTED'}
                                    >
                                        <FiPackage />
                                        {processingOrderId === order.labTestOrderId ? 'Đang xử lý...' : 'Lấy mẫu'}
                                    </button>
                                    <button
                                        className="btn-action btn-receive"
                                        onClick={() => handleReceiveSpecimen(order.labTestOrderId)}
                                        disabled={processingOrderId === order.labTestOrderId || order.status !== 'SPECIMEN_COLLECTED'}
                                    >
                                        <FiInbox />
                                        {processingOrderId === order.labTestOrderId ? 'Đang xử lý...' : 'Nhận mẫu'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabTestOrderPage;

