import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeInvoiceAPI } from '../../../../services/staff/financeAPI';
import { FiSearch, FiAlertCircle, FiFileText, FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import './InvoiceListPage.css';

const InvoiceListPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        patientId: '',
        status: '',
        paymentStatus: '',
        fromDate: '',
        toDate: '',
        sort: 'dueDate',
    });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(20);
    
    const navigate = useNavigate();
    
    // Fetch danh sách hóa đơn
    const fetchInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const searchParams = {
                page: currentPage,
                size: pageSize,
            };
            
            // Add filters if they have values
            if (filters.patientId) searchParams.patientId = filters.patientId;
            if (filters.status) searchParams.status = filters.status;
            if (filters.paymentStatus) searchParams.paymentStatus = filters.paymentStatus;
            if (filters.fromDate) searchParams.fromDate = filters.fromDate;
            if (filters.toDate) searchParams.toDate = filters.toDate;
            if (filters.sort) searchParams.sort = filters.sort;
            
            const response = await financeInvoiceAPI.searchInvoices(searchParams);
            
            if (response && response.data) {
                const invoiceList = response.data.content || response.data;
                setInvoices(invoiceList);
                setFilteredInvoices(invoiceList);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || invoiceList.length);
            } else {
                setInvoices([]);
                setFilteredInvoices([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách hóa đơn');
            setInvoices([]);
            setFilteredInvoices([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchInvoices();
    }, [currentPage]);
    
    // Lọc theo search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredInvoices(invoices);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = invoices.filter(invoice => 
                invoice.invoiceNumber?.toLowerCase().includes(term) ||
                invoice.patientName?.toLowerCase().includes(term) ||
                invoice.patientId?.toString().includes(term)
            );
            setFilteredInvoices(filtered);
        }
    }, [searchTerm, invoices]);
    
    const handleViewDetail = (invoiceId) => {
        navigate(`/staff/tai-chinh/quan-ly-hoa-don/${invoiceId}`);
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handleSearch = () => {
        setCurrentPage(0);
        fetchInvoices();
    };
    
    const handleResetFilters = () => {
        setFilters({
            patientId: '',
            status: '',
            paymentStatus: '',
            fromDate: '',
            toDate: '',
            sort: 'dueDate',
        });
        setSearchTerm('');
        setCurrentPage(0);
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };
    
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ISSUED': 'status-issued',
            'PARTIAL_PAID': 'status-partial',
            'PAID': 'status-paid',
            'CANCELLED': 'status-cancelled',
        };
        return statusMap[status] || 'status-default';
    };
    
    const getPaymentStatusBadgeClass = (paymentStatus) => {
        const statusMap = {
            'PAID': 'payment-paid',
            'PARTIAL': 'payment-partial',
            'UNPAID': 'payment-unpaid',
        };
        return statusMap[paymentStatus] || 'payment-default';
    };
    
    return (
        <div className="invoice-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiFileText className="header-icon" />
                    <div>
                        <h1>Quản lý Hóa đơn</h1>
                        <p>Tìm kiếm và quản lý hóa đơn</p>
                    </div>
                </div>
            </div>
            
            {/* Filter Section */}
            <div className="filter-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo số hóa đơn, tên bệnh nhân, ID bệnh nhân..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn-toggle-filter" onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                    </button>
                    <button className="btn-refresh" onClick={fetchInvoices}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
                <div className="advanced-filters">
                    <div className="filter-grid">
                        <div className="filter-item">
                            <label>ID Bệnh nhân</label>
                            <input
                                type="number"
                                name="patientId"
                                value={filters.patientId}
                                onChange={handleFilterChange}
                                placeholder="Nhập ID bệnh nhân..."
                            />
                        </div>
                        <div className="filter-item">
                            <label>Trạng thái hóa đơn</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">Tất cả</option>
                                <option value="ISSUED">Đã phát hành</option>
                                <option value="PARTIAL_PAID">Thanh toán một phần</option>
                                <option value="PAID">Đã thanh toán</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                        <div className="filter-item">
                            <label>Trạng thái thanh toán</label>
                            <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange}>
                                <option value="">Tất cả</option>
                                <option value="PAID">Đã thanh toán</option>
                                <option value="PARTIAL">Thanh toán một phần</option>
                                <option value="UNPAID">Chưa thanh toán</option>
                            </select>
                        </div>
                        <div className="filter-item">
                            <label>Từ ngày</label>
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="filter-item">
                            <label>Đến ngày</label>
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="filter-item">
                            <label>Sắp xếp theo</label>
                            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                                <option value="dueDate">Ngày đến hạn</option>
                                <option value="issueDate">Ngày phát hành</option>
                                <option value="totalAmount">Tổng tiền</option>
                                <option value="unpaidAmount">Còn lại</option>
                            </select>
                        </div>
                    </div>
                    <div className="filter-buttons">
                        <button className="btn-search" onClick={handleSearch}>
                            <FiSearch /> Tìm kiếm
                        </button>
                        <button className="btn-reset" onClick={handleResetFilters}>
                            Đặt lại
                        </button>
                    </div>
                </div>
            )}
            
            {/* Stats */}
            <div className="stats-section">
                <span className="stat-badge">
                    Tổng số: <strong>{totalElements}</strong>
                </span>
                <span className="stat-badge">
                    Trang {currentPage + 1} / {totalPages || 1}
                </span>
            </div>
            
            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <FiFileText className="spinner" />
                    <p>Đang tải danh sách hóa đơn...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={fetchInvoices} className="btn-retry">Thử lại</button>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="empty-state">
                    <FiCalendar />
                    <p>Không tìm thấy hóa đơn nào</p>
                </div>
            ) : (
                <>
                    <div className="invoices-grid">
                        {filteredInvoices.map(invoice => (
                            <InvoiceCard 
                                key={invoice.invoiceId} 
                                invoice={invoice}
                                onCardClick={() => handleViewDetail(invoice.invoiceId)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                                getStatusBadgeClass={getStatusBadgeClass}
                                getPaymentStatusBadgeClass={getPaymentStatusBadgeClass}
                            />
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            >
                                Trước
                            </button>
                            <span>Trang {currentPage + 1} / {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Invoice Card Component
const InvoiceCard = ({ invoice, onCardClick, formatDate, formatCurrency, getStatusBadgeClass, getPaymentStatusBadgeClass }) => {
    return (
        <div className={`invoice-card clickable ${invoice.isOverdue ? 'overdue' : ''}`} onClick={onCardClick}>
            <div className="card-header">
                <div className="card-title">
                    <h3>
                        <FiFileText /> {invoice.invoiceNumber || 'N/A'}
                    </h3>
                    <span className="patient-name">{invoice.patientName || 'N/A'}</span>
                </div>
                <div className="badges">
                    <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status}
                    </span>
                    <span className={`badge ${getPaymentStatusBadgeClass(invoice.paymentStatus)}`}>
                        {invoice.paymentStatus}
                    </span>
                </div>
            </div>
            
            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <label>Tổng tiền:</label>
                        <span className="highlight">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    <div className="info-item">
                        <label>Đã thanh toán:</label>
                        <span>{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                    <div className="info-item">
                        <label>Còn lại:</label>
                        <span className={invoice.unpaidAmount > 0 ? 'unpaid' : ''}>{formatCurrency(invoice.unpaidAmount)}</span>
                    </div>
                    <div className="info-item">
                        <label><FiCalendar /> Ngày phát hành:</label>
                        <span>{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="info-item">
                        <label><FiCalendar /> Ngày đến hạn:</label>
                        <span className={invoice.isOverdue ? 'overdue-text' : ''}>{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>ID Bệnh nhân:</label>
                        <span>{invoice.patientId}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceListPage;

