import React, { useState } from 'react';
import './ExpiryManagementPage.css';
import { FiSearch, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiFilter, FiDownload } from 'react-icons/fi';

const ExpiryManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, expired, near-expiry, safe
    const [sortBy, setSortBy] = useState('expiry-asc'); // expiry-asc, expiry-desc, name-asc, quantity-desc
    const [filterDays, setFilterDays] = useState('90'); // 30, 60, 90, 180, all

    // Mock data - Danh sách thuốc với hạn sử dụng
    const [medicines] = useState([
        {
            id: 1,
            name: 'Paracetamol 500mg',
            batch: 'LOT001',
            manufacturer: 'Công ty Dược A',
            quantity: 500,
            unit: 'Viên',
            importDate: '15/01/2025',
            expiryDate: '15/10/2025',
            daysUntilExpiry: 9,
            status: 'near-expiry',
            location: 'Kệ A1',
            price: 5000
        },
        {
            id: 2,
            name: 'Amoxicillin 500mg',
            batch: 'LOT002',
            manufacturer: 'Công ty Dược B',
            quantity: 300,
            unit: 'Viên',
            importDate: '10/08/2024',
            expiryDate: '10/08/2025',
            daysUntilExpiry: -57,
            status: 'expired',
            location: 'Kệ A2',
            price: 8000
        },
        {
            id: 3,
            name: 'Vitamin C 1000mg',
            batch: 'LOT003',
            manufacturer: 'Công ty Dược C',
            quantity: 1000,
            unit: 'Viên',
            importDate: '20/03/2025',
            expiryDate: '20/09/2026',
            daysUntilExpiry: 349,
            status: 'safe',
            location: 'Kệ B1',
            price: 3000
        },
        {
            id: 4,
            name: 'Cefixime 200mg',
            batch: 'LOT004',
            manufacturer: 'Công ty Dược D',
            quantity: 200,
            unit: 'Viên',
            importDate: '05/12/2024',
            expiryDate: '05/03/2026',
            daysUntilExpiry: 150,
            status: 'safe',
            location: 'Kệ A3',
            price: 15000
        },
        {
            id: 5,
            name: 'Omeprazole 20mg',
            batch: 'LOT005',
            manufacturer: 'Công ty Dược E',
            quantity: 150,
            unit: 'Viên',
            importDate: '18/06/2024',
            expiryDate: '18/08/2025',
            daysUntilExpiry: -49,
            status: 'expired',
            location: 'Kệ B2',
            price: 10000
        },
        {
            id: 6,
            name: 'Siro ho trẻ em',
            batch: 'LOT006',
            manufacturer: 'Công ty Dược F',
            quantity: 80,
            unit: 'Chai',
            importDate: '01/09/2024',
            expiryDate: '01/11/2025',
            daysUntilExpiry: 26,
            status: 'near-expiry',
            location: 'Kệ C1',
            price: 45000
        },
        {
            id: 7,
            name: 'Aspirin 100mg',
            batch: 'LOT007',
            manufacturer: 'Công ty Dược G',
            quantity: 600,
            unit: 'Viên',
            importDate: '12/02/2025',
            expiryDate: '12/02/2027',
            daysUntilExpiry: 490,
            status: 'safe',
            location: 'Kệ A4',
            price: 2000
        },
        {
            id: 8,
            name: 'Ibuprofen 400mg',
            batch: 'LOT008',
            manufacturer: 'Công ty Dược H',
            quantity: 250,
            unit: 'Viên',
            importDate: '25/07/2024',
            expiryDate: '25/10/2025',
            daysUntilExpiry: 19,
            status: 'near-expiry',
            location: 'Kệ B3',
            price: 6000
        }
    ]);

    // Calculate statistics
    const stats = {
        total: medicines.length,
        expired: medicines.filter(m => m.status === 'expired').length,
        nearExpiry: medicines.filter(m => m.status === 'near-expiry').length,
        safe: medicines.filter(m => m.status === 'safe').length,
        totalValue: medicines.reduce((sum, m) => sum + (m.price * m.quantity), 0),
        expiredValue: medicines.filter(m => m.status === 'expired').reduce((sum, m) => sum + (m.price * m.quantity), 0)
    };

    // Filter medicines
    const getFilteredMedicines = () => {
        let filtered = medicines.filter(m => {
            const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              m.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchStatus = filterStatus === 'all' || m.status === filterStatus;
            
            let matchDays = true;
            if (filterDays !== 'all') {
                const days = parseInt(filterDays);
                matchDays = m.daysUntilExpiry <= days && m.daysUntilExpiry >= 0;
            }
            
            return matchSearch && matchStatus && matchDays;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'expiry-asc':
                    return a.daysUntilExpiry - b.daysUntilExpiry;
                case 'expiry-desc':
                    return b.daysUntilExpiry - a.daysUntilExpiry;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'quantity-desc':
                    return b.quantity - a.quantity;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredMedicines = getFilteredMedicines();

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const getStatusBadge = (status, days) => {
        if (status === 'expired') {
            return <span className="status-badge expired"><FiAlertCircle /> Đã hết hạn</span>;
        } else if (status === 'near-expiry') {
            return <span className="status-badge near-expiry"><FiAlertTriangle /> Sắp hết hạn ({days} ngày)</span>;
        } else {
            return <span className="status-badge safe"><FiCheckCircle /> An toàn ({days} ngày)</span>;
        }
    };

    const handleExport = () => {
        alert('Xuất báo cáo Excel (Chức năng đang phát triển)');
    };

    return (
        <div className="expiry-management-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Hạn sử dụng thuốc</h2>
                    <p>Theo dõi và cảnh báo thuốc sắp hết hạn hoặc đã hết hạn</p>
                </div>
                <button className="btn-export" onClick={handleExport}>
                    <FiDownload /> Xuất báo cáo
                </button>
            </div>

            {/* Statistics */}
            <div className="stats-section">
                <div className="stat-card total">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <h3>{stats.total}</h3>
                        <p>Tổng số lô thuốc</p>
                    </div>
                </div>
                <div className="stat-card expired">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <h3>{stats.expired}</h3>
                        <p>Đã hết hạn</p>
                        <span className="stat-value">{formatCurrency(stats.expiredValue)}</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>{stats.nearExpiry}</h3>
                        <p>Sắp hết hạn</p>
                    </div>
                </div>
                <div className="stat-card safe">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.safe}</h3>
                        <p>An toàn</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên thuốc, lô, nhà sản xuất..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="expired">Đã hết hạn</option>
                    <option value="near-expiry">Sắp hết hạn</option>
                    <option value="safe">An toàn</option>
                </select>

                <select
                    className="filter-select"
                    value={filterDays}
                    onChange={(e) => setFilterDays(e.target.value)}
                >
                    <option value="all">Tất cả thời gian</option>
                    <option value="30">Hết hạn trong 30 ngày</option>
                    <option value="60">Hết hạn trong 60 ngày</option>
                    <option value="90">Hết hạn trong 90 ngày</option>
                    <option value="180">Hết hạn trong 180 ngày</option>
                </select>

                <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="expiry-asc">Sắp xếp: HSD gần nhất</option>
                    <option value="expiry-desc">Sắp xếp: HSD xa nhất</option>
                    <option value="name-asc">Sắp xếp: Tên A-Z</option>
                    <option value="quantity-desc">Sắp xếp: Số lượng giảm dần</option>
                </select>
            </div>

            {/* Medicine List */}
            <div className="medicine-list">
                {filteredMedicines.length === 0 ? (
                    <div className="no-data">
                        <p>Không tìm thấy dữ liệu</p>
                    </div>
                ) : (
                    <table className="medicine-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên thuốc</th>
                                <th>Số lô</th>
                                <th>Nhà sản xuất</th>
                                <th>Số lượng</th>
                                <th>Vị trí</th>
                                <th>Ngày nhập</th>
                                <th>Hạn sử dụng</th>
                                <th>Trạng thái</th>
                                <th>Giá trị</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((medicine, index) => (
                                <tr key={medicine.id} className={`row-${medicine.status}`}>
                                    <td>{index + 1}</td>
                                    <td className="medicine-name">{medicine.name}</td>
                                    <td className="batch">{medicine.batch}</td>
                                    <td>{medicine.manufacturer}</td>
                                    <td className="quantity">
                                        {medicine.quantity} {medicine.unit}
                                    </td>
                                    <td>{medicine.location}</td>
                                    <td>{medicine.importDate}</td>
                                    <td className="expiry-date">{medicine.expiryDate}</td>
                                    <td>
                                        {getStatusBadge(medicine.status, Math.abs(medicine.daysUntilExpiry))}
                                    </td>
                                    <td className="value">
                                        {formatCurrency(medicine.price * medicine.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Summary */}
            <div className="summary-section">
                <div className="summary-item">
                    <span className="label">Tổng số lô hiển thị:</span>
                    <span className="value">{filteredMedicines.length}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Tổng giá trị:</span>
                    <span className="value">{formatCurrency(filteredMedicines.reduce((sum, m) => sum + (m.price * m.quantity), 0))}</span>
                </div>
            </div>
        </div>
    );
};

export default ExpiryManagementPage;

