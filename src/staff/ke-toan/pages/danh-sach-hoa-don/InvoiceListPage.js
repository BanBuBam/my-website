import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvoiceListPage.css';
import { FiSearch, FiEye, FiPlus } from 'react-icons/fi';

const InvoiceListPage = () => {
    const navigate = useNavigate();

    // Mock data - Danh sách hóa đơn
    const [invoices] = useState([
        {
            id: 'HD001',
            patientName: 'Nguyễn Văn A',
            department: 'Khoa Nội',
            room: 'Phòng 101',
            date: '05/10/2025',
            totalAmount: 1500000,
            status: 'Chưa thanh toán'
        },
        {
            id: 'HD002',
            patientName: 'Trần Thị B',
            department: 'Khoa Ngoại',
            room: 'Phòng 205',
            date: '04/10/2025',
            totalAmount: 2300000,
            status: 'Đã thanh toán'
        },
        {
            id: 'HD003',
            patientName: 'Lê Văn C',
            department: 'Khoa Nhi',
            room: 'Phòng 302',
            date: '03/10/2025',
            totalAmount: 980000,
            status: 'Chưa thanh toán'
        },
        {
            id: 'HD004',
            patientName: 'Phạm Thị D',
            department: 'Khoa Sản',
            room: 'Phòng 108',
            date: '06/10/2025',
            totalAmount: 3500000,
            status: 'Đã thanh toán'
        },
        {
            id: 'HD005',
            patientName: 'Hoàng Văn E',
            department: 'Khoa Tim mạch',
            room: 'Phòng 401',
            date: '02/10/2025',
            totalAmount: 4200000,
            status: 'Chưa thanh toán'
        }
    ]);

    // State cho filter
    const [searchCode, setSearchCode] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');

    // Lọc danh sách hóa đơn
    const filteredInvoices = invoices.filter(invoice => {
        const matchCode = invoice.id.toLowerCase().includes(searchCode.toLowerCase());
        const matchName = invoice.patientName.toLowerCase().includes(searchName.toLowerCase());
        const matchDate = searchDate ? invoice.date.includes(searchDate) : true;
        const matchStatus = searchStatus ? invoice.status === searchStatus : true;
        
        return matchCode && matchName && matchDate && matchStatus;
    });

    // Format tiền tệ
    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // Xem chi tiết hóa đơn
    const handleViewDetail = (invoice) => {
        navigate('/staff/tai-chinh/chi-tiet-hoa-don', { state: { invoice } });
    };

    // Thêm hóa đơn mới
    const handleAddInvoice = () => {
        navigate('/staff/tai-chinh/phieu-thanh-toan');
    };

    return (
        <div className="invoice-list-page">
            <div className="page-header">
                <h2>Danh sách Hóa đơn</h2>
                <button className="btn-add-invoice" onClick={handleAddInvoice}>
                    <FiPlus /> Thêm hóa đơn
                </button>
            </div>

            {/* Bộ lọc tìm kiếm */}
            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-item">
                        <label>Mã hóa đơn:</label>
                        <div className="input-with-icon">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Nhập mã hóa đơn..."
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-item">
                        <label>Tên bệnh nhân:</label>
                        <div className="input-with-icon">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Nhập tên bệnh nhân..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-item">
                        <label>Ngày khám:</label>
                        <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Trạng thái:</label>
                        <select
                            value={searchStatus}
                            onChange={(e) => setSearchStatus(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="Chưa thanh toán">Chưa thanh toán</option>
                            <option value="Đã thanh toán">Đã thanh toán</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Danh sách hóa đơn */}
            <div className="invoice-list">
                {filteredInvoices.length === 0 ? (
                    <div className="no-data">
                        <p>Không tìm thấy hóa đơn nào phù hợp</p>
                    </div>
                ) : (
                    filteredInvoices.map((invoice) => (
                        <div key={invoice.id} className="invoice-card">
                            <div className="invoice-left">
                                <div className="patient-info">
                                    <h3 className="patient-name">{invoice.patientName}</h3>
                                    <div className="invoice-details">
                                        <p><strong>Khoa:</strong> {invoice.department}</p>
                                        <p><strong>Phòng khám:</strong> {invoice.room}</p>
                                        <p><strong>Ngày khám:</strong> {invoice.date}</p>
                                        <p className={`status ${invoice.status === 'Đã thanh toán' ? 'paid' : 'unpaid'}`}>
                                            <strong>Trạng thái:</strong> {invoice.status}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-right">
                                <div className="amount-section">
                                    <p className="amount-label">Số tiền cần trả:</p>
                                    <p className="amount-value">{formatCurrency(invoice.totalAmount)}</p>
                                </div>
                                <button 
                                    className="btn-view-detail"
                                    onClick={() => handleViewDetail(invoice)}
                                >
                                    <FiEye /> Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Thống kê */}
            <div className="summary-section">
                <p>Tổng số hóa đơn: <strong>{filteredInvoices.length}</strong></p>
                <p>Chưa thanh toán: <strong>{filteredInvoices.filter(i => i.status === 'Chưa thanh toán').length}</strong></p>
                <p>Đã thanh toán: <strong>{filteredInvoices.filter(i => i.status === 'Đã thanh toán').length}</strong></p>
            </div>
        </div>
    );
};

export default InvoiceListPage;

