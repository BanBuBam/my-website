import React, { useState, useEffect } from 'react';
import './MedicalSupplyPage.css';
import { 
    FiFileText, FiDatabase, FiTrash2, FiSearch, FiPlus, 
    FiCheck, FiX, FiRefreshCw, FiFilter, FiEye, FiTruck 
} from 'react-icons/fi';
import { pharmacistMedicalSupplyAPI } from '../../../../services/staff/pharmacistAPI';

const MedicalSupplyPage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(false);
    
    // --- STATE CHO TAB ORDERS ---
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState('PENDING'); // PENDING, APPROVED, DISPENSED
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // --- STATE CHO TAB CATALOG ---
    const [supplies, setSupplies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [supplySearch, setSupplySearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // --- STATE CHO TAB RECYCLE ---
    const [deletedItems, setDeletedItems] = useState([]);
    const [recycleStats, setRecycleStats] = useState({ materials: 0, medicines: 0 });

    // ==================== FETCH DATA FUNCTIONS ====================

    // Load Orders (Giả lập load list, thực tế dùng getAllPrescriptions)
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Gọi API lấy danh sách phiếu theo trạng thái
            const res = await pharmacistMedicalSupplyAPI.getAllPrescriptions(orderFilter);
            if (res?.data) setOrders(Array.isArray(res.data) ? res.data : res.data.content || []);
            else setOrders([]); 
        } catch (err) {
            console.error("Load orders failed", err);
            setOrders([]);
        } finally { setLoading(false); }
    };

    // Load Catalog
    const fetchCatalog = async () => {
        setLoading(true);
        try {
            // Load danh mục
            const catsRes = await pharmacistMedicalSupplyAPI.getCategories();
            if (catsRes?.data) setCategories(catsRes.data);

            // Load vật tư (Search hoặc theo Category)
            let supplyRes;
            if (supplySearch) {
                supplyRes = await pharmacistMedicalSupplyAPI.searchSupplies(supplySearch);
            } else if (selectedCategory) {
                supplyRes = await pharmacistMedicalSupplyAPI.getSuppliesByCategory(selectedCategory);
            } else {
                // Mặc định load những cái hay dùng
                supplyRes = await pharmacistMedicalSupplyAPI.getFrequentlyUsedSupplies();
            }

            if (supplyRes?.data) setSupplies(supplyRes.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    // Load Recycle Bin
    const fetchRecycleBin = async () => {
        setLoading(true);
        try {
            const [itemsRes, statsRes] = await Promise.all([
                pharmacistMedicalSupplyAPI.getDeletedMaterials(),
                pharmacistMedicalSupplyAPI.getSoftDeleteStatistics()
            ]);
            
            if (itemsRes?.data) setDeletedItems(itemsRes.data);
            if (statsRes?.data) setRecycleStats(statsRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Effect switch tab
    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'catalog') fetchCatalog();
        if (activeTab === 'recycle') fetchRecycleBin();
    }, [activeTab, orderFilter, selectedCategory]); // Re-fetch khi filter thay đổi

    // ==================== ACTION HANDLERS ====================

    // Xử lý tìm kiếm Catalog (Enter)
    const handleCatalogSearch = (e) => {
        if (e.key === 'Enter') fetchCatalog();
    };

    // Xem chi tiết đơn
    const handleViewOrder = async (id) => {
        try {
            const res = await pharmacistMedicalSupplyAPI.getPrescriptionById(id);
            if (res?.data) {
                setSelectedOrder(res.data);
                setShowOrderModal(true);
            }
        } catch (err) { alert('Không thể tải chi tiết đơn'); }
    };

    // Duyệt đơn
    const handleApprove = async (id) => {
        if (!window.confirm('Xác nhận duyệt phiếu lĩnh này?')) return;
        try {
            const res = await pharmacistMedicalSupplyAPI.approvePrescription(id);
            if (res?.status === 'success' || res?.code === 200) {
                alert('Đã duyệt thành công!');
                fetchOrders();
                setShowOrderModal(false);
            }
        } catch (err) { alert('Lỗi khi duyệt phiếu'); }
    };

    // Cấp phát / Xuất kho
    const handleDispense = async (id) => {
        if (!window.confirm('Xác nhận xuất kho vật tư? Tồn kho sẽ bị trừ.')) return;
        try {
            const res = await pharmacistMedicalSupplyAPI.dispenseSupplies(id);
            if (res?.status === 'success' || res?.code === 200) {
                alert('Đã xuất kho thành công!');
                fetchOrders();
                setShowOrderModal(false);
            }
        } catch (err) { alert('Lỗi khi xuất kho'); }
    };

    // Từ chối
    const handleReject = async (id) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;
        try {
            await pharmacistMedicalSupplyAPI.rejectPrescription(id, reason);
            alert('Đã từ chối phiếu.');
            fetchOrders();
            setShowOrderModal(false);
        } catch (err) { alert('Lỗi khi từ chối'); }
    };

    // Khôi phục
    const handleRestore = async (id) => {
        if (!window.confirm('Bạn muốn khôi phục vật tư này?')) return;
        try {
            await pharmacistMedicalSupplyAPI.restoreMaterial(id);
            alert('Khôi phục thành công!');
            fetchRecycleBin();
        } catch (err) { alert('Lỗi khôi phục'); }
    };

    // Helper format date
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString('vi-VN') : 'N/A';

    return (
        <div className="medical-supply-page">
            <div className="page-header">
                <div className="header-left">
                    <h2>🏥 Quản lý Vật tư Y tế</h2>
                    <p>Cấp phát, tra cứu và quản lý kho vật tư tiêu hao</p>
                </div>
                
                {/* TABS CONTROL */}
                <div className="tabs-control">
                    <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                        <FiFileText /> Phiếu Lĩnh
                    </button>
                    <button className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
                        <FiDatabase /> Danh mục & Kho
                    </button>
                    <button className={`tab-btn ${activeTab === 'recycle' ? 'active' : ''}`} onClick={() => setActiveTab('recycle')}>
                        <FiTrash2 /> Thùng rác 
                        {(recycleStats.materials > 0) && <span className="badge">{recycleStats.materials}</span>}
                    </button>
                </div>
            </div>

            <div className="tab-content">
                {/* === TAB 1: ORDERS (PRESCRIPTIONS) === */}
                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <div className="filter-bar">
                            <div className="filter-group">
                                <button className={`filter-btn ${orderFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setOrderFilter('PENDING')}>Chờ duyệt</button>
                                <button className={`filter-btn ${orderFilter === 'APPROVED' ? 'active' : ''}`} onClick={() => setOrderFilter('APPROVED')}>Đã duyệt</button>
                                <button className={`filter-btn ${orderFilter === 'DISPENSED' ? 'active' : ''}`} onClick={() => setOrderFilter('DISPENSED')}>Đã xuất</button>
                            </div>
                            <button className="btn-primary" onClick={fetchOrders}><FiRefreshCw /> Làm mới</button>
                        </div>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Mã phiếu</th>
                                    <th>Bệnh nhân / Khoa</th>
                                    <th>Ngày tạo</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? orders.map(order => (
                                    <tr key={order.prescriptionId}>
                                        <td><strong>#{order.prescriptionId}</strong></td>
                                        <td>
                                            <div>BN: {order.patientName || `ID: ${order.patientId}`}</div>
                                            <small className="text-muted">Encounter: {order.encounterId}</small>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span>
                                        </td>
                                        <td>
                                            <button className="btn-icon" title="Xem chi tiết" onClick={() => handleViewOrder(order.prescriptionId)}>
                                                <FiEye />
                                            </button>
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button className="btn-icon success" title="Duyệt" onClick={() => handleApprove(order.prescriptionId)}><FiCheck /></button>
                                                    <button className="btn-icon danger" title="Từ chối" onClick={() => handleReject(order.prescriptionId)}><FiX /></button>
                                                </>
                                            )}
                                            {order.status === 'APPROVED' && (
                                                <button className="btn-icon primary" title="Xuất kho" onClick={() => handleDispense(order.prescriptionId)}><FiTruck /></button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center">📭 Không có phiếu nào</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* === TAB 2: CATALOG === */}
                {activeTab === 'catalog' && (
                    <div className="catalog-section">
                        <div className="search-bar-container">
                            <div className="search-input">
                                <FiSearch />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm vật tư (Tên, mã, hoạt chất)..." 
                                    value={supplySearch}
                                    onChange={e => setSupplySearch(e.target.value)}
                                    onKeyDown={handleCatalogSearch}
                                />
                            </div>
                            <select 
                                className="category-select"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <button className="btn-primary" onClick={fetchCatalog}>Tìm</button>
                        </div>

                        <div className="supply-grid">
                            {supplies.length > 0 ? supplies.map(item => (
                                <div key={item.id} className="supply-card">
                                    <div className="supply-header">
                                        <span className="supply-cat">{item.category}</span>
                                        <span className="supply-stock">Tồn: <strong>{item.stockQuantity}</strong></span>
                                    </div>
                                    <h4>{item.name}</h4>
                                    <div className="supply-unit">Đơn vị: {item.unit}</div>
                                </div>
                            )) : (
                                <p className="text-center w-100">Không tìm thấy vật tư nào.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* === TAB 3: RECYCLE BIN === */}
                {activeTab === 'recycle' && (
                    <div className="recycle-section">
                        <div className="alert-box warning">
                            ⚠️ <strong>Lưu ý:</strong> Dữ liệu sau khi khôi phục sẽ quay trở lại danh sách hoạt động và có thể sử dụng ngay lập tức.
                        </div>
                        <h3>Vật tư đã xóa ({deletedItems.length})</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tên vật tư</th>
                                    <th>Danh mục</th>
                                    <th>Ngày xóa</th>
                                    <th>Khôi phục</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deletedItems.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td>{formatDate(item.deletedAt)}</td>
                                        <td>
                                            <button className="btn-restore" onClick={() => handleRestore(item.id)}>
                                                <FiRefreshCw /> Khôi phục
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT PHIẾU */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Phiếu #{selectedOrder.prescriptionId}</h3>
                            <button className="btn-close" onClick={() => setShowOrderModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="info-grid">
                                <div><strong>Bệnh nhân ID:</strong> {selectedOrder.patientId}</div>
                                <div><strong>Encounter:</strong> {selectedOrder.encounterId}</div>
                                <div><strong>Ngày tạo:</strong> {formatDate(selectedOrder.createdAt)}</div>
                                <div><strong>Trạng thái:</strong> {selectedOrder.status}</div>
                            </div>
                            
                            <h4>Danh sách vật tư</h4>
                            <table className="detail-table">
                                <thead><tr><th>Tên vật tư</th><th>SL</th><th>Ghi chú</th></tr></thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.materialName}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowOrderModal(false)}>Đóng</button>
                            {selectedOrder.status === 'PENDING' && (
                                <button className="btn-primary" onClick={() => handleApprove(selectedOrder.prescriptionId)}>Duyệt Phiếu</button>
                            )}
                            {selectedOrder.status === 'APPROVED' && (
                                <button className="btn-primary" onClick={() => handleDispense(selectedOrder.prescriptionId)}>Xuất Kho Ngay</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalSupplyPage;