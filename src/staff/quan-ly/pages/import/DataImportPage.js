import React, { useState, useEffect } from 'react';
import { FiUpload, FiDownload, FiFileText, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiFilter, FiX } from 'react-icons/fi';
import { adminDataImportAPI } from '../../../../services/staff/adminAPI';
import './DataImportPage.css';

const DataImportPage = () => {
    const [activeTab, setActiveTab] = useState('medicines'); // medicines, services, supplies, history
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [historyFilters, setHistoryFilters] = useState({
        type: '',
        startDate: '',
        endDate: '',
    });
    const [historyPagination, setHistoryPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async (page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                ...historyFilters,
                page,
                size: historyPagination.size,
            };

            const response = await adminDataImportAPI.getImportHistory(params);
            if (response && response.data) {
                setHistory(response.data.content || []);
                setHistoryPagination({
                    page: page,
                    size: historyPagination.size,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                });
            }
        } catch (err) {
            setError(err.message || 'Không thể tải lịch sử import');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
                return;
            }
            setSelectedFile(file);
            setError(null);
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn file để upload');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setUploadResult(null);

        try {
            let response;
            if (activeTab === 'medicines') {
                response = await adminDataImportAPI.importMedicines(selectedFile);
            } else if (activeTab === 'services') {
                response = await adminDataImportAPI.importServices(selectedFile);
            } else if (activeTab === 'supplies') {
                response = await adminDataImportAPI.importSupplies(selectedFile);
            }

            if (response && response.data) {
                setUploadResult(response.data);
                setSuccess(`Import thành công ${response.data.successCount}/${response.data.totalRows} dòng`);
                setSelectedFile(null);
                // Reset file input
                document.getElementById('file-input').value = '';
            }
        } catch (err) {
            setError(err.message || 'Import thất bại');
        } finally {
            setLoading(false);
        }
    };

    const clearHistoryFilters = () => {
        setHistoryFilters({ type: '', startDate: '', endDate: '' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getImportTypeLabel = (type) => {
        const labels = {
            MEDICINE: 'Thuốc',
            SERVICE: 'Dịch vụ',
            MATERIAL: 'Vật tư',
            SUPPLY: 'Vật tư',
        };
        return labels[type] || type;
    };

    const downloadTemplate = (type) => {
        // This would download Excel template
        alert(`Download template for ${type}`);
    };

    return (
        <div className="data-import-page">
            <div className="page-header">
                <h2><FiUpload /> Data Import</h2>
                <p>Import dữ liệu từ file Excel</p>
            </div>

            {/* Tabs */}
            <div className="import-tabs">
                <button className={activeTab === 'medicines' ? 'active' : ''} onClick={() => setActiveTab('medicines')}>
                    <FiFileText /> Import Medicines
                </button>
                <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
                    <FiFileText /> Import Services
                </button>
                <button className={activeTab === 'supplies' ? 'active' : ''} onClick={() => setActiveTab('supplies')}>
                    <FiFileText /> Import Supplies
                </button>
                <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                    <FiClock /> Import History
                </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="alert alert-error">
                    <FiXCircle /> {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <FiCheckCircle /> {success}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Đang xử lý...</p>
                </div>
            )}

            {/* Upload Section */}
            {activeTab !== 'history' && (
                <div className="upload-section">
                    <div className="upload-header">
                        <h3>Upload File Excel</h3>
                        <button className="btn-download-template" onClick={() => downloadTemplate(activeTab)}>
                            <FiDownload /> Download Template
                        </button>
                    </div>

                    {/* Excel Format Guide */}
                    <div className="format-guide">
                        <h4>📋 Định dạng file Excel:</h4>
                        {activeTab === 'medicines' && (
                            <table className="format-table">
                                <thead>
                                    <tr>
                                        <th>Column</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Mã thuốc</td><td>String</td><td>✅</td><td>MED001</td></tr>
                                    <tr><td>Tên thuốc</td><td>String</td><td>✅</td><td>Paracetamol 500mg</td></tr>
                                    <tr><td>Hoạt chất</td><td>String</td><td>✅</td><td>Paracetamol</td></tr>
                                    <tr><td>Đơn vị</td><td>String</td><td>✅</td><td>Viên</td></tr>
                                    <tr><td>Giá nhập</td><td>Number</td><td>✅</td><td>500</td></tr>
                                    <tr><td>Giá bán</td><td>Number</td><td>✅</td><td>800</td></tr>
                                    <tr><td>Nhà sản xuất</td><td>String</td><td>❌</td><td>Sanofi</td></tr>
                                    <tr><td>Nước sản xuất</td><td>String</td><td>❌</td><td>Vietnam</td></tr>
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'services' && (
                            <table className="format-table">
                                <thead>
                                    <tr>
                                        <th>Column</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Mã dịch vụ</td><td>String</td><td>✅</td><td>SRV001</td></tr>
                                    <tr><td>Tên dịch vụ</td><td>String</td><td>✅</td><td>Khám nội tổng quát</td></tr>
                                    <tr><td>Loại dịch vụ</td><td>String</td><td>✅</td><td>CONSULTATION</td></tr>
                                    <tr><td>Giá</td><td>Number</td><td>✅</td><td>200000</td></tr>
                                    <tr><td>Mô tả</td><td>String</td><td>❌</td><td>Khám bệnh nội khoa</td></tr>
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'supplies' && (
                            <table className="format-table">
                                <thead>
                                    <tr>
                                        <th>Column</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Mã vật tư</td><td>String</td><td>✅</td><td>SUP001</td></tr>
                                    <tr><td>Tên vật tư</td><td>String</td><td>✅</td><td>Băng gạc vô trùng</td></tr>
                                    <tr><td>Đơn vị</td><td>String</td><td>✅</td><td>Gói</td></tr>
                                    <tr><td>Giá nhập</td><td>Number</td><td>✅</td><td>5000</td></tr>
                                    <tr><td>Giá bán</td><td>Number</td><td>✅</td><td>8000</td></tr>
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="file-upload-area">
                        <input
                            type="file"
                            id="file-input"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="file-input" className="file-upload-label">
                            <FiUpload size={48} />
                            <p>Click để chọn file Excel</p>
                            <span>.xlsx hoặc .xls</span>
                        </label>
                        {selectedFile && (
                            <div className="selected-file">
                                <FiFileText />
                                <span>{selectedFile.name}</span>
                                <span className="file-size">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                            </div>
                        )}
                    </div>

                    <button className="btn-upload" onClick={handleUpload} disabled={!selectedFile || loading}>
                        <FiUpload /> Upload và Import
                    </button>

                    {/* Upload Result */}
                    {uploadResult && (
                        <div className="upload-result">
                            <h3>📊 Kết quả Import</h3>
                            <div className="result-stats">
                                <div className="stat-card total">
                                    <div className="stat-label">Tổng số dòng</div>
                                    <div className="stat-value">{uploadResult.totalRows}</div>
                                </div>
                                <div className="stat-card success">
                                    <div className="stat-label">Thành công</div>
                                    <div className="stat-value">{uploadResult.successCount}</div>
                                </div>
                                <div className="stat-card failed">
                                    <div className="stat-label">Thất bại</div>
                                    <div className="stat-value">{uploadResult.failedCount}</div>
                                </div>
                                <div className="stat-card skipped">
                                    <div className="stat-label">Bỏ qua</div>
                                    <div className="stat-value">{uploadResult.skippedCount || 0}</div>
                                </div>
                            </div>

                            <div className="result-info">
                                <div className="info-item">
                                    <span>File:</span>
                                    <strong>{uploadResult.fileName}</strong>
                                </div>
                                <div className="info-item">
                                    <span>Import by:</span>
                                    <strong>{uploadResult.importedBy}</strong>
                                </div>
                                <div className="info-item">
                                    <span>Import at:</span>
                                    <strong>{formatDateTime(uploadResult.importedAt)}</strong>
                                </div>
                                <div className="info-item">
                                    <span>Duration:</span>
                                    <strong>{uploadResult.durationMs} ms</strong>
                                </div>
                            </div>

                            {/* Errors */}
                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div className="errors-section">
                                    <h4><FiAlertCircle /> Lỗi ({uploadResult.errors.length})</h4>
                                    <div className="errors-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Row</th>
                                                    <th>Field</th>
                                                    <th>Value</th>
                                                    <th>Error Message</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uploadResult.errors.map((err, index) => (
                                                    <tr key={index}>
                                                        <td>{err.rowNumber}</td>
                                                        <td>{err.fieldName}</td>
                                                        <td className="error-value">{err.value}</td>
                                                        <td className="error-message">{err.errorMessage}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* History Section */}
            {activeTab === 'history' && (
                <div className="history-section">
                    {/* Filters */}
                    <div className="search-filters">
                        <h3><FiFilter /> Bộ lọc</h3>
                        <div className="filters-grid">
                            <div className="filter-item">
                                <label>Loại Import</label>
                                <select value={historyFilters.type} onChange={(e) => setHistoryFilters({...historyFilters, type: e.target.value})}>
                                    <option value="">Tất cả</option>
                                    <option value="MEDICINE">Thuốc</option>
                                    <option value="SERVICE">Dịch vụ</option>
                                    <option value="MATERIAL">Vật tư</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>Start Date</label>
                                <input type="datetime-local" value={historyFilters.startDate} onChange={(e) => setHistoryFilters({...historyFilters, startDate: e.target.value})} />
                            </div>
                            <div className="filter-item">
                                <label>End Date</label>
                                <input type="datetime-local" value={historyFilters.endDate} onChange={(e) => setHistoryFilters({...historyFilters, endDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn-search" onClick={() => fetchHistory(0)}>
                                <FiFilter /> Tìm kiếm
                            </button>
                            <button className="btn-clear" onClick={clearHistoryFilters}>
                                <FiX /> Xóa bộ lọc
                            </button>
                        </div>
                    </div>

                    {/* History Table */}
                    {history.length > 0 && (
                        <div className="results-section">
                            <div className="results-header">
                                <h3>Lịch sử Import ({historyPagination.totalElements} records)</h3>
                                <span>Trang {historyPagination.page + 1} / {historyPagination.totalPages}</span>
                            </div>
                            <div className="history-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Import Type</th>
                                            <th>File Name</th>
                                            <th>Total Rows</th>
                                            <th>Success</th>
                                            <th>Failed</th>
                                            <th>Imported By</th>
                                            <th>Imported At</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span className={`badge badge-${item.importType.toLowerCase()}`}>
                                                        {getImportTypeLabel(item.importType)}
                                                    </span>
                                                </td>
                                                <td className="file-name">{item.fileName}</td>
                                                <td>{item.totalRows}</td>
                                                <td className="text-success">{item.successCount}</td>
                                                <td className="text-danger">{item.failedCount}</td>
                                                <td>{item.importedBy}</td>
                                                <td>{formatDateTime(item.importedAt)}</td>
                                                <td>{item.durationMs} ms</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {historyPagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button onClick={() => fetchHistory(historyPagination.page - 1)} disabled={historyPagination.page === 0}>
                                        Trước
                                    </button>
                                    <span>Trang {historyPagination.page + 1} / {historyPagination.totalPages}</span>
                                    <button onClick={() => fetchHistory(historyPagination.page + 1)} disabled={historyPagination.page >= historyPagination.totalPages - 1}>
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {history.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiClock />
                            <p>Chưa có lịch sử import</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataImportPage;


