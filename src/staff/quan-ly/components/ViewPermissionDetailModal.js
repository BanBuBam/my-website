import React, { useState, useEffect } from 'react';
import './ViewPermissionDetailModal.css';
import { FiX, FiShield, FiAlertCircle, FiClock } from 'react-icons/fi';
import { adminPermissionAPI } from '../../../services/staff/adminAPI';

const ViewPermissionDetailModal = ({ isOpen, onClose, permission }) => {
    const [permissionDetail, setPermissionDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && permission) {
            fetchPermissionDetail();
        }
    }, [isOpen, permission]);

    const fetchPermissionDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await adminPermissionAPI.getPermissionById(permission.permissionId);
            
            if (response && response.data) {
                setPermissionDetail(response.data);
            }
        } catch (err) {
            console.error('Error fetching permission detail:', err);
            setError(err.message || 'Không thể tải thông tin permission');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPermissionDetail(null);
        setError(null);
        onClose();
    };

    if (!isOpen || !permission) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content view-permission-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiShield />
                        <h2>Chi tiết Permission</h2>
                    </div>
                    <button className="btn-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải thông tin...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <FiAlertCircle />
                            <p>{error}</p>
                            <button onClick={fetchPermissionDetail}>Thử lại</button>
                        </div>
                    )}

                    {!loading && !error && permissionDetail && (
                        <div className="permission-details">
                            <div className="detail-header">
                                <div className="permission-name-large">
                                    <FiShield />
                                    {permissionDetail.permissionName}
                                </div>
                                <span className={`action-badge-large ${permissionDetail.action}`}>
                                    {permissionDetail.action}
                                </span>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Permission ID</span>
                                    <span className="detail-value">{permissionDetail.permissionId}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Permission Name</span>
                                    <span className="detail-value">{permissionDetail.permissionName}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Resource</span>
                                    <span className="detail-value resource-badge">{permissionDetail.resource}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Action</span>
                                    <span className="detail-value action-text">{permissionDetail.action}</span>
                                </div>

                                {permissionDetail.createdAt && (
                                    <div className="detail-item full-width">
                                        <span className="detail-label">
                                            <FiClock /> Ngày tạo
                                        </span>
                                        <span className="detail-value">
                                            {new Date(permissionDetail.createdAt).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="info-section">
                                <h4>📋 Thông tin</h4>
                                <p>Permission này cho phép thực hiện hành động <strong>{permissionDetail.action}</strong> trên resource <strong>{permissionDetail.resource}</strong>.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-close-modal" onClick={handleClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPermissionDetailModal;

