import React, { useState } from 'react';
import './CreateSupplierPage.css';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiPhone, FiMapPin, FiUsers } from 'react-icons/fi';
import { pharmacistSupplierAPI } from '../../../../services/staff/pharmacistAPI';

const CreateSupplierPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phoneNumber: '',
        address: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            setError('Vui lòng nhập tên nhà cung cấp');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await pharmacistSupplierAPI.createSupplier(formData);
            console.log('Create Supplier Response:', response);

            if (response && response.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/staff/duoc-si/ncc');
                }, 2000);
            }
        } catch (err) {
            console.error('Error creating supplier:', err);
            setError(err.message || 'Không thể tạo nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/staff/duoc-si/ncc');
    };

    return (
        <div className="create-supplier-page">
            <div className="page-header">
                <div className="header-left">
                    <FiUsers className="header-icon" />
                    <h2>Tạo mới Nhà cung cấp</h2>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="success-message">
                    <span>✓ Tạo nhà cung cấp thành công!</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="supplier-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>
                            <FiUsers />
                            Tên nhà cung cấp <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập tên nhà cung cấp"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FiUser />
                            Người liên hệ
                        </label>
                        <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="Nhập tên người liên hệ"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FiPhone />
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>
                            <FiMapPin />
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        <FiX />
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={loading}
                    >
                        <FiSave />
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateSupplierPage;
