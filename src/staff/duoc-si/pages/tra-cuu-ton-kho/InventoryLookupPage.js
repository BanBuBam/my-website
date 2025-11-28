import React, { useState, useEffect } from 'react';
import './InventoryLookupPage.css';
import { 
    FiSearch, FiAlertTriangle, FiClock, FiRefreshCw, 
    FiPackage, FiLayers, FiDollarSign 
} from 'react-icons/fi';
// Import API
import { pharmacistInventoryAPI } from '../../../../services/staff/pharmacistAPI';

const InventoryLookupPage = () => {
    // State quản lý Tab hiện tại: 'search' | 'low-stock' | 'expired'
    const [activeTab, setActiveTab] = useState('search');
    
    // State dữ liệu danh sách
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State dữ liệu tổng quan tồn kho
    const [summaryStats, setSummaryStats] = useState({
        total_medicines: 0,
        total_materials: 0,
        low_stock_items: 0,
        expired_items: 0,
        total_stock_value: 0 // Mặc định, sẽ ghi đè nếu có valuation cụ thể
    });

    // [THÊM MỚI] State định giá chi tiết
    const [valuationStats, setValuationStats] = useState({
        total_value: 0,
        medicine_value: 0,
        material_value: 0
    });

    // State cho bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [daysAhead, setDaysAhead] = useState(30);
    
    // 'medicine': Thuốc | 'material': Vật tư | 'barcode': Mã vạch | 'cabinet': Tủ | 'department': Khoa
    const [searchMode, setSearchMode] = useState('medicine'); 

    // Hàm load tổng quan tồn kho
    const fetchSummaryStats = async () => {
        try {
            const response = await pharmacistInventoryAPI.getStockSummary();
            if (response && (response.status === 'OK' || response.code === 200)) {
                setSummaryStats(response.data);
            }
        } catch (err) {
            console.error("Failed to load stock summary", err);
        }
    };

    // [THÊM MỚI] Hàm load định giá tồn kho
    const fetchStockValuation = async () => {
        try {
            const response = await pharmacistInventoryAPI.getStockValuation();
            if (response && (response.status === 'OK' || response.code === 200)) {
                setValuationStats(response.data);
            }
        } catch (err) {
            console.error("Failed to load stock valuation", err);
        }
    };

    // Hàm load dữ liệu danh sách
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setItems([]);

        try {
            let response;
            
            // --- LOGIC TAB TRA CỨU CHUNG ---
            if (activeTab === 'search') {
                if (!searchTerm.trim()) {
                    // Nếu ô tìm trống, load mặc định danh sách thuốc
                    response = await pharmacistInventoryAPI.getInventory();
                } else {
                    // Gọi API dựa trên chế độ tìm kiếm
                    switch (searchMode) {
                        case 'medicine':
                            response = await pharmacistInventoryAPI.searchMedicine(searchTerm);
                            break;
                        case 'material':
                            response = await pharmacistInventoryAPI.searchMaterialsByName(searchTerm);
                            break;
                        case 'barcode':
                            response = await pharmacistInventoryAPI.searchByBarcode(searchTerm);
                            break;
                        case 'cabinet':
                            response = await pharmacistInventoryAPI.getStockByCabinet(searchTerm);
                            break;
                        case 'department': 
                            response = await pharmacistInventoryAPI.getStockByDepartment(searchTerm);
                            break;
                        default:
                            response = await pharmacistInventoryAPI.getInventory();
                    }
                }
            } 
            // --- LOGIC TAB SẮP HẾT ---
            else if (activeTab === 'low-stock') {
                response = await pharmacistInventoryAPI.getLowStockItems();
            } 
            // --- LOGIC TAB HẾT HẠN ---
            else if (activeTab === 'expired') {
                response = await pharmacistInventoryAPI.getExpiredItems(daysAhead);
            }

            // Xử lý response linh hoạt
            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200 || Array.isArray(response))) {
                const data = Array.isArray(response) ? response : (response.data || response.content || []);
                setItems(data);
            } else {
                setItems([]);
            }
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra lại từ khóa hoặc kết nối.");
        } finally {
            setLoading(false);
        }
    };

    // Load Summary & Valuation khi vào trang
    useEffect(() => {
        fetchSummaryStats();
        fetchStockValuation();
    }, []);

    // Load Data khi đổi Tab hoặc Filter
    useEffect(() => {
        if (activeTab !== 'search') {
            fetchData();
        }
    }, [activeTab, daysAhead]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (activeTab !== 'search') setActiveTab('search');
        fetchData();
    };

    // --- HELPERS ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch { return 'Invalid Date'; }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return 'normal';
        const today = new Date();
        const exp = new Date(expiryDate);
        const diffTime = exp - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays <= 30) return 'near-expiry';
        return 'normal';
    };

    const getItemName = (item) => {
        return item.medicine_name || item.medicineName || item.itemName || item.item_name || item.name || `ID: ${item.item_id || item.id}`;
    };

    const getLocationName = (item) => {
        if (item.location) return item.location;
        if (item.cabinetName || item.cabinet_name) return item.cabinetName || item.cabinet_name;
        if (item.cabinet_id) return `Tủ số ${item.cabinet_id}`;
        return 'Kho chính';
    };

    const getSearchPlaceholder = () => {
        switch (searchMode) {
            case 'medicine': return 'Nhập tên thuốc hoặc hoạt chất...';
            case 'material': return 'Nhập tên vật tư y tế...';
            case 'barcode': return 'Quét hoặc nhập mã vạch (Barcode)...';
            case 'cabinet': return 'Nhập ID tủ (Ví dụ: 1, 11)...';
            case 'department': return 'Nhập ID khoa phòng (Ví dụ: 5)...';
            default: return 'Tìm kiếm...';
        }
    };

    return (
        <div className="inventory-lookup-page">
            <div className="page-header">
                <div className="header-left">
                    <h2>🔎 Tra cứu hàng tồn kho</h2>
                    <p>Kiểm tra nhanh vị trí, số lượng và hạn sử dụng thuốc</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh-all" onClick={() => { fetchSummaryStats(); fetchStockValuation(); fetchData(); }}>
                        <FiRefreshCw /> Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {/* KHU VỰC THỐNG KÊ TỔNG QUAN */}
            <div className="summary-dashboard">
                <div className="summary-card blue">
                    <div className="summary-icon"><FiPackage /></div>
                    <div className="summary-info">
                        <span className="summary-label">Tổng đầu thuốc</span>
                        <span className="summary-value">{summaryStats.total_medicines}</span>
                    </div>
                </div>
                <div className="summary-card purple">
                    <div className="summary-icon"><FiLayers /></div>
                    <div className="summary-info">
                        <span className="summary-label">Tổng vật tư</span>
                        <span className="summary-value">{summaryStats.total_materials}</span>
                    </div>
                </div>
                <div className="summary-card orange">
                    <div className="summary-icon"><FiAlertTriangle /></div>
                    <div className="summary-info">
                        <span className="summary-label">Sắp hết hàng</span>
                        <span className="summary-value">{summaryStats.low_stock_items}</span>
                    </div>
                </div>
                <div className="summary-card red">
                    <div className="summary-icon"><FiClock /></div>
                    <div className="summary-info">
                        <span className="summary-label">Hết hạn / Cận date</span>
                        <span className="summary-value">{summaryStats.expired_items}</span>
                    </div>
                </div>
                {/* Card Tổng giá trị */}
                <div className="summary-card green">
                    <div className="summary-icon"><FiDollarSign /></div>
                    <div className="summary-info">
                        <span className="summary-label">Tổng giá trị kho</span>
                        <span className="summary-value money">{formatCurrency(valuationStats.total_value || summaryStats.total_stock_value)}</span>
                    </div>
                </div>
                {/* [THÊM MỚI] Card Giá trị thuốc */}
                <div className="summary-card cyan">
                    <div className="summary-icon"><FiDollarSign /></div>
                    <div className="summary-info">
                        <span className="summary-label">Giá trị thuốc</span>
                        <span className="summary-value money">{formatCurrency(valuationStats.medicine_value)}</span>
                    </div>
                </div>
                {/* [THÊM MỚI] Card Giá trị vật tư */}
                <div className="summary-card teal">
                    <div className="summary-icon"><FiDollarSign /></div>
                    <div className="summary-info">
                        <span className="summary-label">Giá trị vật tư</span>
                        <span className="summary-value money">{formatCurrency(valuationStats.material_value)}</span>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="tabs-container">
                <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
                    <FiSearch /> Tra cứu chung
                </button>
                <button className={`tab-btn ${activeTab === 'low-stock' ? 'active' : ''}`} onClick={() => setActiveTab('low-stock')}>
                    <FiAlertTriangle /> Sắp hết hàng 
                    <span className="badge-count">{summaryStats.low_stock_items}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'expired' ? 'active' : ''}`} onClick={() => setActiveTab('expired')}>
                    <FiClock /> Hết hạn / Cận date 
                    <span className="badge-count">{summaryStats.expired_items}</span>
                </button>
            </div>

            {/* FILTERS */}
            <div className="filter-section">
                {activeTab === 'search' && (
                    <div className="search-container-advanced" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        <div className="search-mode-selector" style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="radio" 
                                    name="searchMode" 
                                    checked={searchMode === 'medicine'} 
                                    onChange={() => setSearchMode('medicine')} 
                                /> 
                                💊 Tìm Thuốc
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="radio" 
                                    name="searchMode" 
                                    checked={searchMode === 'material'} 
                                    onChange={() => setSearchMode('material')} 
                                /> 
                                💉 Tìm Vật tư
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="radio" 
                                    name="searchMode" 
                                    checked={searchMode === 'barcode'} 
                                    onChange={() => setSearchMode('barcode')} 
                                /> 
                                📶 Mã vạch
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="radio" 
                                    name="searchMode" 
                                    checked={searchMode === 'cabinet'} 
                                    onChange={() => setSearchMode('cabinet')} 
                                /> 
                                🗄️ Theo Tủ
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="radio" 
                                    name="searchMode" 
                                    checked={searchMode === 'department'} 
                                    onChange={() => setSearchMode('department')} 
                                /> 
                                🏥 Theo Khoa
                            </label>
                        </div>

                        <form onSubmit={handleSearch} className="search-box" style={{ width: '100%' }}>
                            <input 
                                type="text" 
                                placeholder={getSearchPlaceholder()} 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                autoFocus
                            />
                            <button type="submit" className="btn-primary">Tìm kiếm</button>
                        </form>
                    </div>
                )}

                {activeTab === 'expired' && (
                    <div className="expiry-filter">
                        <label>Xem thuốc hết hạn trong vòng:</label>
                        <select value={daysAhead} onChange={(e) => setDaysAhead(Number(e.target.value))} className="form-select">
                            <option value={30}>30 ngày tới</option>
                            <option value={60}>60 ngày tới</option>
                            <option value={90}>90 ngày tới</option>
                            <option value={180}>6 tháng tới</option>
                        </select>
                    </div>
                )}
            </div>

            {/* RESULTS TABLE */}
            <div className="results-table-container">
                {loading ? <div className="loading-state">⏳ Đang tải dữ liệu...</div> : error ? <div className="error-state">❌ {error}</div> : items.length === 0 ? <div className="empty-state">📭 Không tìm thấy dữ liệu phù hợp</div> : (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã / Barcode</th>
                                <th>Tên Hàng hóa</th>
                                <th>Loại</th>
                                <th>Số lô</th>
                                <th>Hạn dùng</th>
                                <th>SL Tồn</th>
                                <th>Vị trí</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const expiryDate = item.expiry_date || item.expiryDate;
                                const expiryStatus = getExpiryStatus(expiryDate);
                                const quantity = item.quantity_on_hand !== undefined ? item.quantity_on_hand : (item.quantity || item.stockQuantity || 0);
                                const reorderLevel = item.reorder_level !== undefined ? item.reorder_level : (item.min_stock || 0);
                                const itemCode = item.medicine_code || item.medicineCode || item.item_code || item.barcode || 'N/A';
                                const itemType = item.item_type || item.type || (searchMode === 'material' ? 'MATERIAL' : 'MEDICINE');
                                
                                return (
                                    <tr key={index} className={`row-${expiryStatus}`}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{fontWeight: 'bold'}}>{itemCode}</div>
                                            {item.barcode && item.barcode !== itemCode && <div style={{fontSize: '0.8em', color: '#666'}}>Unknown: {item.barcode}</div>}
                                        </td>
                                        <td>
                                            <div className="fw-bold">{getItemName(item)}</div>
                                            <small className="text-muted">{item.active_ingredient || item.activeIngredient}</small>
                                        </td>
                                        <td>
                                            <span className={`badge-type ${itemType === 'MATERIAL' ? 'material' : 'medicine'}`}>
                                                {itemType}
                                            </span>
                                        </td>
                                        <td>{item.batch_number || item.batchNumber || 'N/A'}</td>
                                        <td>
                                            {formatDate(expiryDate)}
                                            {expiryStatus === 'expired' && <span className="tag-danger">Đã hết hạn</span>}
                                            {expiryStatus === 'near-expiry' && <span className="tag-warning">Sắp hết</span>}
                                        </td>
                                        <td className="text-center font-weight-bold" style={{ fontSize: '1.1em', color: quantity <= reorderLevel ? '#dc3545' : '#28a745' }}>
                                            {quantity}
                                        </td>
                                        <td>{getLocationName(item)}</td>
                                        <td>
                                            {quantity <= reorderLevel ? (
                                                <span className="badge-low-stock">Sắp hết</span>
                                            ) : (
                                                <span className="badge-ok">Có sẵn</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default InventoryLookupPage;