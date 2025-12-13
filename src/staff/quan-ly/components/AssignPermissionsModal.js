import React, { useState, useEffect } from 'react';
import './AssignPermissionsModal.css';
import { FiX, FiCheck, FiSearch, FiShield, FiAlertCircle } from 'react-icons/fi';
import { adminRoleAPI } from '../../../services/staff/adminAPI';

const AssignPermissionsModal = ({ isOpen, onClose, role, onSuccess }) => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && role) {
      fetchData();
    }
  }, [isOpen, role]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Fetch all permissions
      const permissionsResponse = await adminRoleAPI.getAllPermissions();
      if (permissionsResponse && permissionsResponse.data) {
        setAllPermissions(permissionsResponse.data);
      }

      // Fetch current role permissions
      const rolePermissionsResponse = await adminRoleAPI.getRolePermissions(role.roleId);
      if (rolePermissionsResponse && rolePermissionsResponse.data) {
        setCurrentPermissions(rolePermissionsResponse.data);
        // Pre-select current permissions
        const currentIds = rolePermissionsResponse.data.map(p => p.permissionId);
        setSelectedPermissionIds(currentIds);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải danh sách permissions. Vui lòng thử lại!');
    } finally {
      setLoadingData(false);
    }
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredPermissions = getFilteredPermissions();
    const allIds = filteredPermissions.map(p => p.permissionId);
    setSelectedPermissionIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds([]);
  };

  const getFilteredPermissions = () => {
    if (!searchTerm.trim()) {
      return allPermissions;
    }
    const search = searchTerm.toLowerCase();
    return allPermissions.filter(p => 
      p.permissionName.toLowerCase().includes(search) ||
      (p.resource && p.resource.toLowerCase().includes(search)) ||
      (p.action && p.action.toLowerCase().includes(search))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPermissionIds.length === 0) {
      setError('Vui lòng chọn ít nhất một permission');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminRoleAPI.assignPermissionsToRole(
        role.roleId,
        selectedPermissionIds
      );

      if (response && response.status === 'OK') {
        alert(`Đã gán ${selectedPermissionIds.length} permissions cho role "${role.roleName}" thành công!`);
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error assigning permissions:', err);
      setError(err.message || 'Không thể gán permissions. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !role) return null;

  const filteredPermissions = getFilteredPermissions();
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const resource = perm.resource || 'other';
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(perm);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-permissions-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2><FiShield /> Gán Permissions cho Role</h2>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            <FiX />
          </button>
        </div>

        {/* Role Info */}
        <div className="role-info-banner">
          <div>
            <strong>Role:</strong> {role.roleName}
          </div>
          <div>
            <strong>ID:</strong> {role.roleId}
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                <FiAlertCircle /> {error}
              </div>
            )}

            {loadingData ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải danh sách permissions...</p>
              </div>
            ) : (
              <>
                {/* Search and Actions */}
                <div className="permissions-controls">
                  <div className="search-box">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Tìm kiếm permission..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="bulk-actions">
                    <button
                      type="button"
                      className="btn-select-all"
                      onClick={handleSelectAll}
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      className="btn-deselect-all"
                      onClick={handleDeselectAll}
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>

                {/* Selected Count */}
                <div className="selected-count">
                  Đã chọn: <strong>{selectedPermissionIds.length}</strong> / {allPermissions.length} permissions
                </div>

                {/* Permissions List */}
                <div className="permissions-list">
                  {filteredPermissions.length === 0 ? (
                    <div className="empty-state">
                      <FiAlertCircle />
                      <p>Không tìm thấy permission nào</p>
                    </div>
                  ) : (
                    Object.keys(groupedPermissions).sort().map(resource => (
                      <div key={resource} className="permission-group">
                        <h4 className="group-title">
                          {resource.toUpperCase()} ({groupedPermissions[resource].length})
                        </h4>
                        <div className="permission-items">
                          {groupedPermissions[resource].map(permission => (
                            <label
                              key={permission.permissionId}
                              className={`permission-item ${selectedPermissionIds.includes(permission.permissionId) ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissionIds.includes(permission.permissionId)}
                                onChange={() => handleTogglePermission(permission.permissionId)}
                              />
                              <div className="permission-info">
                                <span className="permission-name">{permission.permissionName}</span>
                                {permission.action && (
                                  <span className="permission-action">{permission.action}</span>
                                )}
                              </div>
                              {selectedPermissionIds.includes(permission.permissionId) && (
                                <FiCheck className="check-icon" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || loadingData || selectedPermissionIds.length === 0}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Đang gán...
                </>
              ) : (
                <>
                  <FiCheck /> Gán Permissions ({selectedPermissionIds.length})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignPermissionsModal;

