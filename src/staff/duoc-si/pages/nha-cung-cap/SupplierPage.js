import React, { useState, useEffect } from 'react';
import './SupplierPage.css';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiPlus, FiSearch, FiUsers, FiAlertCircle } from 'react-icons/fi';
import { pharmacistSupplierAPI } from '../../../../services/staff/pharmacistAPI';

const SupplierPage = () => {
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [searchTerm, suppliers]);

    const fetchSuppliers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await pharmacistSupplierAPI.getSuppliers();
            console.log('Suppliers API Response:', response);

            if (response && response.data) {
                setSuppliers(response.data);
            }
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setError(err.message || 'Không thể tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let filtered = [...suppliers];

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phoneNumber?.includes(searchTerm)
            );
        }

        setFilteredSuppliers(filtered);
    };

    const handleRefresh = () => {
        fetchSuppliers();
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="supplier-page">
            <div className="page-header">
                <div className="header-left">
                    <FiUsers className="header-icon" />
                    <h2>Quản lý Nhà cung cấp</h2>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={handleRefresh}>
                        <FiRefreshCw />
                        Làm mới
                    </button>
                    <button
                        className="btn-create"
                        onClick={() => navigate('/staff/duoc-si/tao-ncc')}
                    >
                        <FiPlus />
                        Tạo mới nhà cung cấp
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, người liên hệ, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="results-count">
                    Hiển thị {filteredSuppliers.length} / {suppliers.length} nhà cung cấp
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="loading-state">
                    <FiRefreshCw className="spinning" />
                    <p>Đang tải danh sách nhà cung cấp...</p>
                </div>
            ) : (
                <>
                    {/* Suppliers Table */}
                    {filteredSuppliers.length === 0 ? (
                        <div className="empty-state">
                            <FiUsers />
                            <p>Không tìm thấy nhà cung cấp nào</p>
                            {searchTerm && (
                                <button className="btn-clear" onClick={() => setSearchTerm('')}>
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="supplier-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên nhà cung cấp</th>
                                        <th>Người liên hệ</th>
                                        <th>Số điện thoại</th>
                                        <th>Địa chỉ</th>
                                        <th>Ngày tạo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSuppliers.map((supplier, idx) => (
                                        <tr key={supplier.supplierId}>
                                            <td>{idx + 1}</td>
                                            <td className="supplier-name">{supplier.name}</td>
                                            <td>{supplier.contactPerson || '-'}</td>
                                            <td>{supplier.phoneNumber || '-'}</td>
                                            <td>{supplier.address || '-'}</td>
                                            <td>{formatDateTime(supplier.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SupplierPage;
