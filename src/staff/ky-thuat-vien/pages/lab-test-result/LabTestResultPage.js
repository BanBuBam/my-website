import React, { useState, useEffect } from 'react';
import './LabTestResultPage.css';
import { FiFileText, FiAlertCircle, FiRefreshCw, FiEdit, FiCheckCircle, FiX, FiClock, FiClipboard } from 'react-icons/fi';
import { labTechnicianResultAPI } from '../../../../services/staff/labTechnicianAPI';

const LabTestResultPage = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verification'

    const [labResults, setLabResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter states
    const [filterDate, setFilterDate] = useState('');
    const [filterCreator, setFilterCreator] = useState('');
    const [creatorList, setCreatorList] = useState([]);

    // Modal states
    const [showEnterResultModal, setShowEnterResultModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [resultFormData, setResultFormData] = useState({
        resultValue: '',
        unit: '',
        referenceRange: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch lab results based on active tab
    const fetchLabResults = async () => {
        setLoading(true);
        setError('');
        try {
            let response;
            if (activeTab === 'pending') {
                response = await labTechnicianResultAPI.getPendingLabResults();
            } else {
                response = await labTechnicianResultAPI.getPendingVerificationResults();
            }

            if (response.data) {
                setLabResults(response.data);
                setFilteredResults(response.data);

                // Extract unique creators
                const creators = [...new Set(response.data.map(r => r.createdByEmployeeName))];
                setCreatorList(creators);
            }
        } catch (err) {
            setError('Không thể tải danh sách kết quả xét nghiệm. Vui lòng thử lại.');
            console.error('Error fetching lab results:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabResults();
        // Reset filters when tab changes
        setFilterDate('');
        setFilterCreator('');
    }, [activeTab]);

    // Apply filters
    useEffect(() => {
        let results = [...labResults];

        // Filter by date
        if (filterDate) {
            results = results.filter(result => {
                const resultDate = new Date(result.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
                return resultDate === filterDate;
            });
        }

        // Filter by creator
        if (filterCreator) {
            results = results.filter(result => result.createdByEmployeeName === filterCreator);
        }

        setFilteredResults(results);
    }, [filterDate, filterCreator, labResults]);

    // Format datetime
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle open enter result modal
    const handleOpenEnterResultModal = (result) => {
        setSelectedResult(result);
        setResultFormData({
            resultValue: result.resultValue || '',
            unit: result.unit || '',
            referenceRange: result.referenceRange || '',
            notes: result.notes || ''
        });
        setShowEnterResultModal(true);
    };

    // Handle close modal
    const handleCloseModal = () => {
        setShowEnterResultModal(false);
        setSelectedResult(null);
        setResultFormData({
            resultValue: '',
            unit: '',
            referenceRange: '',
            notes: ''
        });
    };

    // Handle form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setResultFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle submit result
    const handleSubmitResult = async (e) => {
        e.preventDefault();

        if (!resultFormData.resultValue.trim()) {
            alert('Vui lòng nhập giá trị kết quả');
            return;
        }

        setSubmitting(true);
        try {
            const response = await labTechnicianResultAPI.enterLabResult(
                selectedResult.labTestResultId,
                resultFormData
            );

            if (response.data) {
                alert('Nhập kết quả xét nghiệm thành công!');
                handleCloseModal();
                fetchLabResults(); // Refresh list
            }
        } catch (err) {
            alert('Không thể nhập kết quả. Vui lòng thử lại.');
            console.error('Error entering result:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle verify result
    const handleVerifyResult = async (labResultId, testName) => {
        const confirmed = window.confirm(`Bạn có chắc chắn muốn xác nhận kết quả xét nghiệm "${testName}"?`);

        if (!confirmed) return;

        try {
            const response = await labTechnicianResultAPI.verifyLabResult(labResultId);

            if (response.data) {
                alert('Xác nhận kết quả xét nghiệm thành công!');
                fetchLabResults(); // Refresh list
            }
        } catch (err) {
            alert('Không thể xác nhận kết quả. Vui lòng thử lại.');
            console.error('Error verifying result:', err);
        }
    };

    return (
        <div className="lab-test-result-page">
            <div className="page-header">
                <div className="header-content">
                    <FiFileText className="header-icon" />
                    <div>
                        <h1>Kết quả xét nghiệm</h1>
                        <p>Quản lý kết quả xét nghiệm</p>
                    </div>
                </div>
                <button className="btn-refresh" onClick={fetchLabResults} disabled={loading}>
                    <FiRefreshCw className={loading ? 'spinning' : ''} />
                    Làm mới
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <FiClock />
                    <span>Xét nghiệm chờ nhập</span>
                    {activeTab === 'pending' && labResults.length > 0 && (
                        <span className="tab-badge">{labResults.length}</span>
                    )}
                </button>
                <button
                    className={`tab-button ${activeTab === 'verification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verification')}
                >
                    <FiClipboard />
                    <span>Kết quả chờ xác nhận</span>
                    {activeTab === 'verification' && labResults.length > 0 && (
                        <span className="tab-badge">{labResults.length}</span>
                    )}
                </button>
            </div>

            {/* Filters */}
            <div className="filters-container">
                <div className="filter-group">
                    <label>Lọc theo ngày:</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="filter-input"
                    />
                </div>
                <div className="filter-group">
                    <label>Lọc theo người tạo:</label>
                    <select
                        value={filterCreator}
                        onChange={(e) => setFilterCreator(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">-- Tất cả --</option>
                        {creatorList.map((creator, index) => (
                            <option key={index} value={creator}>
                                {creator}
                            </option>
                        ))}
                    </select>
                </div>
                {(filterDate || filterCreator) && (
                    <button
                        className="btn-clear-filters"
                        onClick={() => {
                            setFilterDate('');
                            setFilterCreator('');
                        }}
                    >
                        <FiX /> Xóa bộ lọc
                    </button>
                )}
                <div className="filter-results-count">
                    Hiển thị: <strong>{filteredResults.length}</strong> / {labResults.length} kết quả
                </div>
            </div>

            <div className="page-content">
                {error && (
                    <div className="error-message">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="empty-state">
                        <FiAlertCircle className="empty-icon" />
                        <h3>
                            {labResults.length === 0
                                ? (activeTab === 'pending'
                                    ? 'Không có xét nghiệm chờ nhập'
                                    : 'Không có kết quả chờ xác nhận')
                                : 'Không tìm thấy kết quả phù hợp'}
                        </h3>
                        <p>
                            {labResults.length === 0
                                ? (activeTab === 'pending'
                                    ? 'Hiện tại không có xét nghiệm nào cần nhập kết quả'
                                    : 'Hiện tại không có kết quả nào cần xác nhận')
                                : 'Thử thay đổi bộ lọc để xem kết quả khác'}
                        </p>
                    </div>
                ) : (
                    <div className="results-table-container">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Result ID</th>
                                    <th>Order ID</th>
                                    <th>Test ID</th>
                                    <th>Tên XN</th>
                                    <th>Giá trị</th>
                                    <th>Đơn vị</th>
                                    <th>Khoảng TC</th>
                                    <th>Ghi chú</th>
                                    <th>Người tạo</th>
                                    <th>Ngày tạo</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map((result) => (
                                    <tr key={result.labTestResultId}>
                                        <td className="result-id">#{result.labTestResultId}</td>
                                        <td className="order-id">#{result.labTestOrderId}</td>
                                        <td className="test-id">#{result.medicalTestId}</td>
                                        <td className="test-name">{result.testName}</td>
                                        <td className="result-value">
                                            {result.resultValue || <span className="empty-value">Chưa có</span>}
                                        </td>
                                        <td className="unit">
                                            {result.unit || <span className="empty-value">-</span>}
                                        </td>
                                        <td className="reference-range">
                                            {result.referenceRange || <span className="empty-value">-</span>}
                                        </td>
                                        <td className="notes">
                                            {result.notes || <span className="empty-value">-</span>}
                                        </td>
                                        <td className="creator">{result.createdByEmployeeName}</td>
                                        <td className="created-at">{formatDateTime(result.createdAt)}</td>
                                        <td className="actions">
                                            {activeTab === 'pending' ? (
                                                <button
                                                    className="btn-action btn-enter"
                                                    onClick={() => handleOpenEnterResultModal(result)}
                                                    title="Nhập kết quả"
                                                >
                                                    <FiEdit /> Nhập KQ
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-action btn-verify"
                                                    onClick={() => handleVerifyResult(result.labTestResultId, result.testName)}
                                                    title="Xác nhận kết quả"
                                                >
                                                    <FiCheckCircle /> Xác nhận
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Enter Result Modal */}
            {showEnterResultModal && selectedResult && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nhập kết quả xét nghiệm</h3>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="result-info">
                                <p><strong>Tên xét nghiệm:</strong> {selectedResult.testName}</p>
                                <p><strong>Order ID:</strong> #{selectedResult.labTestOrderId}</p>
                                <p><strong>Test ID:</strong> #{selectedResult.medicalTestId}</p>
                            </div>

                            <form onSubmit={handleSubmitResult}>
                                <div className="form-group">
                                    <label>Giá trị kết quả <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="resultValue"
                                        value={resultFormData.resultValue}
                                        onChange={handleFormChange}
                                        placeholder="Nhập giá trị kết quả"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Đơn vị</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={resultFormData.unit}
                                        onChange={handleFormChange}
                                        placeholder="Ví dụ: mg/dL, mmol/L, %"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Khoảng tham chiếu</label>
                                    <input
                                        type="text"
                                        name="referenceRange"
                                        value={resultFormData.referenceRange}
                                        onChange={handleFormChange}
                                        placeholder="Ví dụ: 70-100, <5.7, 3.5-5.0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={resultFormData.notes}
                                        onChange={handleFormChange}
                                        placeholder="Nhập ghi chú (nếu có)"
                                        rows="3"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={handleCloseModal}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Đang lưu...' : 'Lưu kết quả'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabTestResultPage;

