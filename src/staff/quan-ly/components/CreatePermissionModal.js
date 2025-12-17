import React, { useState } from 'react';
import './CreatePermissionModal.css';
import { FiX, FiShield, FiAlertCircle } from 'react-icons/fi';
import { adminPermissionAPI } from '../../../services/staff/adminAPI';

const CreatePermissionModal = ({ isOpen, onClose, onSuccess }) => {
    const [permissionName, setPermissionName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setPermissionName('');
        setError('');
        onClose();
    };

    const validatePermissionName = (name) => {
        // Pattern: ^[a-z]+\.[a-z]+$ (e.g., resource.action)
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
            
            const response = await adminPermissionAPI.createPermission({
                permissionName: permissionName.trim()
            });

            if (response && response.status === 'CREATED') {
                alert('Tạo permission thành công!');
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err) {
            console.error('Error creating permission:', err);
            if (err.message.includes('pattern')) {
                setError('Tên permission phải theo định dạng: resource.action');
            } else if (err.message.includes('unique') || err.message.includes('exists')) {
                setError('Permission này đã tồn tại trong hệ thống');
            } else {
                setError(err.message || 'Không thể tạo permission. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setPermissionName(value);
        
        // Clear error when user types
        if (error) {
            setError('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content create-permission-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        <FiShield />
                        <h2>Tạo Permission mới</h2>
                    </div>
                    <button className="btn-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="permissionName">
                                Tên Permission <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="permissionName"
                                value={permissionName}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: patient.view, medicine.delete"
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
                            <h4>📋 Quy tắc đặt tên:</h4>
                            <ul>
                                <li>Định dạng: <code>resource.action</code></li>
                                <li>Chỉ sử dụng chữ cái thường (a-z)</li>
                                <li>Không có khoảng trắng, số, hoặc ký tự đặc biệt</li>
                                <li>Độ dài: 2-255 ký tự</li>
                                <li>Phải là duy nhất trong hệ thống</li>
                            </ul>
                            <h4>✅ Ví dụ hợp lệ:</h4>
                            <ul className="examples">
                                <li><code>patient.view</code></li>
                                <li><code>patient.create</code></li>
                                <li><code>medicine.delete</code></li>
                                <li><code>appointment.update</code></li>
                            </ul>
                            <h4>❌ Ví dụ không hợp lệ:</h4>
                            <ul className="examples invalid">
                                <li><code>Patient.View</code> (chữ hoa)</li>
                                <li><code>patient_view</code> (thiếu dấu chấm)</li>
                                <li><code>patient.view.all</code> (quá nhiều phần)</li>
                                <li><code>patient view</code> (có khoảng trắng)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
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
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <FiShield />
                                    Tạo Permission
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePermissionModal;

