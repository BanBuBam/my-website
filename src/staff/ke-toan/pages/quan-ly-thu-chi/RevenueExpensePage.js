import React, { useState } from 'react';
import './RevenueExpensePage.css';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const RevenueExpensePage = () => {
    const [activeTab, setActiveTab] = useState('all'); // all, revenue, expense
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('revenue'); // revenue or expense
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Mock data - Danh sách thu chi
    const [transactions] = useState([
        {
            id: 'PT001',
            type: 'revenue',
            date: '06/10/2025',
            description: 'Thu viện phí bệnh nhân Nguyễn Văn A',
            category: 'Viện phí',
            amount: 3200000,
            paymentMethod: 'Tiền mặt',
            createdBy: 'Nguyễn Thị B'
        },
        {
            id: 'PC001',
            type: 'expense',
            date: '06/10/2025',
            description: 'Chi trả lương tháng 9',
            category: 'Lương nhân viên',
            amount: 50000000,
            paymentMethod: 'Chuyển khoản',
            createdBy: 'Trần Văn C'
        },
        {
            id: 'PT002',
            type: 'revenue',
            date: '05/10/2025',
            description: 'Thu tiền thuốc',
            category: 'Thuốc',
            amount: 1500000,
            paymentMethod: 'Chuyển khoản',
            createdBy: 'Nguyễn Thị B'
        },
        {
            id: 'PC002',
            type: 'expense',
            date: '05/10/2025',
            description: 'Mua vật tư y tế',
            category: 'Vật tư',
            amount: 8000000,
            paymentMethod: 'Chuyển khoản',
            createdBy: 'Lê Thị D'
        },
        {
            id: 'PT003',
            type: 'revenue',
            date: '04/10/2025',
            description: 'Thu phí xét nghiệm',
            category: 'Xét nghiệm',
            amount: 2500000,
            paymentMethod: 'Tiền mặt',
            createdBy: 'Nguyễn Thị B'
        },
        {
            id: 'PC003',
            type: 'expense',
            date: '04/10/2025',
            description: 'Thanh toán tiền điện nước',
            category: 'Tiện ích',
            amount: 5000000,
            paymentMethod: 'Chuyển khoản',
            createdBy: 'Trần Văn C'
        }
    ]);

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        category: '',
        amount: '',
        paymentMethod: 'Tiền mặt',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const matchTab = activeTab === 'all' || t.type === activeTab;
        const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDate = filterDate ? t.date.includes(filterDate) : true;
        return matchTab && matchSearch && matchDate;
    });

    // Calculate totals
    const totalRevenue = transactions
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalRevenue - totalExpense;

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
        setFormData({
            description: '',
            category: '',
            amount: '',
            paymentMethod: 'Tiền mặt',
            date: new Date().toISOString().split('T')[0],
            note: ''
        });
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Đã tạo phiếu ${modalType === 'revenue' ? 'thu' : 'chi'} thành công!`);
        handleCloseModal();
    };

    return (
        <div className="revenue-expense-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Thu Chi</h2>
                    <p>Theo dõi và quản lý các khoản thu chi của bệnh viện</p>
                </div>
                <div className="header-actions">
                    <button className="btn-add revenue" onClick={() => handleOpenModal('revenue')}>
                        <FiPlus /> Tạo phiếu thu
                    </button>
                    <button className="btn-add expense" onClick={() => handleOpenModal('expense')}>
                        <FiPlus /> Tạo phiếu chi
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card revenue">
                    <div className="card-icon">↑</div>
                    <div className="card-content">
                        <p className="card-label">Tổng thu</p>
                        <h3 className="card-value">{formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>
                <div className="summary-card expense">
                    <div className="card-icon">↓</div>
                    <div className="card-content">
                        <p className="card-label">Tổng chi</p>
                        <h3 className="card-value">{formatCurrency(totalExpense)}</h3>
                    </div>
                </div>
                <div className="summary-card balance">
                    <div className="card-icon">=</div>
                    <div className="card-content">
                        <p className="card-label">Số dư</p>
                        <h3 className="card-value">{formatCurrency(balance)}</h3>
                    </div>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="control-section">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả ({transactions.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Phiếu thu ({transactions.filter(t => t.type === 'revenue').length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'expense' ? 'active' : ''}`}
                        onClick={() => setActiveTab('expense')}
                    >
                        Phiếu chi ({transactions.filter(t => t.type === 'expense').length})
                    </button>
                </div>

                <div className="filters">
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã, nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input
                        type="date"
                        className="date-filter"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Transaction List */}
            <div className="transaction-list">
                {filteredTransactions.length === 0 ? (
                    <div className="no-data">
                        <p>Không có dữ liệu</p>
                    </div>
                ) : (
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Mã phiếu</th>
                                <th>Ngày</th>
                                <th>Loại</th>
                                <th>Nội dung</th>
                                <th>Danh mục</th>
                                <th>Số tiền</th>
                                <th>Hình thức</th>
                                <th>Người tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="code">{transaction.id}</td>
                                    <td>{transaction.date}</td>
                                    <td>
                                        <span className={`badge ${transaction.type}`}>
                                            {transaction.type === 'revenue' ? 'Thu' : 'Chi'}
                                        </span>
                                    </td>
                                    <td className="description">{transaction.description}</td>
                                    <td>{transaction.category}</td>
                                    <td className={`amount ${transaction.type}`}>
                                        {formatCurrency(transaction.amount)}
                                    </td>
                                    <td>{transaction.paymentMethod}</td>
                                    <td>{transaction.createdBy}</td>
                                    <td className="actions">
                                        <button className="btn-icon" title="Xem">
                                            <FiEye />
                                        </button>
                                        <button className="btn-icon" title="Sửa">
                                            <FiEdit />
                                        </button>
                                        <button className="btn-icon delete" title="Xóa">
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Create */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo phiếu {modalType === 'revenue' ? 'thu' : 'chi'}</h3>
                            <button className="btn-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nội dung: <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung thu/chi"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Danh mục: <span className="required">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleChange} required>
                                        <option value="">Chọn danh mục</option>
                                        {modalType === 'revenue' ? (
                                            <>
                                                <option value="Viện phí">Viện phí</option>
                                                <option value="Thuốc">Thuốc</option>
                                                <option value="Xét nghiệm">Xét nghiệm</option>
                                                <option value="Khác">Khác</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Lương">Lương nhân viên</option>
                                                <option value="Vật tư">Vật tư y tế</option>
                                                <option value="Tiện ích">Tiện ích</option>
                                                <option value="Khác">Khác</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Số tiền: <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="Nhập số tiền"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hình thức:</label>
                                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                                        <option value="Tiền mặt">Tiền mặt</option>
                                        <option value="Chuyển khoản">Chuyển khoản</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ngày:</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Ghi chú:</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Nhập ghi chú (nếu có)"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    Tạo phiếu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueExpensePage;

