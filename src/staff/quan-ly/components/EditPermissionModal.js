import React, { useState, useEffect } from 'react';
import './EditPermissionModal.css';
import { FiX, FiShield, FiAlertCircle } from 'react-icons/fi';
import { adminPermissionAPI } from '../../../services/staff/adminAPI';

const EditPermissionModal = ({ isOpen, onClose, permission, onSuccess }) => {
    const [permissionName, setPermissionName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (permission) {
            setPermissionName(permission.permissionName || '');
        }
    }, [permission]);

    const handleClose = () => {
        setPermissionName('');
        setError('');
        onClose();
    };

    const validatePermissionName = (name) => {
        const pattern = /^[a-z]+\.[a-z]+$/;
        
        if (!name) {
            return 'Tên permission không được để trống';
        }
        
        if (name.length < 2 || name.length > 255) {
            return 'Tên permission phải từ 2-255 ký tự';
        }
        
        if (!pattern.test(name)) {
            return 'Tên permission phải theo định dạng: resource.action (chữ thường, không dấu)';
        }
        
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validatePermissionName(permissionName);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await adminPermissionAPI.updatePermission(permission.permissionId, {
                permissionName: permissionName.trim()
            });

            if (response && response.status === 'OK') {
                alert('Cập nhật permission thành công!');
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err) {
            console.error('Error updating permission:', err);
            if (err.message.includes('pattern')) {
                setError('Tên permission phải theo định dạng: resource.action');
            } else if (err.message.includes('unique') || err.message.includes('exists')) {
                setError('Permission này đã tồn tại trong hệ thống');
            } else {
                setError(err.message || 'Không thể cập nhật permission. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setPermissionName(value);
        
        if (error) {
            setError('');
        }
    };

    if (!isOpen || !permission) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content edit-permission-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiShield />
                        <h2>Chỉnh sửa Permission</h2>
                    </div>
                    <button className="btn-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="permission-info-banner">
                            <div className="info-item">
                                <span className="label">ID:</span>
                                <span className="value">{permission.permissionId}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Resource:</span>
                                <span className="value">{permission.resource}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Action:</span>
                                <span className="value">{permission.action}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="permissionName">
                                Tên Permission <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="permissionName"
                                value={permissionName}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: patient.view"
                                className={error ? 'error' : ''}
                                disabled={loading}
                                autoFocus
                            />
                            {error && (
                                <div className="error-message">
                                    <FiAlertCircle />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="info-box">
                            <p>💡 Định dạng: <code>resource.action</code> (chữ thường, 2-255 ký tự)</p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={loading || !permissionName.trim()}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <FiShield />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPermissionModal;

