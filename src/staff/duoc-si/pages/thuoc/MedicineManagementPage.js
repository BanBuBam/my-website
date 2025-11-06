import React, { useState, useEffect } from 'react';
import './MedicineManagementPage.css';
import { FiSearch, FiPackage, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { medicineAPI } from '../../../../services/staff/pharmacistAPI';

const MedicineManagementPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterManufacturer, setFilterManufacturer] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchMedicines();
    }, [currentPage]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterCategory, filterManufacturer, medicines]);

    const fetchMedicines = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await medicineAPI.getMedicines();
            console.log('API Response:', response);

            if (response && response.content) {
                const medicinesData = response.content;
                setMedicines(medicinesData);
                setTotalPages(response.totalPages || 1);
                setTotalElements(response.totalElements || medicinesData.length);
            }
        } catch (err) {
            console.error('Error fetching medicines:', err);
            setError(err.message || 'Không thể tải danh sách thuốc');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...medicines];

        // Search by name
        if (searchTerm) {
            filtered = filtered.filter(med => 
                med.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                med.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filterCategory) {
            filtered = filtered.filter(med => med.category === filterCategory);
        }

        // Filter by manufacturer
        if (filterManufacturer) {
            filtered = filtered.filter(med => 
                med.manufacturer?.toLowerCase().includes(filterManufacturer.toLowerCase())
            );
        }

        setFilteredMedicines(filtered);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
        setFilterManufacturer('');
    };

    const handleRefresh = () => {
        fetchMedicines();
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Get unique categories and manufacturers for filters
    const categories = [...new Set(medicines.map(m => m.category).filter(Boolean))];
    const manufacturers = [...new Set(medicines.map(m => m.manufacturer).filter(Boolean))];

    return (
        <div className="medicine-management-page">
            <div className="page-header">
                <div className="header-left">
                    <FiPackage className="header-icon" />
                    <h2>Quản lý Thuốc</h2>
                </div>
                <button className="btn-refresh" onClick={handleRefresh}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên thuốc hoặc hoạt chất..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <FiFilter />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={filterManufacturer}
                            onChange={(e) => setFilterManufacturer(e.target.value)}
                        >
                            <option value="">Tất cả nhà sản xuất</option>
                            {manufacturers.map(manu => (
                                <option key={manu} value={manu}>{manu}</option>
                            ))}
                        </select>
                    </div>

                    {(searchTerm || filterCategory || filterManufacturer) && (
                        <button className="btn-clear-filters" onClick={handleClearFilters}>
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                <div className="results-count">
                    Hiển thị {filteredMedicines.length} / {totalElements} thuốc
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách thuốc...</p>
                </div>
            ) : (
                <>
                    {/* Medicines Table */}
                    {filteredMedicines.length === 0 ? (
                        <div className="empty-state">
                            <FiPackage />
                            <p>Không tìm thấy thuốc nào</p>
                            {(searchTerm || filterCategory || filterManufacturer) && (
                                <button className="btn-clear" onClick={handleClearFilters}>
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="medicines-table-container">
                            <table className="medicines-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã thuốc</th>
                                        <th>Tên thuốc</th>
                                        <th>Hoạt chất</th>
                                        <th>Danh mục</th>
                                        <th>Đơn vị</th>
                                        <th>Nhà sản xuất</th>
                                        <th>Giá</th>
                                        <th>Mô tả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMedicines.map((medicine, index) => (
                                        <tr key={medicine.medicineId}>
                                            <td>{currentPage * 100 + index + 1}</td>
                                            <td className="medicine-code">{medicine.medicineCode || '-'}</td>
                                            <td className="medicine-name">
                                                <FiPackage />
                                                <span>{medicine.medicineName}</span>
                                            </td>
                                            <td>{medicine.activeIngredient || '-'}</td>
                                            <td>
                                                {medicine.category && (
                                                    <span className="category-badge">{medicine.category}</span>
                                                )}
                                            </td>
                                            <td>{medicine.unit || '-'}</td>
                                            <td>{medicine.manufacturer || '-'}</td>
                                            <td className="price">{formatCurrency(medicine.price)}</td>
                                            <td className="description">{medicine.description || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn-page"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            >
                                Trước
                            </button>
                            <span className="page-info">
                                Trang {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                className="btn-page"
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

export default MedicineManagementPage;

