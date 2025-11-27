import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutpatientPaymentListPage.css';
import {
    FiSearch,
    FiEye,
    FiCalendar,
    FiUser,
    FiActivity,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiFilter
} from 'react-icons/fi';
import { financeEncounterAPI } from '../../../../services/staff/financeAPI';

const OutpatientPaymentListPage = () => {
    const navigate = useNavigate();
    
    // State
    const [encounters, setEncounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0,
    });
    
    // Filters
    const [filters, setFilters] = useState({
        patientCode: '',
        patientName: '',
        status: '',
        startDate: '',
        endDate: '',
    });
    
    const [showFilters, setShowFilters] = useState(false);
    
    // Fetch encounters
    const fetchEncounters = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: page,
                size: pagination.size,
                sort: ['startDatetime,desc'],
                ...filters,
            };
            
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });
            
            const response = await financeEncounterAPI.getEncounters(params);
            
            if (response && response.data) {
                setEncounters(response.data.content || []);
                setPagination({
                    page: response.data.number || 0,
                    size: response.data.size || 20,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                });
            }
        } catch (err) {
            console.error('Error fetching encounters:', err);
            setError(err.message || 'Không thể tải danh sách lượt khám');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEncounters();
    }, []);
    
    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    // Handle search
    const handleSearch = () => {
        fetchEncounters(0);
    };
    
    // Handle reset filters
    const handleResetFilters = () => {
        setFilters({
            patientCode: '',
            patientName: '',
            status: '',
            startDate: '',
            endDate: '',
        });
        setTimeout(() => fetchEncounters(0), 100);
    };
    
    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchEncounters(newPage);
        }
    };
    
    // Handle view detail
    const handleViewDetail = (encounterId) => {
        navigate(`/staff/tai-chinh/thanh-toan-ngoai-tru/${encounterId}`);
    };
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'PLANNED': { label: 'Đã lên lịch', className: 'status-planned' },
            'ARRIVED': { label: 'Đã đến', className: 'status-arrived' },
            'IN_PROGRESS': { label: 'Đang khám', className: 'status-in-progress' },
            'FINISHED': { label: 'Hoàn thành', className: 'status-finished' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
        };
        
        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };
    
    if (loading && encounters.length === 0) {
        return (
            <div className="outpatient-payment-list-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải danh sách lượt khám...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="outpatient-payment-list-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Thanh toán ngoại trú</h1>
                    <p>Quản lý thanh toán cho các lượt khám ngoại trú</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => fetchEncounters(pagination.page)}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>
            
            {/* Filters */}
            <div className="filters-section">
                <button className="btn-toggle-filters" onClick={() => setShowFilters(!showFilters)}>
                    <FiFilter /> {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                </button>
                
                {showFilters && (
                    <div className="filters-content">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Mã bệnh nhân</label>
                                <input
                                    type="text"
                                    name="patientCode"
                                    value={filters.patientCode}
                                    onChange={handleFilterChange}
                                    placeholder="Nhập mã bệnh nhân..."
                                />
                            </div>
                            <div className="filter-group">
                                <label>Tên bệnh nhân</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={filters.patientName}
                                    onChange={handleFilterChange}
                                    placeholder="Nhập tên bệnh nhân..."
                                />
                            </div>
                            <div className="filter-group">
                                <label>Trạng thái</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="">Tất cả</option>
                                    <option value="PLANNED">Đã lên lịch</option>
                                    <option value="ARRIVED">Đã đến</option>
                                    <option value="IN_PROGRESS">Đang khám</option>
                                    <option value="FINISHED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Từ ngày</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Đến ngày</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="filters-actions">
                            <button className="btn-search" onClick={handleSearch}>
                                <FiSearch /> Tìm kiếm
                            </button>
                            <button className="btn-reset" onClick={handleResetFilters}>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Error */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
            
            {/* Encounters Table */}
            <div className="encounters-table-container">
                <table className="encounters-table">
                    <thead>
                        <tr>
                            <th>Mã BN</th>
                            <th>Tên bệnh nhân</th>
                            <th>Khoa</th>
                            <th>Trạng thái</th>
                            <th>Ngày bắt đầu</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {encounters.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            encounters.map((encounter) => (
                                <tr key={encounter.encounterId}>
                                    <td>{encounter.patientCode}</td>
                                    <td>{encounter.patientName}</td>
                                    <td>{encounter.departmentName || '-'}</td>
                                    <td>{getStatusBadge(encounter.status)}</td>
                                    <td>{formatDate(encounter.startDatetime)}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetail(encounter.encounterId)}
                                        >
                                            <FiEye /> Xem
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn-page"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 0}
                    >
                        <FiChevronLeft />
                    </button>
                    <span className="page-info">
                        Trang {pagination.page + 1} / {pagination.totalPages}
                    </span>
                    <button
                        className="btn-page"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages - 1}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default OutpatientPaymentListPage;

