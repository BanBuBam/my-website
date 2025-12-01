import React, { useState, useEffect, useCallback } from 'react';
import './MedicineManagementPage.css';
import { FiSearch, FiPackage, FiFilter, FiRefreshCw, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaPills, FaIndustry, FaBarcode, FaFlask, FaThermometerHalf, FaSyringe } from 'react-icons/fa';
import { medicineAPI } from '../../../../services/staff/pharmacistAPI';

const MedicineManagementPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search and filter states
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterDrugClass, setFilterDrugClass] = useState('');
    const [filterManufacturer, setFilterManufacturer] = useState('');
    const [sortField, setSortField] = useState('medicineName,asc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Detail modal
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    // Unique values for filters
    const [drugClasses, setDrugClasses] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await medicineAPI.getMedicines(searchKeyword, currentPage, pageSize, [sortField]);
            console.log('API Response:', response);

            if (response && response.status === 'OK' && response.data) {
                const medicinesData = response.data.content || [];
                setMedicines(medicinesData);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || 0);

                // Extract unique drugClass and manufacturers
                const uniqueDrugClasses = [...new Set(medicinesData.map(m => m.drugClass).filter(Boolean))];
                const uniqueManufacturers = [...new Set(medicinesData.map(m => m.manufacturer).filter(Boolean))];
                setDrugClasses(prev => [...new Set([...prev, ...uniqueDrugClasses])]);
                setManufacturers(prev => [...new Set([...prev, ...uniqueManufacturers])]);
            } else {
                setMedicines([]);
            }
        } catch (err) {
            console.error('Error fetching medicines:', err);
            setError(err.message || 'Không thể tải danh sách thuốc');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, sortField]);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    // Filter locally for drugClass and manufacturer
    const filteredMedicines = medicines.filter(med => {
        let pass = true;
        if (filterDrugClass && med.drugClass !== filterDrugClass) pass = false;
        if (filterManufacturer && med.manufacturer !== filterManufacturer) pass = false;
        return pass;
    });

    const handleSearch = () => {
        setCurrentPage(0);
        fetchMedicines();
    };

    const handleClearFilters = () => {
        setSearchKeyword('');
        setFilterDrugClass('');
        setFilterManufacturer('');
        setCurrentPage(0);
    };

    const handleRefresh = () => {
        fetchMedicines();
    };

    const handleViewDetail = (medicine) => {
        setSelectedMedicine(medicine);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const getDrugClassBadge = (drugClass) => {
        const colors = {
            'Antibiotic': { bg: '#fff0f6', color: '#eb2f96', border: '#ffadd2' },
            'Antiviral': { bg: '#f9f0ff', color: '#722ed1', border: '#d3adf7' },
            'Analgesic': { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
            'Antihypertensive': { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
            'Antidiabetic': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
            'Corticosteroid': { bg: '#fffbe6', color: '#faad14', border: '#ffe58f' },
            'Vitamin': { bg: '#e6fffb', color: '#13c2c2', border: '#87e8de' },
            'Supplement': { bg: '#fcffe6', color: '#a0d911', border: '#d3f261' },
        };
        const style = colors[drugClass] || { bg: '#f5f5f5', color: '#666', border: '#d9d9d9' };
        return (
            <span style={{
                backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`,
                padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500
            }}>
                {drugClass}
            </span>
        );
    };

    return (
        <div className="medicine-management-page">
            <div className="page-header">
                <div className="header-left">
                    <FaPills className="header-icon" />
                    <div>
                        <h2>Quản lý Danh mục Thuốc</h2>
                        <p style={{margin:0, color:'#6c757d', fontSize:'14px'}}>Tổng: {totalElements.toLocaleString()} thuốc</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo tên thuốc, SKU..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn-search" onClick={handleSearch}>Tìm</button>
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <FiFilter />
                        <select value={filterDrugClass} onChange={(e) => setFilterDrugClass(e.target.value)}>
                            <option value="">Tất cả nhóm thuốc</option>
                            {drugClasses.map(dc => <option key={dc} value={dc}>{dc}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <FaIndustry />
                        <select value={filterManufacturer} onChange={(e) => setFilterManufacturer(e.target.value)}>
                            <option value="">Tất cả nhà sản xuất</option>
                            {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={sortField} onChange={(e) => { setSortField(e.target.value); setCurrentPage(0); }}>
                            <option value="medicineName,asc">Tên A-Z</option>
                            <option value="medicineName,desc">Tên Z-A</option>
                            <option value="createdAt,desc">Mới nhất</option>
                            <option value="createdAt,asc">Cũ nhất</option>
                            <option value="manufacturer,asc">NSX A-Z</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                            <option value={100}>100 / trang</option>
                        </select>
                    </div>

                    {(searchKeyword || filterDrugClass || filterManufacturer) && (
                        <button className="btn-clear-filters" onClick={handleClearFilters}>Xóa lọc</button>
                    )}
                </div>

                <div className="results-count">
                    Hiển thị {filteredMedicines.length} / {totalElements.toLocaleString()} thuốc
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="error-message"><p>{error}</p></div>}

            {/* Loading State */}
            {loading ? (
                <div className="loading-state"><div className="spinner"></div><p>Đang tải danh sách thuốc...</p></div>
            ) : (
                <>
                    {filteredMedicines.length === 0 ? (
                        <div className="empty-state">
                            <FaPills style={{fontSize:'48px', color:'#d9d9d9'}} />
                            <p>Không tìm thấy thuốc nào</p>
                            {(searchKeyword || filterDrugClass || filterManufacturer) && (
                                <button className="btn-clear" onClick={handleClearFilters}>Xóa bộ lọc</button>
                            )}
                        </div>
                    ) : (
                        <div className="medicines-table-container">
                            <table className="medicines-table">
                                <thead>
                                    <tr>
                                        <th style={{width:'50px'}}>STT</th>
                                        <th style={{width:'100px'}}>SKU</th>
                                        <th style={{width:'25%'}}>Tên thuốc</th>
                                        <th>Nhóm thuốc</th>
                                        <th>Đơn vị</th>
                                        <th>Nhà sản xuất</th>
                                        <th>Đường dùng</th>
                                        <th style={{width:'80px'}}>Liều max</th>
                                        <th style={{width:'60px', textAlign:'center'}}>Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMedicines.map((medicine, index) => (
                                        <tr key={medicine.medicineId}>
                                            <td style={{textAlign:'center', color:'#888'}}>{currentPage * pageSize + index + 1}</td>
                                            <td>
                                                <code style={{backgroundColor:'#f0f5ff', color:'#1890ff', padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}}>
                                                    {medicine.sku || '-'}
                                                </code>
                                            </td>
                                            <td className="medicine-name">
                                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                    <FaPills style={{color:'#52c41a'}} />
                                                    <div>
                                                        <strong style={{color:'#1f2937'}}>{medicine.medicineName}</strong>
                                                        {medicine.barcode && (
                                                            <div style={{fontSize:'11px', color:'#888', marginTop:'2px'}}>
                                                                <FaBarcode style={{marginRight:'4px'}} />{medicine.barcode}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{medicine.drugClass ? getDrugClassBadge(medicine.drugClass) : '-'}</td>
                                            <td style={{fontWeight:500}}>{medicine.unit || '-'}</td>
                                            <td>
                                                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <FaIndustry style={{color:'#8c8c8c', fontSize:'12px'}} />
                                                    {medicine.manufacturer || '-'}
                                                </div>
                                            </td>
                                            <td>
                                                {medicine.routeOfAdministration && (
                                                    <span style={{
                                                        backgroundColor:'#f6ffed', color:'#389e0d',
                                                        padding:'2px 8px', borderRadius:'10px', fontSize:'11px'
                                                    }}>
                                                        <FaSyringe style={{marginRight:'4px'}} />
                                                        {medicine.routeOfAdministration}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{textAlign:'center', fontWeight:500, color:'#fa541c'}}>
                                                {medicine.maxDailyDose ? `${medicine.maxDailyDose}` : '-'}
                                            </td>
                                            <td style={{textAlign:'center'}}>
                                                <button
                                                    className="btn-icon view"
                                                    onClick={() => handleViewDetail(medicine)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FiEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="pagination">
                        <button className="btn-page" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
                            <FiChevronLeft /><FiChevronLeft />
                        </button>
                        <button className="btn-page" onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0}>
                            <FiChevronLeft /> Trước
                        </button>
                        <span className="page-info">Trang {currentPage + 1} / {totalPages} ({totalElements.toLocaleString()} thuốc)</span>
                        <button className="btn-page" onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={currentPage >= totalPages - 1}>
                            Sau <FiChevronRight />
                        </button>
                        <button className="btn-page" onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}>
                            <FiChevronRight /><FiChevronRight />
                        </button>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedMedicine && (
                <div className="modal-overlay" onClick={() => setSelectedMedicine(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth:'700px'}}>
                        <div className="modal-header" style={{borderBottom:'3px solid #52c41a'}}>
                            <h2><FaPills style={{marginRight:'10px', color:'#52c41a'}} /> Chi tiết Thuốc</h2>
                            <button className="close-btn" onClick={() => setSelectedMedicine(null)}>&times;</button>
                        </div>
                        <div className="modal-body" style={{padding:'20px'}}>
                            <div style={{textAlign:'center', marginBottom:'20px', padding:'15px', backgroundColor:'#f6ffed', borderRadius:'8px'}}>
                                <h3 style={{margin:'0 0 5px', color:'#1f2937'}}>{selectedMedicine.medicineName}</h3>
                                <code style={{backgroundColor:'#e6f7ff', color:'#1890ff', padding:'4px 10px', borderRadius:'4px'}}>
                                    {selectedMedicine.sku}
                                </code>
                            </div>

                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <div className="detail-item">
                                    <label><FaIndustry /> Nhà sản xuất:</label>
                                    <span>{selectedMedicine.manufacturer || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label><FaFlask /> Nhóm thuốc:</label>
                                    <span>{selectedMedicine.drugClass ? getDrugClassBadge(selectedMedicine.drugClass) : '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Đơn vị:</label>
                                    <span>{selectedMedicine.unit || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label><FaSyringe /> Đường dùng:</label>
                                    <span>{selectedMedicine.routeOfAdministration || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Liều tối đa/ngày:</label>
                                    <span style={{color:'#fa541c', fontWeight:600}}>{selectedMedicine.maxDailyDose || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label><FaBarcode /> Barcode:</label>
                                    <span>{selectedMedicine.barcode || '-'} ({selectedMedicine.barcodeType || '-'})</span>
                                </div>
                                <div className="detail-item">
                                    <label>NDC Code:</label>
                                    <span>{selectedMedicine.ndcCode || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Số đăng ký:</label>
                                    <span>{selectedMedicine.registrationNumber || '-'}</span>
                                </div>
                            </div>

                            <div style={{marginTop:'15px', padding:'12px', backgroundColor:'#fffbe6', borderRadius:'6px', border:'1px solid #ffe58f'}}>
                                <label style={{fontWeight:600, color:'#ad6800'}}><FaThermometerHalf /> Điều kiện bảo quản:</label>
                                <p style={{margin:'5px 0 0'}}>{selectedMedicine.storageConditions || '-'}</p>
                            </div>

                            <div style={{marginTop:'15px', padding:'12px', backgroundColor:'#f0f5ff', borderRadius:'6px', border:'1px solid #adc6ff'}}>
                                <label style={{fontWeight:600, color:'#1d39c4'}}>Mô tả:</label>
                                <p style={{margin:'5px 0 0'}}>{selectedMedicine.description || '-'}</p>
                            </div>

                            <div style={{marginTop:'15px', padding:'12px', backgroundColor:'#fff1f0', borderRadius:'6px', border:'1px solid #ffa39e'}}>
                                <label style={{fontWeight:600, color:'#cf1322'}}>Chống chỉ định:</label>
                                <p style={{margin:'5px 0 0'}}>{selectedMedicine.contraindications || '-'}</p>
                            </div>

                            <div style={{marginTop:'15px', display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#8c8c8c'}}>
                                <span>Ngày tạo: {formatDate(selectedMedicine.createdAt)}</span>
                                <span>Cập nhật: {formatDate(selectedMedicine.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineManagementPage;

