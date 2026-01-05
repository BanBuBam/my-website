import React, { useState, useEffect } from 'react';
import './CabinetManagementPage.css';
import { 
    FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, 
    FiLock, FiUnlock, FiAlertTriangle, FiClock, FiTool, FiPackage 
} from 'react-icons/fi';
import { 
    pharmacistCabinetAPI, 
    pharmacistDepartmentAPI, 
    pharmacistEmployeeAPI 
} from '../../../../services/staff/pharmacistAPI';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../../components/Pagination';

const CabinetManagementPage = () => {
    const navigate = useNavigate();
    
    // ==================== STATE MANAGEMENT ====================

    // Data & UI State
    const [cabinets, setCabinets] = useState([]);
    const [allCabinets, setAllCabinets] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination State
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });

    // View Mode: 'active', 'inactive', 'locked', 'all'
    const [viewMode, setViewMode] = useState('active'); 
    const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0, locked: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showAccessLogModal, setShowAccessLogModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    // Form & Sub-data States
    const [submitting, setSubmitting] = useState(false);
    const [lockStatusCache, setLockStatusCache] = useState({});
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Sub-data
    const [alerts, setAlerts] = useState([]);
    const [accessLog, setAccessLog] = useState([]);
    const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
    const [inventoryData, setInventoryData] = useState(null);
    const [loadingInventory, setLoadingInventory] = useState(false);

    // Form Data
    const [createFormData, setCreateFormData] = useState({
        cabinetLocation: '', cabinetType: 'MEDICATION', departmentId: '', 
        responsibleEmployeeId: '', description: '', isActive: true, 
        isLocked: false, accessLevel: 'PUBLIC', maxCapacity: '', 
        securityCode: '', notes: ''
    });

    const [maintenanceFormData, setMaintenanceFormData] = useState({ 
        maintenanceType: 'CLEANING', scheduledDate: '', notes: '' 
    });
    
    const [assignEmployeeId, setAssignEmployeeId] = useState('');
    const [accessLogDateRange, setAccessLogDateRange] = useState({ startDate: '', endDate: '' });

    // ==================== EFFECTS ====================

    useEffect(() => {
        loadDepartments();
        loadCabinets(0);
        // [MỚI] Gọi API lấy danh sách khóa ngay khi vào trang để update số lượng
        fetchLockedCount();
    }, []);

    useEffect(() => {
        setSearchTerm('');
        loadCabinets(0);
        // Nếu chuyển sang tab khác không phải locked, vẫn nên refresh lại số lượng locked
        if (viewMode !== 'locked') {
            fetchLockedCount();
        }
    }, [viewMode]);

    // ==================== CORE DATA LOADING ====================

    // [MỚI] Hàm riêng để lấy số lượng tủ đang khóa
    const fetchLockedCount = async () => {
        try {
            const response = await pharmacistCabinetAPI.getLockedCabinets();
            if (response && (response.status === 'OK' || response.code === 200)) {
                const data = response.data || [];
                setStats(prev => ({ ...prev, locked: data.length }));
            }
        } catch (e) {
            console.error("Không thể lấy số lượng tủ khóa", e);
        }
    };

    const loadCabinets = async (page) => {
        try {
            setLoading(true);
            setError(null);
            let response;

            // --- TRƯỜNG HỢP 1: LOCKED MODE (API Riêng) ---
            if (viewMode === 'locked') {
                response = await pharmacistCabinetAPI.getLockedCabinets();
                
                if (response && (response.status === 'OK' || response.code === 200)) {
                    const data = response.data || [];
                    setAllCabinets(data);
                    
                    // Client-side pagination cho Locked list
                    const pageSize = pagination.pageSize;
                    const totalElements = data.length;
                    const totalPages = Math.ceil(totalElements / pageSize);
                    const startIndex = page * pageSize;
                    const endIndex = startIndex + pageSize;
                    
                    setCabinets(data.slice(startIndex, endIndex));
                    
                    // Cập nhật stats
                    setStats(prev => ({ ...prev, locked: totalElements }));

                    setPagination({
                        currentPage: page,
                        totalPages: totalPages > 0 ? totalPages : 1,
                        totalElements: totalElements,
                        pageSize: pageSize
                    });
                } else {
                    throw new Error(response.message || 'Không thể tải danh sách tủ khóa');
                }
            } 
            // --- TRƯỜNG HỢP 2: CÁC MODE KHÁC (API Chung) ---
            else {
                response = await pharmacistCabinetAPI.getAllCabinets(page, pagination.pageSize);

                if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                    const data = response.data;
                    let content = [];
                    
                    if (data.content) {
                        content = data.content;
                        setPagination({
                            currentPage: data.page || 0,
                            totalPages: data.totalPages || 0,
                            totalElements: data.totalElements || 0,
                            pageSize: data.size || 20
                        });
                    } else if (Array.isArray(data)) {
                        content = data;
                    }

                    setAllCabinets(content);
                    
                    // Cập nhật stats ước lượng (active/inactive) từ trang hiện tại
                    // (Lưu ý: Để chính xác tuyệt đối cần API stats tổng quát từ BE)
                    const activeCount = content.filter(c => c.isActive).length;
                    const inactiveCount = content.filter(c => !c.isActive).length;
                    
                    setStats(prev => ({
                        ...prev,
                        total: data.totalElements || content.length,
                        active: activeCount, // Tạm tính trên trang này
                        inactive: inactiveCount
                    }));

                    // Filter hiển thị
                    if (viewMode === 'active') {
                        setCabinets(content.filter(c => c.isActive === true));
                    } else if (viewMode === 'inactive') {
                        setCabinets(content.filter(c => c.isActive === false));
                    } else {
                        setCabinets(content);
                    }
                } else {
                    throw new Error('Không thể tải danh sách tủ');
                }
            }
        } catch (err) {
            console.error('Error loading cabinets:', err);
            setError(getErrorMessage(err));
            setAllCabinets([]);
            setCabinets([]);
        } finally {
            setLoading(false);
        }
    };

    // ==================== SEARCH & PAGINATION ====================

    const handlePageChange = (newPage) => {
        if (viewMode === 'locked') {
            // Client-side pagination logic
            let sourceData = allCabinets;
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim();
                sourceData = allCabinets.filter(c => 
                    c.cabinetLocation?.toLowerCase().includes(term) ||
                    c.departmentName?.toLowerCase().includes(term)
                );
            }
            const pageSize = pagination.pageSize;
            setCabinets(sourceData.slice(newPage * pageSize, (newPage + 1) * pageSize));
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        } else {
            loadCabinets(newPage);
        }
    };

    const handleSearch = () => {
        const term = searchTerm.toLowerCase().trim();

        if (viewMode === 'locked') {
            const filtered = allCabinets.filter(cabinet => 
                cabinet.cabinetId?.toString().includes(term) ||
                cabinet.cabinetLocation?.toLowerCase().includes(term) ||
                cabinet.departmentName?.toLowerCase().includes(term) ||
                cabinet.responsibleEmployeeName?.toLowerCase().includes(term)
            );
            const pageSize = pagination.pageSize;
            setCabinets(filtered.slice(0, pageSize));
            setPagination({
                currentPage: 0,
                totalPages: Math.ceil(filtered.length / pageSize) || 1,
                totalElements: filtered.length,
                pageSize: pageSize
            });
        } else {
            // Client-side search for current page content (active/inactive/all)
            if (!term) {
                if (viewMode === 'active') setCabinets(allCabinets.filter(c => c.isActive));
                else if (viewMode === 'inactive') setCabinets(allCabinets.filter(c => !c.isActive));
                else setCabinets(allCabinets);
            } else {
                const filtered = allCabinets.filter(cabinet => {
                    const matches = (
                        cabinet.cabinetLocation?.toLowerCase().includes(term) ||
                        cabinet.departmentName?.toLowerCase().includes(term)
                    );
                    if (viewMode === 'active') return matches && cabinet.isActive;
                    if (viewMode === 'inactive') return matches && !cabinet.isActive;
                    return matches;
                });
                setCabinets(filtered);
            }
        }
    };

    // ==================== AUXILIARY DATA ====================

    const loadDepartments = async () => {
        try {
            const response = await pharmacistDepartmentAPI.getDepartments('', 0, 50);
            if (response?.status === 'OK' || response?.code === 200) {
                setDepartments(response.data?.content || response.data || []);
            }
        } catch (err) { console.error(err); }
    };

    const loadEmployeesByDepartment = async (departmentId) => {
        if (!departmentId) { setFilteredEmployees([]); return; }
        try {
            setLoadingEmployees(true);
            const response = await pharmacistEmployeeAPI.getEmployeesByDepartment(departmentId);
            if (response?.status === 'OK' || response?.code === 200) {
                setFilteredEmployees(response.data?.content || response.data || []);
            }
        } catch (err) { console.error(err); } finally { setLoadingEmployees(false); }
    };

    // ==================== HANDLERS ====================

    const handleRefresh = () => { setSearchTerm(''); loadCabinets(0); fetchLockedCount(); };
    
    // Create
    const handleOpenCreateModal = () => {
        setCreateFormData({
            cabinetLocation: '', cabinetType: 'MEDICATION', departmentId: '', 
            responsibleEmployeeId: '', description: '', isActive: true, 
            isLocked: false, accessLevel: 'PUBLIC', maxCapacity: '', 
            securityCode: '', notes: ''
        });
        setFilteredEmployees([]);
        setShowCreateModal(true);
    };
    
    const handleCloseCreateModal = () => setShowCreateModal(false);
    
    const handleCreateInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'departmentId') {
            setCreateFormData(prev => ({ ...prev, departmentId: value, responsibleEmployeeId: '' }));
            if (value) loadEmployeesByDepartment(value);
        } else {
            setCreateFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await pharmacistCabinetAPI.createCabinet({
                ...createFormData,
                departmentId: parseInt(createFormData.departmentId),
                responsibleEmployeeId: parseInt(createFormData.responsibleEmployeeId),
                maxCapacity: parseInt(createFormData.maxCapacity)
            });
            alert('✅ Tạo tủ thành công!');
            handleCloseCreateModal();
            loadCabinets(0);
            fetchLockedCount(); // Update lại số lượng locked nếu tạo mới bị lock
        } catch (err) { alert('❌ Lỗi: ' + getErrorMessage(err)); } finally { setSubmitting(false); }
    };

    // Lock/Unlock
    const handleLockUnlock = async (cabinet) => {
        const currentStatus = lockStatusCache[cabinet.cabinetId] ?? cabinet.isLocked;
        const action = currentStatus ? 'MỞ KHÓA' : 'KHÓA';
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tủ "${cabinet.cabinetLocation}"?`)) return;

        try {
            await pharmacistCabinetAPI.lockUnlockCabinet(cabinet.cabinetId, !currentStatus);
            alert(`✅ Đã ${action} thành công!`);
            setLockStatusCache(prev => ({ ...prev, [cabinet.cabinetId]: !currentStatus }));
            
            // Reload nếu đang ở tab Locked và vừa mở khóa
            if (viewMode === 'locked' && currentStatus === true) {
                loadCabinets(0); 
            } else {
                setCabinets(prev => prev.map(c => c.cabinetId === cabinet.cabinetId ? { ...c, isLocked: !currentStatus } : c));
                fetchLockedCount(); // Update số lượng trên badge
            }
        } catch (err) { alert('❌ Lỗi: ' + getErrorMessage(err)); }
    };

    // Other Actions
    const handleDeactivate = async (cabinet) => {
        const reason = window.prompt('Nhập lý do ngừng hoạt động:');
        if (!reason) return;
        try {
            await pharmacistCabinetAPI.deactivateCabinet(cabinet.cabinetId, reason);
            alert('✅ Đã ngừng hoạt động tủ!');
            loadCabinets(pagination.currentPage);
        } catch (err) { alert('❌ ' + getErrorMessage(err)); }
    };

    const handleViewDetail = (c) => { setSelectedCabinet(c); setShowDetailModal(true); };
    const handleOpenEditModal = () => alert('⚠️ Tính năng đang phát triển');

    // Modal Loaders
    const handleViewAlerts = async (c) => {
        try {
            setSelectedCabinet(c);
            const res = await pharmacistCabinetAPI.getCabinetAlerts(c.cabinetId);
            if (res?.status === 'OK' || res?.code === 200) {
                setAlerts(Array.isArray(res.data) ? res.data : []);
                setShowAlertsModal(true);
            }
        } catch(e) { alert(getErrorMessage(e)); }
    };

    const handleViewInventory = async (c) => {
        try {
            setSelectedCabinet(c);
            setLoadingInventory(true);
            setShowInventoryModal(true);
            const res = await pharmacistCabinetAPI.getCabinetInventory(c.cabinetId);
            if(res?.status === 'OK' || res?.code === 200) setInventoryData(res.data);
        } catch(e) { alert(getErrorMessage(e)); } finally { setLoadingInventory(false); }
    };
    
    const handleRefreshInventory = () => handleViewInventory(selectedCabinet);

    const handleViewAccessLog = async (c) => {
        try {
            setSelectedCabinet(c);
            const res = await pharmacistCabinetAPI.getCabinetAccessLog(c.cabinetId, accessLogDateRange.startDate, accessLogDateRange.endDate);
            if(res?.status === 'OK' || res?.code === 200) {
                setAccessLog(Array.isArray(res.data) ? res.data : []);
                setShowAccessLogModal(true);
            }
        } catch(e) { alert(getErrorMessage(e)); }
    };

    const handleViewMaintenance = async (c) => {
        try {
            setSelectedCabinet(c);
            const res = await pharmacistCabinetAPI.getCabinetMaintenance(c.cabinetId);
            if(res?.status === 'OK' || res?.code === 200) {
                setMaintenanceSchedule(Array.isArray(res.data) ? res.data : []);
                setShowMaintenanceModal(true);
            }
        } catch(e) { alert(getErrorMessage(e)); }
    };

    const handleOpenScheduleMaintenance = (c) => {
        setSelectedCabinet(c);
        setMaintenanceFormData({ maintenanceType: 'CLEANING', scheduledDate: '', notes: '' });
        setShowScheduleMaintenanceModal(true);
    };

    const handleScheduleMaintenance = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await pharmacistCabinetAPI.scheduleCabinetMaintenance(selectedCabinet.cabinetId, maintenanceFormData.maintenanceType, maintenanceFormData.scheduledDate, maintenanceFormData.notes);
            alert('✅ Đã lên lịch!');
            setShowScheduleMaintenanceModal(false);
        } catch(err) { alert('❌ ' + getErrorMessage(err)); } finally { setSubmitting(false); }
    };

    const handleOpenAssignEmployee = (c) => {
        setSelectedCabinet(c);
        setAssignEmployeeId(c.responsibleEmployeeId || '');
        setShowAssignEmployeeModal(true);
    };

    const handleAssignEmployee = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await pharmacistCabinetAPI.assignResponsibleEmployee(selectedCabinet.cabinetId, assignEmployeeId);
            alert('✅ Đã gán thành công!');
            setShowAssignEmployeeModal(false);
            loadCabinets(pagination.currentPage);
        } catch(err) { alert('❌ ' + getErrorMessage(err)); } finally { setSubmitting(false); }
    };

    // ==================== VIETNAMESE HELPERS ====================
    const getErrorMessage = (err) => err.response?.data?.message || err.message || 'Lỗi hệ thống';
    const getCurrentLockStatus = (c) => lockStatusCache[c.cabinetId] ?? c.isLocked;
    const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN') : 'N/A';
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';
    
    // Việt hóa loại tủ
    const getCabinetTypeLabel = (t) => ({
        'MEDICATION': 'Tủ thuốc',
        'MATERIAL': 'Tủ vật tư',
        'EQUIPMENT': 'Thiết bị',
        'EMERGENCY': 'Tủ cấp cứu'
    }[t] || t);

    // Việt hóa mức độ truy cập
    const getAccessLevelLabel = (l) => ({
        'PUBLIC': 'Công khai',
        'RESTRICTED': 'Hạn chế',
        'PRIVATE': 'Riêng tư',
        'CONTROLLED': 'Kiểm soát'
    }[l] || l);

    // Việt hóa loại bảo trì
    const getMaintenanceTypeLabel = (t) => ({
        'CLEANING': 'Vệ sinh',
        'REPAIR': 'Sửa chữa',
        'INSPECTION': 'Kiểm tra',
        'CALIBRATION': 'Hiệu chuẩn'
    }[t] || t);

    const getUtilizationColor = (p) => p < 50 ? '#28a745' : p < 80 ? '#ffc107' : '#dc3545';
    const getSeverityClass = (s) => ({'LOW':'severity-low','MEDIUM':'severity-medium','HIGH':'severity-high'}[s] || 'severity-low');
    
    // Việt hóa trạng thái bảo trì
    const getMaintenanceStatusInfo = (s) => ({
        'SCHEDULED':{label:'Đã lên lịch',class:'badge-scheduled'},
        'COMPLETED':{label:'Hoàn thành',class:'badge-completed'},
        'PENDING':{label:'Chờ xử lý',class:'badge-pending'}
    }[s] || {label:s,class:'badge-default'});
    
    const isExpiredDate = (d) => d ? new Date(d) < new Date().setHours(0,0,0,0) : false;
    const isExpiringWithin30Days = (d) => {
        if(!d) return false;
        const expiry = new Date(d);
        const today = new Date();
        const next30 = new Date(); next30.setDate(today.getDate()+30);
        return expiry >= today && expiry <= next30;
    };

    // ==================== RENDER ====================
    return (
        <div className="cabinet-management-page">
            <div className="page-header">
                <div className="header-left">
                    <h2>💊 Quản lý Tủ thuốc/Vật tư</h2>
                    <p>Quản lý tủ thuốc, vật tư y tế và thiết bị (Giao diện Dược sĩ)</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} /> Làm mới
                    </button>
                    <button className="btn-primary" onClick={handleOpenCreateModal}>
                        <FiPlus /> Thêm tủ mới
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="stats-cards">
                <div className={`stat-card active ${viewMode === 'active' ? 'selected' : ''}`} onClick={() => setViewMode('active')} style={{cursor:'pointer'}}>
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-label">Đang hoạt động</div>
                        <div className="stat-value">{stats.active}</div>
                    </div>
                </div>
                <div className={`stat-card inactive ${viewMode === 'inactive' ? 'selected' : ''}`} onClick={() => setViewMode('inactive')} style={{cursor:'pointer'}}>
                    <div className="stat-icon">⏸️</div>
                    <div className="stat-info">
                        <div className="stat-label">Ngừng hoạt động</div>
                        <div className="stat-value">{stats.inactive}</div>
                    </div>
                </div>
                <div className={`stat-card total ${viewMode === 'all' ? 'selected' : ''}`} onClick={() => setViewMode('all')} style={{cursor:'pointer'}}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <div className="stat-label">Tổng số tủ</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                </div>
                <div className={`stat-card locked ${viewMode === 'locked' ? 'selected' : ''}`} onClick={() => setViewMode('locked')} style={{cursor: 'pointer'}}>
                    <div className="stat-icon">🔒</div>
                    <div className="stat-info">
                        <div className="stat-label">Đang khóa</div>
                        <div className="stat-value">{stats.locked}</div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="view-tabs">
                <button className={`tab ${viewMode === 'active' ? 'active' : ''}`} onClick={() => setViewMode('active')}>
                    Đang hoạt động ({stats.active})
                </button>
                <button className={`tab ${viewMode === 'inactive' ? 'active' : ''}`} onClick={() => setViewMode('inactive')}>
                    Ngừng hoạt động ({stats.inactive})
                </button>
                <button className={`tab ${viewMode === 'locked' ? 'active' : ''}`} onClick={() => setViewMode('locked')}>
                    <FiLock style={{marginRight:'5px'}}/> Đang khóa ({stats.locked})
                </button>
                <button className={`tab ${viewMode === 'all' ? 'active' : ''}`} onClick={() => setViewMode('all')}>
                    Tất cả ({stats.total})
                </button>
            </div>

            {/* SEARCH */}
            <div className="search-section">
                <div className="search-input-group">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder={viewMode === 'locked' ? "Tìm trong danh sách tủ khóa..." : "Tìm kiếm theo vị trí, khoa phòng..."} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                    />
                </div>
                <button className="btn-search" onClick={handleSearch} disabled={loading}><FiSearch /> Tìm kiếm</button>
            </div>

            {/* TABLE */}
            {loading ? (
                <div className="loading-state"><p>⏳ Đang tải danh sách tủ...</p></div>
            ) : error ? (
                <div className="error-message"><p>❌ {error}</p></div>
            ) : cabinets.length > 0 ? (
                <div className="cabinet-table-container">
                    <table className="cabinet-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Vị trí tủ</th>
                                <th>Loại tủ</th>
                                <th>Khoa phòng</th>
                                <th>Người chịu trách nhiệm</th>
                                <th>Tỷ lệ sử dụng</th>
                                <th>Trạng thái</th>
                                <th>Khóa</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cabinets.map((cabinet, index) => (
                                <tr key={cabinet.cabinetId}>
                                    <td>{(pagination.currentPage * pagination.pageSize) + index + 1}</td>
                                    <td>
                                        <strong>{cabinet.cabinetLocation}</strong>
                                        {cabinet.description && <div style={{fontSize:'0.8rem', color:'#666'}}>{cabinet.description}</div>}
                                    </td>
                                    <td><span className={`badge badge-type-${cabinet.cabinetType?.toLowerCase()}`}>{getCabinetTypeLabel(cabinet.cabinetType)}</span></td>
                                    <td>{cabinet.departmentName || 'N/A'}</td>
                                    <td>{cabinet.responsibleEmployeeName || 'Chưa gán'}</td>
                                    <td>
                                        <div className="utilization-container">
                                            <div className="utilization-bar">
                                                <div className="utilization-fill" style={{ width: `${cabinet.occupancyRate || 0}%`, backgroundColor: getUtilizationColor(cabinet.occupancyRate || 0) }}></div>
                                            </div>
                                            <span className="utilization-text">{cabinet.occupancyRate || 0}%</span>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${cabinet.isActive ? 'badge-active' : 'badge-inactive'}`}>{cabinet.isActive ? 'Hoạt động' : 'Ngừng'}</span></td>
                                    <td>
                                        <span className="lock-icon" style={{ color: getCurrentLockStatus(cabinet) ? '#dc3545' : '#28a745', fontWeight: 'bold', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                                            {getCurrentLockStatus(cabinet) ? <><FiLock /> Đã khóa</> : <><FiUnlock /> Mở</>}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-view" onClick={() => handleViewDetail(cabinet)} title="Xem chi tiết"><FiEye /></button>
                                            
                                            {(cabinet.isActive || getCurrentLockStatus(cabinet)) && (
                                                <button className="btn-icon btn-lock" onClick={() => handleLockUnlock(cabinet)} 
                                                    title={getCurrentLockStatus(cabinet) ? 'Mở khóa' : 'Khóa'} 
                                                    style={{ background: getCurrentLockStatus(cabinet) ? '#28a745' : '#ffc107' }}>
                                                    {getCurrentLockStatus(cabinet) ? <FiUnlock /> : <FiLock />}
                                                </button>
                                            )}
                                            
                                            {cabinet.isActive && (
                                                <>
                                                    <button className="btn-icon btn-edit" onClick={() => handleOpenEditModal(cabinet)} title="Sửa"><FiEdit2 /></button>
                                                    <button className="btn-icon btn-alert" onClick={() => handleViewAlerts(cabinet)} title="Cảnh báo"><FiAlertTriangle /></button>
                                                    <button className="btn-icon btn-log" onClick={() => handleViewAccessLog(cabinet)} title="Lịch sử"><FiClock /></button>
                                                    <button className="btn-icon btn-maintenance" onClick={() => handleViewMaintenance(cabinet)} title="Bảo trì"><FiTool /></button>
                                                    <button className="btn-icon btn-inventory" onClick={() => handleViewInventory(cabinet)} title="Tồn kho" style={{ background: '#17a2b8' }}><FiPackage /></button>
                                                    <button className="btn-icon btn-deactivate" onClick={() => handleDeactivate(cabinet)} title="Ngừng"><FiTrash2 /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>{viewMode === 'locked' ? '✅ Không có tủ nào đang bị khóa' : '📦 Không tìm thấy tủ nào'}</p>
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                isFirst={pagination.currentPage === 0}
                isLast={pagination.currentPage >= pagination.totalPages - 1}
            />

            {/* --- MODALS SECTION --- */}
            
            {/* 1. Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleCloseCreateModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>➕ Thêm tủ mới</h3><button className="btn-close" onClick={handleCloseCreateModal}>✕</button></div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group"><label>Vị trí <span className="required">*</span></label><input type="text" name="cabinetLocation" value={createFormData.cabinetLocation} onChange={handleCreateInputChange} required /></div>
                                    <div className="form-group"><label>Loại <span className="required">*</span></label><select name="cabinetType" value={createFormData.cabinetType} onChange={handleCreateInputChange} required><option value="MEDICATION">Tủ thuốc</option><option value="MATERIAL">Tủ vật tư</option><option value="EQUIPMENT">Thiết bị</option></select></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Khoa <span className="required">*</span></label><select name="departmentId" value={createFormData.departmentId} onChange={handleCreateInputChange} required><option value="">--Chọn--</option>{departments.map(d=><option key={d.departmentId||d.id} value={d.departmentId||d.id}>{d.departmentName||d.name}</option>)}</select></div>
                                    <div className="form-group"><label>Phụ trách <span className="required">*</span></label><select name="responsibleEmployeeId" value={createFormData.responsibleEmployeeId} onChange={handleCreateInputChange} required disabled={loadingEmployees}><option value="">--Chọn--</option>{filteredEmployees.map(e=><option key={e.id||e.employeeId} value={e.id||e.employeeId}>{e.fullName}</option>)}</select></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Truy cập</label><select name="accessLevel" value={createFormData.accessLevel} onChange={handleCreateInputChange}><option value="PUBLIC">Công khai</option><option value="RESTRICTED">Hạn chế</option><option value="PRIVATE">Riêng tư</option></select></div>
                                    <div className="form-group"><label>Sức chứa</label><input type="number" name="maxCapacity" value={createFormData.maxCapacity} onChange={handleCreateInputChange} min="1" required /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Mã bảo mật</label><input type="text" name="securityCode" value={createFormData.securityCode} onChange={handleCreateInputChange} /></div>
                                    <div className="form-group checkbox-group">
                                        <label><input type="checkbox" name="isActive" checked={createFormData.isActive} onChange={handleCreateInputChange} /> Hoạt động</label>
                                        <label><input type="checkbox" name="isLocked" checked={createFormData.isLocked} onChange={handleCreateInputChange} /> Khóa</label>
                                    </div>
                                </div>
                                <div className="form-group"><label>Mô tả</label><textarea name="description" value={createFormData.description} onChange={handleCreateInputChange} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn-secondary" onClick={handleCloseCreateModal}>Hủy</button><button type="submit" className="btn-primary" disabled={submitting}>Lưu</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Detail Modal */}
            {showDetailModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>👁️ Chi tiết tủ</h3><button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="detail-row"><span className="detail-label">Vị trí:</span><span className="detail-value"><strong>{selectedCabinet.cabinetLocation}</strong></span></div>
                            <div className="detail-row"><span className="detail-label">Loại:</span><span className="detail-value">{getCabinetTypeLabel(selectedCabinet.cabinetType)}</span></div>
                            <div className="detail-row"><span className="detail-label">Khoa:</span><span className="detail-value">{selectedCabinet.departmentName}</span></div>
                            <div className="detail-row"><span className="detail-label">Phụ trách:</span><span className="detail-value">{selectedCabinet.responsibleEmployeeName}</span></div>
                            <div className="detail-row"><span className="detail-label">Sức chứa:</span><span className="detail-value">{selectedCabinet.capacityDisplay || `${selectedCabinet.currentCapacity||0}/${selectedCabinet.maxCapacity}`}</span></div>
                            <div className="detail-row"><span className="detail-label">Mức độ truy cập:</span><span className="detail-value">{getAccessLevelLabel(selectedCabinet.accessLevel)}</span></div>
                            <div className="detail-row"><span className="detail-label">Trạng thái:</span><span className={`detail-value status ${selectedCabinet.isActive?'active':'inactive'}`}>{selectedCabinet.isActive?'Hoạt động':'Ngừng'}</span></div>
                            <div className="detail-row"><span className="detail-label">Khóa:</span><span className="detail-value" style={{color: selectedCabinet.isLocked?'red':'green'}}>{selectedCabinet.isLocked?'ĐÃ KHÓA':'MỞ'}</span></div>
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* 3. Inventory Modal */}
            {showInventoryModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{maxWidth: '1200px'}}>
                        <div className="modal-header"><h3>📦 Tồn kho - {selectedCabinet.cabinetLocation}</h3><button className="btn-close" onClick={() => setShowInventoryModal(false)}>✕</button></div>
                        <div className="modal-body">
                            {loadingInventory ? <div className="loading-state"><p>⏳ Đang tải...</p></div> : inventoryData && Array.isArray(inventoryData) ? (
                                <>
                                    <div className="inventory-summary" style={{padding:'10px', background:'#f8f9fa', marginBottom:'10px', borderRadius:'8px', display:'flex', gap:'20px'}}>
                                        <div><strong>Tổng items:</strong> {inventoryData.length}</div>
                                        <div style={{color:'green'}}><strong>Thuốc:</strong> {inventoryData.filter(i=>i.item_type==='MEDICINE').length}</div>
                                        <div style={{color:'orange'}}><strong>Vật tư:</strong> {inventoryData.filter(i=>i.item_type==='SUPPLY').length}</div>
                                    </div>
                                    <div className="cabinet-table-container">
                                        <table className="cabinet-table">
                                            <thead><tr><th>STT</th><th>Tên</th><th>Loại</th><th>Số lô</th><th>SL</th><th>HSD</th><th>Trạng thái</th></tr></thead>
                                            <tbody>
                                                {inventoryData.map((item, idx) => {
                                                    const isExp = isExpiredDate(item.expiry_date);
                                                    const isNear = isExpiringWithin30Days(item.expiry_date);
                                                    return (
                                                        <tr key={idx} style={{background: isExp ? '#ffecec' : isNear ? '#fff8e1' : 'inherit'}}>
                                                            <td>{idx+1}</td>
                                                            <td><strong>{item.item_name}</strong></td>
                                                            <td>{item.item_type}</td>
                                                            <td>{item.batch_number}</td>
                                                            <td style={{fontWeight:'bold', color: item.quantity<=10?'red':'green'}}>{item.quantity}</td>
                                                            <td>{formatDate(item.expiry_date)}{isExp && ' (Hết hạn)'}</td>
                                                            <td>{item.status}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : <div className="empty-state"><p>Không có dữ liệu tồn kho</p></div>}
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowInventoryModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* 4. Alerts Modal */}
            {showAlertsModal && (
                <div className="modal-overlay" onClick={() => setShowAlertsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>⚠️ Cảnh báo</h3><button className="btn-close" onClick={() => setShowAlertsModal(false)}>✕</button></div>
                        <div className="modal-body">
                            {alerts.length > 0 ? (
                                <div className="alerts-list">
                                    {alerts.map((a, i) => (
                                        <div key={i} className={`alert-item ${getSeverityClass(a.severity)}`}>
                                            <div className="alert-header"><strong>{a.alertType}</strong> <span className="severity-badge">{a.severity}</span></div>
                                            <div>{a.message}</div>
                                            <small>{formatDateTime(a.createdAt)}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-center">✅ Không có cảnh báo nào</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Access Log Modal */}
            {showAccessLogModal && (
                <div className="modal-overlay" onClick={() => setShowAccessLogModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>🕒 Lịch sử truy cập</h3><button className="btn-close" onClick={() => setShowAccessLogModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="date-filter">
                                <input type="date" onChange={(e) => setAccessLogDateRange(p=>({...p, startDate:e.target.value}))}/>
                                <input type="date" onChange={(e) => setAccessLogDateRange(p=>({...p, endDate:e.target.value}))}/>
                                <button className="btn-primary" onClick={() => handleViewAccessLog(selectedCabinet)}>Lọc</button>
                            </div>
                            <div className="access-log-table-container">
                                <table className="access-log-table">
                                    <thead><tr><th>NV</th><th>Hành động</th><th>Thời gian</th></tr></thead>
                                    <tbody>
                                        {accessLog.map((log, i) => (
                                            <tr key={i}><td>{log.employeeName}</td><td>{log.action}</td><td>{formatDateTime(log.timestamp)}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Maintenance Modal */}
            {showMaintenanceModal && (
                <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
                    <div className="modal-content modal-large">
                        <div className="modal-header"><h3>🔧 Bảo trì</h3><button className="btn-close" onClick={() => setShowMaintenanceModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="maintenance-actions"><button className="btn-primary" onClick={() => { setShowMaintenanceModal(false); handleOpenScheduleMaintenance(selectedCabinet); }}><FiPlus/> Lên lịch</button></div>
                            <table className="maintenance-table">
                                <thead><tr><th>Loại</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
                                <tbody>
                                    {maintenanceSchedule.map((m, i) => (
                                        <tr key={i}>
                                            <td>{getMaintenanceTypeLabel(m.maintenanceType)}</td>
                                            <td>{formatDate(m.scheduledDate)}</td>
                                            <td><span className={`badge ${getMaintenanceStatusInfo(m.status).class}`}>{getMaintenanceStatusInfo(m.status).label}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Schedule Maintenance Modal */}
            {showScheduleMaintenanceModal && (
                <div className="modal-overlay" onClick={() => setShowScheduleMaintenanceModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>📅 Lên lịch bảo trì</h3><button className="btn-close" onClick={() => setShowScheduleMaintenanceModal(false)}>✕</button></div>
                        <form onSubmit={handleScheduleMaintenance}>
                            <div className="modal-body">
                                <div className="form-group"><label>Loại</label><select value={maintenanceFormData.maintenanceType} onChange={(e) => setMaintenanceFormData(p=>({...p, maintenanceType:e.target.value}))}><option value="CLEANING">Vệ sinh</option><option value="REPAIR">Sửa chữa</option><option value="INSPECTION">Kiểm tra</option><option value="CALIBRATION">Hiệu chuẩn</option></select></div>
                                <div className="form-group"><label>Ngày</label><input type="date" value={maintenanceFormData.scheduledDate} onChange={(e) => setMaintenanceFormData(p=>({...p, scheduledDate:e.target.value}))} required /></div>
                                <div className="form-group"><label>Ghi chú</label><textarea value={maintenanceFormData.notes} onChange={(e) => setMaintenanceFormData(p=>({...p, notes:e.target.value}))}/></div>
                            </div>
                            <div className="modal-footer"><button className="btn-primary" type="submit" disabled={submitting}>Lưu</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* 8. Assign Employee Modal */}
            {showAssignEmployeeModal && (
                <div className="modal-overlay" onClick={() => setShowAssignEmployeeModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>👤 Gán phụ trách</h3><button className="btn-close" onClick={() => setShowAssignEmployeeModal(false)}>✕</button></div>
                        <form onSubmit={handleAssignEmployee}>
                            <div className="modal-body">
                                <div className="form-group"><label>Nhân viên</label><select value={assignEmployeeId} onChange={(e)=>setAssignEmployeeId(e.target.value)} required><option value="">--Chọn--</option>{employees.map(e=><option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>)}</select></div>
                            </div>
                            <div className="modal-footer"><button className="btn-primary" type="submit" disabled={submitting}>Lưu</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetManagementPage;