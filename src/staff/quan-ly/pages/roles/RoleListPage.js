import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleListPage.css';
import {
    FiShield, FiUsers, FiEye, FiPlus, FiRefreshCw,
    FiAlertCircle, FiClock, FiInfo, FiEdit2, FiTrash2, FiLock, FiX
} from 'react-icons/fi';
import { adminRoleAPI } from '../../../../services/staff/adminAPI';
import ViewRoleDetailModal from '../../components/ViewRoleDetailModal';
import EditRoleModal from '../../components/EditRoleModal';
import CreateRoleModal from '../../components/CreateRoleModal';
import AssignPermissionsModal from '../../components/AssignPermissionsModal';

const RoleListPage = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRoles, setExpandedRoles] = useState({});
    const [loadingPermissions, setLoadingPermissions] = useState({});
    const [rolePermissions, setRolePermissions] = useState({});
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignPermissionsModalOpen, setIsAssignPermissionsModalOpen] = useState(false);
    const [deletingRoleId, setDeletingRoleId] = useState(null);
    const [removingPermission, setRemovingPermission] = useState({});

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminRoleAPI.getRoles();
            
            if (response && response.data) {
                setRoles(response.data);
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError(err.message || 'Không thể tải danh sách role');
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRolePermissions = async (roleId) => {
        if (rolePermissions[roleId]) {
            // Already loaded, just toggle
            setExpandedRoles(prev => ({
                ...prev,
                [roleId]: !prev[roleId]
            }));
            return;
        }

        try {
            setLoadingPermissions(prev => ({ ...prev, [roleId]: true }));
            const response = await adminRoleAPI.getRolePermissions(roleId);
            
            if (response && response.data) {
                setRolePermissions(prev => ({
                    ...prev,
                    [roleId]: response.data
                }));
                setExpandedRoles(prev => ({
                    ...prev,
                    [roleId]: true
                }));
            }
        } catch (err) {
            console.error('Error fetching role permissions:', err);
            alert(err.message || 'Không thể tải danh sách quyền');
        } finally {
            setLoadingPermissions(prev => ({ ...prev, [roleId]: false }));
        }
    };

    const toggleRoleExpansion = (roleId) => {
        if (expandedRoles[roleId]) {
            // Collapse
            setExpandedRoles(prev => ({
                ...prev,
                [roleId]: false
            }));
        } else {
            // Expand and fetch permissions
            fetchRolePermissions(roleId);
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

    const getRoleDisplayName = (roleName) => {
        const roleMap = {
            'DOCTOR': 'Bác sĩ',
            'NURSE': 'Y tá',
            'LAB_TECH': 'Kỹ thuật viên XN',
            'CASHIER': 'Thu ngân',
            'ADMIN': 'Quản trị viên',
            'HR_MANAGER': 'Quản lý Nhân sự',
            'RECEPTIONIST': 'Lễ tân',
            'PHARMACIST': 'Dược sĩ',
        };
        return roleMap[roleName] || roleName;
    };

    const groupPermissionsByResource = (permissions) => {
        if (!permissions || permissions.length === 0) return {};

        const grouped = {};
        permissions.forEach(perm => {
            if (!grouped[perm.resource]) {
                grouped[perm.resource] = [];
            }
            grouped[perm.resource].push(perm);
        });
        return grouped;
    };

    const handleViewRoleDetail = (roleId) => {
        setSelectedRoleId(roleId);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedRoleId(null);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedRole(null);
    };

    const handleEditSuccess = () => {
        fetchRoles();
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateSuccess = () => {
        fetchRoles();
    };

    const handleOpenAssignPermissionsModal = (role) => {
        setSelectedRole(role);
        setIsAssignPermissionsModalOpen(true);
    };

    const handleCloseAssignPermissionsModal = () => {
        setIsAssignPermissionsModalOpen(false);
        setSelectedRole(null);
    };

    const handleAssignPermissionsSuccess = () => {
        // Refresh permissions for the role if it's expanded
        if (selectedRole && expandedRoles[selectedRole.roleId]) {
            fetchRolePermissions(selectedRole.roleId);
        }
    };

    const handleRemovePermission = async (roleId, roleName, permissionId, permissionName) => {
        const confirmMessage = `Bạn có chắc chắn muốn xóa permission "${permissionName}" khỏi role "${roleName}"?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setRemovingPermission({ [`${roleId}-${permissionId}`]: true });
            const response = await adminRoleAPI.removePermissionFromRole(roleId, permissionId);

            if (response && response.status === 'OK') {
                alert('Xóa permission thành công!');
                // Refresh permissions for this role
                fetchRolePermissions(roleId);
            }
        } catch (err) {
            console.error('Error removing permission:', err);
            alert(err.message || 'Không thể xóa permission. Vui lòng thử lại!');
        } finally {
            setRemovingPermission({ [`${roleId}-${permissionId}`]: false });
        }
    };

    const handleRemoveAllPermissions = async (roleId, roleName) => {
        const confirmMessage = `Bạn có chắc chắn muốn xóa TẤT CẢ permissions khỏi role "${roleName}"?\n\nLưu ý: Hành động này không thể hoàn tác!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await adminRoleAPI.removeAllPermissionsFromRole(roleId);

            if (response && response.status === 'OK') {
                alert('Đã xóa tất cả permissions thành công!');
                // Refresh permissions for this role
                fetchRolePermissions(roleId);
            }
        } catch (err) {
            console.error('Error removing all permissions:', err);
            alert(err.message || 'Không thể xóa permissions. Vui lòng thử lại!');
        }
    };

    const handleDeleteRole = async (roleId, roleName) => {
        const confirmMessage = `Bạn có chắc chắn muốn xóa role "${roleName}"?\n\nLưu ý: Hành động này không thể hoàn tác!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setDeletingRoleId(roleId);
            const response = await adminRoleAPI.deleteRole(roleId);

            if (response && response.status === 'OK') {
                alert('Xóa role thành công!');
                fetchRoles();
            }
        } catch (err) {
            console.error('Error deleting role:', err);
            alert(err.message || 'Không thể xóa role. Vui lòng thử lại!');
        } finally {
            setDeletingRoleId(null);
        }
    };

    // Calculate stats
    const stats = {
        total: roles.length,
        totalEmployees: roles.reduce((sum, role) => sum + (role.employeeCount || 0), 0),
        activeRoles: roles.filter(r => r.employeeCount > 0).length,
    };

    return (
        <div className="role-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Danh sách Role</h2>
                    <p>Quản lý các vai trò và quyền truy cập trong hệ thống</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchRoles}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-create" onClick={handleOpenCreateModal}>
                        <FiPlus /> Tạo Role mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe' }}>
                        <FiShield style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Tổng số Role</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7' }}>
                        <FiUsers style={{ color: '#10b981' }} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalEmployees}</div>
                        <div className="stat-label">Tổng nhân viên</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7' }}>
                        <FiShield style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.activeRoles}</div>
                        <div className="stat-label">Role đang dùng</div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle /> {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách role...</p>
                </div>
            )}

            {/* Roles List */}
            {!loading && !error && roles.length > 0 && (
                <div className="roles-container">
                    {roles.map((role) => (
                        <div key={role.roleId} className="role-card">
                            <div className="role-header">
                                <div className="role-info">
                                    <div className="role-name">
                                        <FiShield />
                                        <h3>{getRoleDisplayName(role.roleName)}</h3>
                                        <span className="role-code">({role.roleName})</span>
                                    </div>
                                    <div className="role-meta">
                                        <span className="employee-count">
                                            <FiUsers /> {role.employeeCount} nhân viên
                                        </span>
                                        <span className="created-date">
                                            <FiClock /> Tạo: {formatDateTime(role.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="role-actions">
                                    <button
                                        className="btn-view-detail"
                                        onClick={() => handleViewRoleDetail(role.roleId)}
                                        title="Xem chi tiết role"
                                    >
                                        <FiInfo /> Chi tiết
                                    </button>
                                    <button
                                        className="btn-view-permissions"
                                        onClick={() => toggleRoleExpansion(role.roleId)}
                                        disabled={loadingPermissions[role.roleId]}
                                    >
                                        {loadingPermissions[role.roleId] ? (
                                            <>Đang tải...</>
                                        ) : expandedRoles[role.roleId] ? (
                                            <>Ẩn quyền</>
                                        ) : (
                                            <><FiEye /> Xem quyền</>
                                        )}
                                    </button>
                                    <button
                                        className="btn-assign-permissions"
                                        onClick={() => handleOpenAssignPermissionsModal(role)}
                                        title="Gán permissions cho role"
                                    >
                                        <FiLock /> Gán quyền
                                    </button>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEditRole(role)}
                                        title="Chỉnh sửa role"
                                    >
                                        <FiEdit2 /> Sửa
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteRole(role.roleId, role.roleName)}
                                        disabled={deletingRoleId === role.roleId}
                                        title="Xóa role"
                                    >
                                        {deletingRoleId === role.roleId ? (
                                            <>Đang xóa...</>
                                        ) : (
                                            <><FiTrash2 /> Xóa</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Permissions Section */}
                            {expandedRoles[role.roleId] && rolePermissions[role.roleId] && (
                                <div className="permissions-section">
                                    <div className="permissions-header">
                                        <h4>Danh sách quyền ({rolePermissions[role.roleId].length})</h4>
                                        {rolePermissions[role.roleId].length > 0 && (
                                            <button
                                                className="btn-remove-all-permissions"
                                                onClick={() => handleRemoveAllPermissions(role.roleId, role.roleName)}
                                                title="Xóa tất cả permissions"
                                            >
                                                <FiTrash2 /> Xóa tất cả
                                            </button>
                                        )}
                                    </div>
                                    {rolePermissions[role.roleId].length === 0 ? (
                                        <p className="no-permissions">Role này chưa có quyền nào</p>
                                    ) : (
                                        <div className="permissions-grid">
                                            {Object.entries(groupPermissionsByResource(rolePermissions[role.roleId])).map(([resource, perms]) => (
                                                <div key={resource} className="permission-group">
                                                    <div className="permission-group-header">
                                                        <strong>{resource}</strong>
                                                        <span className="permission-count">{perms.length} quyền</span>
                                                    </div>
                                                    <div className="permission-list">
                                                        {perms.map(perm => (
                                                            <div key={perm.permissionId} className="permission-item">
                                                                <div className="permission-info">
                                                                    <span className="permission-name">{perm.permissionName}</span>
                                                                    <span className="permission-action">{perm.action}</span>
                                                                </div>
                                                                <button
                                                                    className="btn-remove-permission"
                                                                    onClick={() => handleRemovePermission(role.roleId, role.roleName, perm.permissionId, perm.permissionName)}
                                                                    disabled={removingPermission[`${role.roleId}-${perm.permissionId}`]}
                                                                    title="Xóa permission này"
                                                                >
                                                                    {removingPermission[`${role.roleId}-${perm.permissionId}`] ? (
                                                                        <div className="spinner-tiny"></div>
                                                                    ) : (
                                                                        <FiX />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && roles.length === 0 && (
                <div className="empty-state">
                    <FiShield />
                    <p>Không có role nào trong hệ thống</p>
                </div>
            )}

            {/* View Role Detail Modal */}
            <ViewRoleDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                roleId={selectedRoleId}
            />

            {/* Edit Role Modal */}
            <EditRoleModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                role={selectedRole}
                onSuccess={handleEditSuccess}
            />

            {/* Create Role Modal */}
            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSuccess={handleCreateSuccess}
            />

            {/* Assign Permissions Modal */}
            <AssignPermissionsModal
                isOpen={isAssignPermissionsModalOpen}
                onClose={handleCloseAssignPermissionsModal}
                role={selectedRole}
                onSuccess={handleAssignPermissionsSuccess}
            />
        </div>
    );
};

export default RoleListPage;

