import React, { useState, useEffect } from 'react';
import './SupplierManagementPage.css';
import { adminSupplierAPI } from '../../../../services/staff/adminAPI';
import { FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiRotateCcw, FiEye, FiSearch } from 'react-icons/fi';

const SupplierManagementPage = () => {
    // State management
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phoneNumber: '',
        address: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('active'); // 'active', 'deleted', 'all'
    const [stats, setStats] = useState({
        active: 0,
        deleted: 0,
        total: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Load suppliers on component mount
    useEffect(() => {
        loadSuppliers();
        loadStats();
    }, [viewMode]);

    // Load suppliers based on view mode
    const loadSuppliers = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (viewMode === 'active') {
                response = await adminSupplierAPI.getActiveSuppliers(page, 20);
            } else if (viewMode === 'deleted') {
                response = await adminSupplierAPI.getDeletedSuppliers(page, 20);
            } else {
                response = await adminSupplierAPI.getAllSuppliers('', page, 20);
            }

            if (response && response.data) {
                // Handle both paginated and non-paginated responses
                if (response.data.content) {
                    setSuppliers(response.data.content);
                    setPagination({
                        currentPage: response.data.page || response.data.number || 0,
                        totalPages: response.data.totalPages,
                        totalElements: response.data.totalElements,
                        pageSize: response.data.size
                    });
                } else if (Array.isArray(response.data)) {
                    setSuppliers(response.data);
                }
            }
        } catch (err) {
            console.error('Error loading suppliers:', err);
            setError('Không thể tải danh sách nhà cung cấp. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStats = async () => {
        try {
            const response = await adminSupplierAPI.getSupplierStats();
            if (response && response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    // Handle search
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadSuppliers();
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await adminSupplierAPI.searchSuppliers(searchTerm);
            if (response && response.data) {
                setSuppliers(Array.isArray(response.data) ? response.data : []);
            }
        } catch (err) {
            console.error('Error searching suppliers:', err);
            setError('Không thể tìm kiếm nhà cung cấp. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        setSearchTerm('');
        loadSuppliers();
        loadStats();
    };

    // Open modal for creating new supplier
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({
            name: '',
            contactPerson: '',
            phoneNumber: '',
            address: ''
        });
        setShowModal(true);
    };

    // Open modal for editing supplier
    const handleOpenEditModal = (supplier) => {
        setModalMode('edit');
        setSelectedSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            phoneNumber: supplier.phoneNumber,
            address: supplier.address
        });
        setShowModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSupplier(null);
        setFormData({
            name: '',
            contactPerson: '',
            phoneNumber: '',
            address: ''
        });
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate phone number (Vietnamese format)
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^0\d{9,10}$/;
        return phoneRegex.test(phone);
    };

    // Handle form submit (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            alert('❌ Vui lòng nhập tên nhà cung cấp');
            return;
        }
        if (!formData.contactPerson.trim()) {
            alert('❌ Vui lòng nhập tên người liên hệ');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            alert('❌ Vui lòng nhập số điện thoại');
            return;
        }
        if (!validatePhoneNumber(formData.phoneNumber)) {
            alert('❌ Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0)');
            return;
        }
        if (!formData.address.trim()) {
            alert('❌ Vui lòng nhập địa chỉ');
            return;
        }

        try {
            setSubmitting(true);

            if (modalMode === 'create') {
                const response = await adminSupplierAPI.createSupplier(formData);
                if (response && (response.status === 'success' || response.status === 'OK')) {
                    alert('✅ Đã tạo nhà cung cấp thành công!');
                    handleCloseModal();
                    loadSuppliers();
                    loadStats();
                }
            } else {
                const response = await adminSupplierAPI.updateSupplier(selectedSupplier.supplierId, formData);
                if (response && (response.status === 'success' || response.status === 'OK')) {
                    alert('✅ Đã cập nhật nhà cung cấp thành công!');
                    handleCloseModal();
                    loadSuppliers();
                }
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            let errorMessage = 'Không thể lưu thông tin nhà cung cấp';

            if (err.message) {
                if (err.message.includes('401')) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (err.message.includes('403')) {
                    errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
                } else if (err.message.includes('404')) {
                    errorMessage = 'Không tìm thấy nhà cung cấp.';
                } else {
                    errorMessage = err.message;
                }
            }

            alert(`❌ ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete supplier
    const handleDelete = async (supplier) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}"?`)) {
            return;
        }

        try {
            const response = await adminSupplierAPI.deleteSupplier(supplier.supplierId);
            if (response && (response.status === 'success' || response.status === 'OK')) {
                alert('✅ Đã xóa nhà cung cấp thành công!');
                loadSuppliers();
                loadStats();
            }
        } catch (err) {
            console.error('Error deleting supplier:', err);
            alert(`❌ Không thể xóa nhà cung cấp: ${err.message || 'Vui lòng thử lại'}`);
        }
    };

    // Handle restore supplier
    const handleRestore = async (supplier) => {
        if (!window.confirm(`Bạn có chắc chắn muốn khôi phục nhà cung cấp "${supplier.name}"?`)) {
            return;
        }

        try {
            const response = await adminSupplierAPI.restoreSupplier(supplier.supplierId);
            if (response && (response.status === 'success' || response.status === 'OK')) {
                alert('✅ Đã khôi phục nhà cung cấp thành công!');
                loadSuppliers();
                loadStats();
            }
        } catch (err) {
            console.error('Error restoring supplier:', err);
            alert(`❌ Không thể khôi phục nhà cung cấp: ${err.message || 'Vui lòng thử lại'}`);
        }
    };

    // Handle view detail
    const handleViewDetail = (supplier) => {
        setSelectedSupplier(supplier);
        setShowDetailModal(true);
    };

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            loadSuppliers(newPage);
        }
    };

    // Render loading state
    if (loading && suppliers.length === 0) {
        return (
            <div className="supplier-management-page">
                <div className="loading-state">
                    <p>Đang tải danh sách nhà cung cấp...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>🏢 Quản lý Nhà cung cấp</h2>
                    <p>Quản lý thông tin các nhà cung cấp thuốc và vật tư y tế</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={handleRefresh}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-primary" onClick={handleOpenCreateModal}>
                        <FiPlus /> Thêm nhà cung cấp
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
                <div className="stat-card active">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-label">Đang hoạt động</div>
                        <div className="stat-value">{stats.active}</div>
                    </div>
                </div>
                <div className="stat-card deleted">
                    <div className="stat-icon">🗑️</div>
                    <div className="stat-info">
                        <div className="stat-label">Đã xóa</div>
                        <div className="stat-value">{stats.deleted}</div>
                    </div>
                </div>
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <div className="stat-label">Tổng số</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="view-tabs">
                <button
                    className={`tab ${viewMode === 'active' ? 'active' : ''}`}
                    onClick={() => setViewMode('active')}
                >
                    Đang hoạt động ({stats.active})
                </button>
                <button
                    className={`tab ${viewMode === 'deleted' ? 'active' : ''}`}
                    onClick={() => setViewMode('deleted')}
                >
                    Đã xóa ({stats.deleted})
                </button>
                <button
                    className={`tab ${viewMode === 'all' ? 'active' : ''}`}
                    onClick={() => setViewMode('all')}
                >
                    Tất cả ({stats.total})
                </button>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-input-group">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhà cung cấp theo tên, người liên hệ, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button className="btn-search" onClick={handleSearch}>
                    <FiSearch /> Tìm kiếm
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <p>❌ {error}</p>
                </div>
            )}

            {/* Suppliers Table */}
            {suppliers.length > 0 ? (
                <div className="supplier-table-container">
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên nhà cung cấp</th>
                                <th>Người liên hệ</th>
                                <th>Số điện thoại</th>
                                <th>Địa chỉ</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier, index) => (
                                <tr key={supplier.supplierId}>
                                    <td>{pagination.currentPage * pagination.pageSize + index + 1}</td>
                                    <td><strong>{supplier.name}</strong></td>
                                    <td>{supplier.contactPerson}</td>
                                    <td>{supplier.phoneNumber}</td>
                                    <td>{supplier.address}</td>
                                    <td>{formatDateTime(supplier.createdAt)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon btn-view"
                                                onClick={() => handleViewDetail(supplier)}
                                                title="Xem chi tiết"
                                            >
                                                <FiEye />
                                            </button>
                                            {viewMode !== 'deleted' && (
                                                <>
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleOpenEditModal(supplier)}
                                                        title="Sửa"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDelete(supplier)}
                                                        title="Xóa"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            )}
                                            {viewMode === 'deleted' && (
                                                <button
                                                    className="btn-icon btn-restore"
                                                    onClick={() => handleRestore(supplier)}
                                                    title="Khôi phục"
                                                >
                                                    <FiRotateCcw />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>📦 Không có nhà cung cấp nào</p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="btn-page"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 0 || loading}
                    >
                        ← Trang trước
                    </button>
                    <span className="page-info">
                        Trang {pagination.currentPage + 1} / {pagination.totalPages}
                        {' '}({pagination.totalElements} nhà cung cấp)
                    </span>
                    <button
                        className="btn-page"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                    >
                        Trang sau →
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? '➕ Thêm nhà cung cấp mới' : '✏️ Sửa thông tin nhà cung cấp'}</h3>
                            <button className="btn-close" onClick={handleCloseModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Tên nhà cung cấp <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên nhà cung cấp"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contactPerson">Người liên hệ <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="contactPerson"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên người liên hệ"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Số điện thoại <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số điện thoại (VD: 0901234567)"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Địa chỉ <span className="required">*</span></label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Nhập địa chỉ đầy đủ"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang lưu...' : (modalMode === 'create' ? 'Tạo mới' : 'Cập nhật')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedSupplier && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>👁️ Chi tiết nhà cung cấp</h3>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="detail-label">Mã nhà cung cấp:</span>
                                <span className="detail-value">{selectedSupplier.supplierId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Tên nhà cung cấp:</span>
                                <span className="detail-value"><strong>{selectedSupplier.name}</strong></span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Người liên hệ:</span>
                                <span className="detail-value">{selectedSupplier.contactPerson}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Số điện thoại:</span>
                                <span className="detail-value">{selectedSupplier.phoneNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Địa chỉ:</span>
                                <span className="detail-value">{selectedSupplier.address}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ngày tạo:</span>
                                <span className="detail-value">{formatDateTime(selectedSupplier.createdAt)}</span>
                            </div>
                            {selectedSupplier.updatedAt && (
                                <div className="detail-row">
                                    <span className="detail-label">Ngày cập nhật:</span>
                                    <span className="detail-value">{formatDateTime(selectedSupplier.updatedAt)}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="detail-label">Trạng thái:</span>
                                <span className={`detail-value status ${selectedSupplier.isDeleted ? 'deleted' : 'active'}`}>
                                    {selectedSupplier.isDeleted ? '🗑️ Đã xóa' : '✅ Đang hoạt động'}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagementPage;

