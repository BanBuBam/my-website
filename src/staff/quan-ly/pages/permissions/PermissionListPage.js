import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PermissionListPage.css';
import {
    FiShield, FiPlus, FiRefreshCw, FiAlertCircle,
    FiInfo, FiEdit2, FiTrash2, FiSearch, FiFilter
} from 'react-icons/fi';
import { adminPermissionAPI } from '../../../../services/staff/adminAPI';
import CreatePermissionModal from '../../components/CreatePermissionModal';
import EditPermissionModal from '../../components/EditPermissionModal';
import ViewPermissionDetailModal from '../../components/ViewPermissionDetailModal';

const PermissionListPage = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterResource, setFilterResource] = useState('all');
    const [filterAction, setFilterAction] = useState('all');
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deletingPermissionId, setDeletingPermissionId] = useState(null);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminPermissionAPI.getPermissions();
            
            if (response && response.data) {
                setPermissions(response.data);
            }
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError(err.message || 'Không thể tải danh sách permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePermission = async (permissionId, permissionName) => {
        const confirmMessage = `Bạn có chắc chắn muốn xóa permission "${permissionName}"?\n\nLưu ý: Hành động này không thể hoàn tác!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setDeletingPermissionId(permissionId);
            const response = await adminPermissionAPI.deletePermission(permissionId);

            if (response && response.status === 'OK') {
                alert('Xóa permission thành công!');
                fetchPermissions();
            }
        } catch (err) {
            console.error('Error deleting permission:', err);
            alert(err.message || 'Không thể xóa permission. Vui lòng thử lại!');
        } finally {
            setDeletingPermissionId(null);
        }
    };

    const handleCreateSuccess = () => {
        fetchPermissions();
    };

    const handleEditSuccess = () => {
        fetchPermissions();
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedPermission(null);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedPermission(null);
    };

    // Get unique resources and actions for filters
    const uniqueResources = [...new Set(permissions.map(p => p.resource))].sort();
    const uniqueActions = [...new Set(permissions.map(p => p.action))].sort();

    // Filter permissions
    const filteredPermissions = permissions.filter(permission => {
        const matchesSearch = 
            permission.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.action.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesResource = filterResource === 'all' || permission.resource === filterResource;
        const matchesAction = filterAction === 'all' || permission.action === filterAction;

        return matchesSearch && matchesResource && matchesAction;
    });

    // Group permissions by resource
    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
        const resource = permission.resource;
        if (!acc[resource]) {
            acc[resource] = [];
        }
        acc[resource].push(permission);
        return acc;
    }, {});

    // Calculate stats
    const stats = {
        total: permissions.length,
        filtered: filteredPermissions.length,
        resources: uniqueResources.length,
        actions: uniqueActions.length,
    };

    return (
        <div className="permission-list-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <FiShield className="page-icon" />
                    <div>
                        <h1>Quản lý Permissions</h1>
                        <p>Quản lý tất cả permissions trong hệ thống</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchPermissions} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                    <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>
                        <FiPlus />
                        Tạo Permission mới
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FiShield />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Tổng Permissions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <FiFilter />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.filtered}</div>
                        <div className="stat-label">Đang hiển thị</div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="filters-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm permission..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filterResource}
                        onChange={(e) => setFilterResource(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Tất cả Resource</option>
                        {uniqueResources.map(resource => (
                            <option key={resource} value={resource}>{resource}</option>
                        ))}
                    </select>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Tất cả Action</option>
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                    <button onClick={fetchPermissions}>Thử lại</button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách permissions...</p>
                </div>
            )}

            {/* Permissions List */}
            {!loading && !error && (
                <div className="permissions-container">
                    {filteredPermissions.length === 0 ? (
                        <div className="empty-state">
                            <FiShield />
                            <p>Không tìm thấy permission nào</p>
                        </div>
                    ) : (
                        <div className="permissions-grouped">
                            {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                <div key={resource} className="resource-group">
                                    <div className="resource-header">
                                        <h3>{resource}</h3>
                                        <span className="resource-count">{perms.length} permissions</span>
                                    </div>
                                    <div className="permissions-grid">
                                        {perms.map(permission => (
                                            <div key={permission.permissionId} className="permission-card">
                                                <div className="permission-header">
                                                    <div className="permission-name-section">
                                                        <FiShield className="permission-icon" />
                                                        <div>
                                                            <h4>{permission.permissionName}</h4>
                                                            <span className="permission-id">ID: {permission.permissionId}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`action-badge ${permission.action}`}>
                                                        {permission.action}
                                                    </span>
                                                </div>
                                                <div className="permission-meta">
                                                    <span className="meta-item">
                                                        <strong>Resource:</strong> {permission.resource}
                                                    </span>
                                                    {permission.createdAt && (
                                                        <span className="meta-item">
                                                            <strong>Tạo lúc:</strong> {new Date(permission.createdAt).toLocaleString('vi-VN')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="permission-actions">
                                                    <button
                                                        className="btn-view-detail"
                                                        onClick={() => {
                                                            setSelectedPermission(permission);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FiInfo /> Chi tiết
                                                    </button>
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => {
                                                            setSelectedPermission(permission);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        title="Chỉnh sửa permission"
                                                    >
                                                        <FiEdit2 /> Sửa
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeletePermission(permission.permissionId, permission.permissionName)}
                                                        disabled={deletingPermissionId === permission.permissionId}
                                                        title="Xóa permission"
                                                    >
                                                        {deletingPermissionId === permission.permissionId ? (
                                                            <>
                                                                <div className="spinner-small"></div>
                                                                Đang xóa...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiTrash2 /> Xóa
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <CreatePermissionModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSuccess={handleCreateSuccess}
            />

            <EditPermissionModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                permission={selectedPermission}
                onSuccess={handleEditSuccess}
            />

            <ViewPermissionDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                permission={selectedPermission}
            />
        </div>
    );
};

export default PermissionListPage;


