import React, { useState, useEffect } from 'react';
import './LabTestOrderPage.css';
import {
    FiClipboard, FiSearch, FiUser, FiActivity, FiClock,
    FiAlertCircle, FiCheckCircle, FiRefreshCw, FiFileText,
    FiPackage, FiInbox, FiEdit
} from 'react-icons/fi';
import { labTechnicianOrderAPI, labTechnicianResultAPI } from '../../../../services/staff/labTechnicianAPI';

const LabTestOrderPage = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState('pending');

    // Encounter search state (Tab 2)
    const [encounterId, setEncounterId] = useState('');
    const [labOrders, setLabOrders] = useState([]);

    // Pending lab tests state (Tab 1)
    const [pendingTests, setPendingTests] = useState([]);

    // Pending verification state (Tab 3)
    const [pendingVerification, setPendingVerification] = useState([]);

    // Common states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [processingOrderId, setProcessingOrderId] = useState(null);

    // Fetch data when tab changes
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingTests();
        } else if (activeTab === 'verification') {
            fetchPendingVerification();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Fetch pending lab tests (Tab 1)
    const fetchPendingTests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await labTechnicianResultAPI.getPendingLabResults();
            if (response && response.data) {
                setPendingTests(response.data);
            } else {
                setPendingTests([]);
            }
        } catch (err) {
            console.error('Error fetching pending tests:', err);
            setError(err.message || 'Không thể tải danh sách xét nghiệm chờ thực hiện');
            setPendingTests([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch pending verification (Tab 3)
    const fetchPendingVerification = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await labTechnicianResultAPI.getPendingVerificationResults();
            if (response && response.data) {
                setPendingVerification(response.data);
            } else {
                setPendingVerification([]);
            }
        } catch (err) {
            console.error('Error fetching pending verification:', err);
            setError(err.message || 'Không thể tải danh sách xét nghiệm chờ xác nhận');
            setPendingVerification([]);
        } finally {
            setLoading(false);
        }
    };

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
                    setError('Không tìm thấy yêu cầu xét nghiệm nào cho encounter này');
                }
            }
        } catch (err) {
            console.error('Error fetching lab orders:', err);
            setError(err.message || 'Không thể tải danh sách yêu cầu xét nghiệm');
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

    const handleRejectSpecimen = async (labTestOrderId) => {
        const rejectionReason = prompt('Vui lòng nhập lý do từ chối mẫu:');
        
        if (!rejectionReason || !rejectionReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn từ chối mẫu này?')) {
            return;
        }

        setProcessingOrderId(labTestOrderId);
        try {
            const response = await labTechnicianOrderAPI.rejectSpecimen(labTestOrderId, rejectionReason.trim());

            if (response) {
                alert('Từ chối mẫu thành công!');
                // Refresh based on current tab
                if (activeTab === 'pending') {
                    fetchPendingTests();
                } else if (activeTab === 'search') {
                    handleSearch({ preventDefault: () => {} });
                }
            }
        } catch (err) {
            console.error('Error rejecting specimen:', err);
            alert(err.message || 'Không thể từ chối mẫu');
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
                        <h1>Yêu cầu xét nghiệm</h1>
                        <p>Quản lý yêu cầu xét nghiệm</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-section">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <FiClock /> Xét nghiệm chờ thực hiện
                    </button>
                    <button
                        className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        <FiSearch /> Tìm kiếm theo mã lượt khám
                    </button>
                    <button
                        className={`tab ${activeTab === 'verification' ? 'active' : ''}`}
                        onClick={() => setActiveTab('verification')}
                    >
                        <FiCheckCircle /> Xét nghiệm chờ xác nhận
                    </button>
                </div>
            </div>

            {/* Tab 1: Pending Lab Tests */}
            {activeTab === 'pending' && (
                <>
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
                            <p>Đang tải danh sách xét nghiệm chờ thực hiện...</p>
                        </div>
                    )}

                    {/* Pending Tests List */}
                    {!loading && !error && (
                        <div className="results-section">
                            {pendingTests.length === 0 ? (
                                <div className="no-data">
                                    <FiClipboard />
                                    <p>Không có xét nghiệm chờ thực hiện</p>
                                </div>
                            ) : (
                                <>
                                    <div className="section-header">
                                        <h2>Danh sách xét nghiệm chờ thực hiện</h2>
                                        <span className="count-badge">{pendingTests.length} xét nghiệm</span>
                                    </div>
                                    <div className="pending-tests-grid">
                                        {pendingTests.map((test) => (
                                            <div key={test.labTestResultId} className="test-card">
                                                <div className="test-header">
                                                    <div className="test-name">
                                                        <FiActivity />
                                                        <span>{test.testName}</span>
                                                    </div>
                                                    <span className="test-id">ID: {test.labTestResultId}</span>
                                                </div>
                                                <div className="test-body">
                                                    <div className="test-info">
                                                        <div className="info-item">
                                                            <span className="label">Order ID:</span>
                                                            <span className="value">#{test.labTestOrderId}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Medical Test ID:</span>
                                                            <span className="value">#{test.medicalTestId}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Người tạo:</span>
                                                            <span className="value">{test.createdByEmployeeName}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Thời gian tạo:</span>
                                                            <span className="value">{formatDateTime(test.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="test-footer">
                                                    {/* <button className="btn-action btn-enter-result">
                                                        <FiEdit /> Nhập kết quả
                                                    </button> */}
                                                    <button
                                                        className="btn-action btn-collect"
                                                        onClick={() => handleCollectSpecimen(test.labTestOrderId)}
                                                        disabled={processingOrderId === test.labTestOrderId}
                                                    >
                                                        <FiPackage />
                                                        {processingOrderId === test.labTestOrderId ? 'Đang xử lý...' : 'Lấy mẫu'}
                                                    </button>
                                                    <button
                                                        className="btn-action btn-receive"
                                                        onClick={() => handleReceiveSpecimen(test.labTestOrderId)}
                                                        disabled={processingOrderId === test.labTestOrderId}
                                                    >
                                                        <FiInbox />
                                                        {processingOrderId === test.labTestOrderId ? 'Đang xử lý...' : 'Nhận mẫu'}
                                                    </button>
                                                    <button
                                                        className="btn-action btn-reject"
                                                        onClick={() => handleRejectSpecimen(test.labTestOrderId)}
                                                        disabled={processingOrderId === test.labTestOrderId}
                                                    >
                                                        <FiAlertCircle />
                                                        {processingOrderId === test.labTestOrderId ? 'Đang xử lý...' : 'Từ chối mẫu'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Tab 2: Search by Encounter ID */}
            {activeTab === 'search' && (
                <>
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
                            <p>Đang tải danh sách Yêu cầu xét nghiệm...</p>
                        </div>
                    )}

                    {/* Lab Orders List */}
                    {!loading && labOrders.length > 0 && (
                <div className="orders-section">
                    <div className="section-header">
                        <h2>Danh sách Yêu cầu xét nghiệm</h2>
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
                                    <button
                                        className="btn-action btn-reject"
                                        onClick={() => handleRejectSpecimen(order.labTestOrderId)}
                                        disabled={processingOrderId === order.labTestOrderId}
                                    >
                                        <FiAlertCircle />
                                        {processingOrderId === order.labTestOrderId ? 'Đang xử lý...' : 'Từ chối mẫu'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                </>
            )}

            {/* Tab 3: Pending Verification */}
            {activeTab === 'verification' && (
                <>
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
                            <p>Đang tải danh sách xét nghiệm chờ xác nhận...</p>
                        </div>
                    )}

                    {/* Pending Verification List */}
                    {!loading && !error && (
                        <div className="results-section">
                            {pendingVerification.length === 0 ? (
                                <div className="no-data">
                                    <FiClipboard />
                                    <p>Không có xét nghiệm chờ xác nhận</p>
                                </div>
                            ) : (
                                <>
                                    <div className="section-header">
                                        <h2>Danh sách xét nghiệm chờ xác nhận</h2>
                                        <span className="count-badge">{pendingVerification.length} xét nghiệm</span>
                                    </div>
                                    <div className="verification-tests-grid">
                                        {pendingVerification.map((test) => (
                                            <div key={test.labTestResultId} className="verification-card">
                                                <div className="verification-header">
                                                    <div className="test-name">
                                                        <FiActivity />
                                                        <span>{test.testName}</span>
                                                    </div>
                                                    <span className="test-id">ID: {test.labTestResultId}</span>
                                                </div>
                                                <div className="verification-body">
                                                    <div className="result-display">
                                                        <div className="result-item highlight">
                                                            <span className="label">Kết quả:</span>
                                                            <span className="value result-value">{test.resultValue || '-'}</span>
                                                        </div>
                                                        <div className="result-item">
                                                            <span className="label">Đơn vị:</span>
                                                            <span className="value">{test.unit || '-'}</span>
                                                        </div>
                                                        <div className="result-item">
                                                            <span className="label">Khoảng tham chiếu:</span>
                                                            <span className="value">{test.referenceRange || '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="test-info">
                                                        <div className="info-item">
                                                            <span className="label">Order ID:</span>
                                                            <span className="value">#{test.labTestOrderId}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Medical Test ID:</span>
                                                            <span className="value">#{test.medicalTestId}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Người tạo:</span>
                                                            <span className="value">{test.createdByEmployeeName}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Thời gian tạo:</span>
                                                            <span className="value">{formatDateTime(test.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    {test.notes && (
                                                        <div className="test-notes">
                                                            <strong>Ghi chú:</strong> {test.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="verification-footer">
                                                    <button className="btn-action btn-verify">
                                                        <FiCheckCircle /> Xác nhận kết quả
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LabTestOrderPage;

