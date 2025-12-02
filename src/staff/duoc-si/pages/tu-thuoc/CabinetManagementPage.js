import React, { useState, useEffect } from 'react';
import './CabinetManagementPage.css';
import { FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiLock, FiUnlock, FiAlertTriangle, FiClock, FiTool, FiPackage } from 'react-icons/fi';
// Import API của Dược sĩ thay vì Admin
import { pharmacistCabinetAPI, pharmacistDepartmentAPI, pharmacistEmployeeAPI } from '../../../../services/staff/pharmacistAPI';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../../components/Pagination';

const CabinetManagementPage = () => {
    const navigate = useNavigate();
    // State quản lý danh sách và UI
    const [cabinets, setCabinets] = useState([]);
    const [allCabinets, setAllCabinets] = useState([]); // Lưu toàn bộ danh sách để tìm kiếm
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });

    // State cho modals
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showAccessLogModal, setShowAccessLogModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false); // Mới thêm từ Admin layout

    // State cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('active'); // 'active', 'inactive', 'all'
    const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0, locked: 0 });
    const [submitting, setSubmitting] = useState(false);

    // State cho lock status checking
    const [lockStatusCache, setLockStatusCache] = useState({}); // Cache lock status by cabinetId

    // State cho departments và employees
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]); // Có thể không dùng nếu dùng load theo dept
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // State cho form data tạo mới tủ
    const [createFormData, setCreateFormData] = useState({
        cabinetLocation: '',
        cabinetType: 'MEDICATION',
        departmentId: '',
        responsibleEmployeeId: '',
        description: '',
        isActive: true,
        isLocked: false,
        accessLevel: 'PUBLIC',
        maxCapacity: '',
        securityCode: '',
        notes: ''
    });

    // State cho alerts, access log, maintenance
    const [alerts, setAlerts] = useState([]);
    const [accessLog, setAccessLog] = useState([]);
    const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
    const [maintenanceFormData, setMaintenanceFormData] = useState({
        maintenanceType: 'CLEANING',
        scheduledDate: '',
        notes: ''
    });
    const [assignEmployeeId, setAssignEmployeeId] = useState('');
    const [accessLogDateRange, setAccessLogDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // State cho inventory (Mới thêm từ Admin layout)
    const [inventoryData, setInventoryData] = useState(null);
    const [loadingInventory, setLoadingInventory] = useState(false);

    // Load danh sách tủ khi component mount
    useEffect(() => {
        loadCabinets(0);
        loadDepartments();
    }, []);

    // Apply filters khi viewMode thay đổi
    useEffect(() => {
        if (allCabinets.length > 0) {
            applyFilters(allCabinets);
        }
    }, [viewMode]);

    // Load danh sách tủ
    const loadCabinets = async (page) => {
        try {
            setLoading(true);
            setError(null);

            const response = await pharmacistCabinetAPI.getAllCabinets(page, pagination.pageSize);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const data = response.data;

                if (data.content) {
                    setAllCabinets(data.content);
                    calculateStats(data.content);
                    applyFilters(data.content);
                    setPagination({
                        currentPage: data.page || 0,
                        totalPages: data.totalPages || 0,
                        totalElements: data.totalElements || 0,
                        pageSize: data.size || 20
                    });
                } else if (Array.isArray(data)) {
                    setAllCabinets(data);
                    calculateStats(data);
                    applyFilters(data);
                } else {
                    setAllCabinets([]);
                    setCabinets([]);
                }
            } else {
                throw new Error('Không thể tải danh sách tủ');
            }
        } catch (err) {
            console.error('Error loading cabinets:', err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Áp dụng filters
    const applyFilters = (cabinetList) => {
        let filtered = [...cabinetList];

        if (viewMode === 'active') {
            filtered = filtered.filter(c => c.isActive === true);
        } else if (viewMode === 'inactive') {
            filtered = filtered.filter(c => c.isActive === false);
        }

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(cabinet => {
                return (
                    cabinet.cabinetId?.toString().includes(term) ||
                    cabinet.cabinetLocation?.toLowerCase().includes(term) ||
                    cabinet.departmentName?.toLowerCase().includes(term) ||
                    cabinet.responsibleEmployeeName?.toLowerCase().includes(term) ||
                    cabinet.description?.toLowerCase().includes(term) ||
                    cabinet.notes?.toLowerCase().includes(term)
                );
            });
        }
        setCabinets(filtered);
    };

    // Tính toán thống kê
    const calculateStats = (allCabinets) => {
        const active = allCabinets.filter(c => c.isActive === true).length;
        const inactive = allCabinets.filter(c => c.isActive === false).length;
        const locked = allCabinets.filter(c => c.isLocked === true).length;
        setStats({
            active,
            inactive,
            total: allCabinets.length,
            locked
        });
    };

    // Load danh sách khoa phòng
    const loadDepartments = async () => {
        try {
            const response = await pharmacistDepartmentAPI.getDepartments('', 0, 30);
            if (response && (response.status === 'OK' || response.code === 200 || response.status === 'success')) {
                // Response mới có cấu trúc: data.content (paginated)
                const deptData = response.data?.content || response.data || [];
                setDepartments(deptData);
            }
        } catch (err) {
            console.error('Error loading departments:', err);
        }
    };

    // Load danh sách nhân viên theo khoa phòng
    const loadEmployeesByDepartment = async (departmentId) => {
        if (!departmentId) {
            setFilteredEmployees([]);
            return;
        }
        const deptId = parseInt(departmentId, 10);
        if (isNaN(deptId)) {
            setFilteredEmployees([]);
            return;
        }

        try {
            setLoadingEmployees(true);
            const response = await pharmacistEmployeeAPI.getEmployeesByDepartment(deptId);

            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200)) {
                const data = response.data;
                if (data && data.content && Array.isArray(data.content)) {
                    setFilteredEmployees(data.content);
                } else if (Array.isArray(data)) {
                    setFilteredEmployees(data);
                } else {
                    setFilteredEmployees([]);
                }
            } else {
                setFilteredEmployees([]);
            }
        } catch (err) {
            console.error('Error loading employees by department:', err);
            setFilteredEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    };

    // -- CÁC HÀM XỬ LÝ HÀNH ĐỘNG --

    const handleSearch = () => applyFilters(allCabinets);
    const handleRefresh = () => { setSearchTerm(''); loadCabinets(0); };

    const handleOpenCreateModal = () => {
        setCreateFormData({
            cabinetLocation: '', cabinetType: 'MEDICATION', departmentId: '', responsibleEmployeeId: '',
            description: '', isActive: true, isLocked: false, accessLevel: 'PUBLIC',
            maxCapacity: '', securityCode: '', notes: ''
        });
        setFilteredEmployees([]);
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => { setShowCreateModal(false); setFilteredEmployees([]); };

    const handleCreateInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'departmentId') {
            setCreateFormData(prev => ({ ...prev, departmentId: value, responsibleEmployeeId: '' }));
            if (value && value.trim() !== '') loadEmployeesByDepartment(value);
            else setFilteredEmployees([]);
        } else {
            setCreateFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const validateCreateForm = () => {
        if (!createFormData.cabinetLocation.trim()) { alert('❌ Vui lòng nhập vị trí tủ'); return false; }
        if (!createFormData.departmentId) { alert('❌ Vui lòng chọn khoa phòng'); return false; }
        if (!createFormData.responsibleEmployeeId) { alert('❌ Vui lòng chọn người chịu trách nhiệm'); return false; }
        if (!createFormData.maxCapacity || createFormData.maxCapacity <= 0) { alert('❌ Sức chứa tối đa phải lớn hơn 0'); return false; }
        return true;
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!validateCreateForm()) return;

        try {
            setSubmitting(true);
            const submitData = {
                ...createFormData,
                departmentId: parseInt(createFormData.departmentId),
                responsibleEmployeeId: parseInt(createFormData.responsibleEmployeeId),
                maxCapacity: parseInt(createFormData.maxCapacity),
            };

            const response = await pharmacistCabinetAPI.createCabinet(submitData);
            if (response && (response.status === 'CREATED' || response.code === 201 || response.status === 'success' || response.code === 200)) {
                alert('✅ Đã tạo tủ thành công!');
                handleCloseCreateModal();
                loadCabinets(0);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra khi tạo tủ');
            }
        } catch (err) {
            alert('❌ Lỗi khi tạo tủ: ' + getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEditModal = (cabinet) => alert('⚠️ Chức năng sửa thông tin tủ đang được phát triển');

    const getCurrentLockStatus = (cabinet) => {
        if (lockStatusCache.hasOwnProperty(cabinet.cabinetId)) {
            return lockStatusCache[cabinet.cabinetId];
        }
        return cabinet.isLocked;
    };

    const handleLockUnlock = async (cabinet) => {
        const currentLockStatus = getCurrentLockStatus(cabinet);
        const action = currentLockStatus ? 'mở khóa' : 'khóa';
        const newLockedState = !currentLockStatus;

        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tủ "${cabinet.cabinetLocation}"?`)) return;

        try {
            const response = await pharmacistCabinetAPI.lockUnlockCabinet(cabinet.cabinetId, newLockedState);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert(`✅ Đã ${action} tủ thành công!`);
                setLockStatusCache(prev => ({ ...prev, [cabinet.cabinetId]: newLockedState }));
                
                // Cập nhật UI ngay lập tức
                setCabinets(prev => prev.map(cab => cab.cabinetId === cabinet.cabinetId ? { ...cab, isLocked: newLockedState } : cab));
                setAllCabinets(prev => prev.map(cab => cab.cabinetId === cabinet.cabinetId ? { ...cab, isLocked: newLockedState } : cab));
                
                loadCabinets(pagination.currentPage);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            alert('❌ Lỗi khi ' + action + ' tủ: ' + getErrorMessage(err));
        }
    };

    const handleDeactivate = async (cabinet) => {
        const reason = window.prompt('Vui lòng nhập lý do ngừng hoạt động tủ:');
        if (!reason || !reason.trim()) return;

        try {
            const response = await pharmacistCabinetAPI.deactivateCabinet(cabinet.cabinetId, reason);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Đã ngừng hoạt động tủ thành công!');
                loadCabinets(pagination.currentPage);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            alert('❌ ' + getErrorMessage(err));
        }
    };

    const handleViewDetail = (cabinet) => { setSelectedCabinet(cabinet); setShowDetailModal(true); };

    const handleViewAlerts = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            const response = await pharmacistCabinetAPI.getCabinetAlerts(cabinet.cabinetId);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const transformedData = Array.isArray(response.data) ? response.data.map(item => ({
                    alertId: item.alert_id || item.alertId,
                    alertType: item.alert_type || item.alertType,
                    severity: item.severity,
                    message: item.message,
                    createdAt: item.created_at || item.createdAt,
                    itemName: item.item_name || item.itemName || 'N/A',
                    currentQuantity: item.current_quantity || item.currentQuantity || 'N/A',
                    reorderLevel: item.reorder_level || item.reorderLevel || 'N/A'
                })) : [];
                setAlerts(transformedData);
                setShowAlertsModal(true);
            } else throw new Error(response.message);
        } catch (err) { alert('❌ ' + getErrorMessage(err)); }
    };

    const handleViewAccessLog = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            const response = await pharmacistCabinetAPI.getCabinetAccessLog(cabinet.cabinetId, accessLogDateRange.startDate || null, accessLogDateRange.endDate || null);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const transformedData = Array.isArray(response.data) ? response.data.map(item => ({
                    accessId: item.access_id || item.accessId,
                    accessType: item.access_type || item.accessType,
                    employeeName: item.employee_name || item.employeeName,
                    action: getAccessTypeLabel(item.access_type || item.accessType),
                    timestamp: item.access_time || item.accessTime,
                    durationMinutes: item.duration_minutes || item.durationMinutes
                })) : [];
                setAccessLog(transformedData);
                setShowAccessLogModal(true);
            } else throw new Error(response.message);
        } catch (err) { alert('❌ ' + getErrorMessage(err)); }
    };

    const handleViewMaintenance = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            const response = await pharmacistCabinetAPI.getCabinetMaintenance(cabinet.cabinetId);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const transformedData = Array.isArray(response.data) ? response.data.map(item => ({
                    maintenanceId: item.maintenance_id || item.maintenanceId,
                    maintenanceType: item.maintenance_type || item.maintenanceType,
                    scheduledDate: item.scheduled_date || item.scheduledDate,
                    estimatedDuration: item.estimated_duration || item.estimatedDuration,
                    status: item.status,
                    notes: item.notes || item.estimated_duration || '',
                    completed: item.status === 'COMPLETED' || item.completed
                })) : [];
                setMaintenanceSchedule(transformedData);
                setShowMaintenanceModal(true);
            } else throw new Error(response.message);
        } catch (err) { alert('❌ ' + getErrorMessage(err)); }
    };

    // Xem tồn kho tủ (Logic mới từ Admin Layout)
    const handleViewInventory = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            setLoadingInventory(true);
            setInventoryData(null);
            setShowInventoryModal(true);

            const response = await pharmacistCabinetAPI.getCabinetInventory(cabinet.cabinetId);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                setInventoryData(response.data);
            } else {
                throw new Error('Không thể tải tồn kho tủ');
            }
        } catch (err) {
            console.error('Error loading cabinet inventory:', err);
            alert('❌ ' + getErrorMessage(err));
            setShowInventoryModal(false);
        } finally {
            setLoadingInventory(false);
        }
    };

    const handleRefreshInventory = async () => {
        if (!selectedCabinet) return;
        try {
            setLoadingInventory(true);
            const response = await pharmacistCabinetAPI.getCabinetInventory(selectedCabinet.cabinetId);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                setInventoryData(response.data);
            } else throw new Error('Không thể tải tồn kho tủ');
        } catch (err) { alert('❌ ' + getErrorMessage(err)); } finally { setLoadingInventory(false); }
    };

    const handleOpenScheduleMaintenance = (cabinet) => {
        setSelectedCabinet(cabinet);
        setMaintenanceFormData({ maintenanceType: 'CLEANING', scheduledDate: '', notes: '' });
        setShowScheduleMaintenanceModal(true);
    };

    const handleScheduleMaintenance = async (e) => {
        e.preventDefault();
        if (!maintenanceFormData.scheduledDate) { alert('❌ Vui lòng chọn ngày bảo trì'); return; }
        try {
            setSubmitting(true);
            const response = await pharmacistCabinetAPI.scheduleCabinetMaintenance(selectedCabinet.cabinetId, maintenanceFormData.maintenanceType, maintenanceFormData.scheduledDate, maintenanceFormData.notes);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Đã lên lịch bảo trì thành công!');
                setShowScheduleMaintenanceModal(false);
                setMaintenanceFormData({ maintenanceType: 'CLEANING', scheduledDate: '', notes: '' });
            } else throw new Error(response.message || 'Có lỗi xảy ra');
        } catch (err) { alert('❌ Lỗi khi lên lịch bảo trì: ' + getErrorMessage(err)); } finally { setSubmitting(false); }
    };

    const handleOpenAssignEmployee = (cabinet) => {
        setSelectedCabinet(cabinet);
        setAssignEmployeeId(cabinet.responsibleEmployeeId || '');
        setShowAssignEmployeeModal(true);
    };

    const handleAssignEmployee = async (e) => {
        e.preventDefault();
        if (!assignEmployeeId) { alert('❌ Vui lòng chọn nhân viên'); return; }
        try {
            setSubmitting(true);
            const response = await pharmacistCabinetAPI.assignResponsibleEmployee(selectedCabinet.cabinetId, assignEmployeeId);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Đã gán người chịu trách nhiệm thành công!');
                setShowAssignEmployeeModal(false);
                loadCabinets(pagination.currentPage);
            } else throw new Error(response.message || 'Có lỗi xảy ra');
        } catch (err) { alert('❌ ' + getErrorMessage(err)); } finally { setSubmitting(false); }
    };

    // Helpers & Formatters
    const formatDateTime = (dateString) => dateString ? new Date(dateString).toLocaleString('vi-VN') : 'N/A';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';
    
    const getCabinetTypeLabel = (type) => {
        const labels = { 'MEDICATION': 'Tủ thuốc', 'MATERIAL': 'Tủ vật tư', 'EQUIPMENT': 'Tủ thiết bị' };
        return labels[type] || type;
    };
    const getAccessLevelLabel = (level) => {
        const labels = { 'PUBLIC': 'Công khai', 'RESTRICTED': 'Hạn chế', 'PRIVATE': 'Riêng tư' };
        return labels[level] || level;
    };
    const getMaintenanceTypeLabel = (type) => {
        const labels = { 'CLEANING': 'Vệ sinh', 'REPAIR': 'Sửa chữa', 'INSPECTION': 'Kiểm tra', 'CALIBRATION': 'Hiệu chuẩn' };
        return labels[type] || type;
    };
    const getMaintenanceStatusInfo = (status) => {
        const statusMap = {
            'SCHEDULED': { label: '📅 Đã lên lịch', class: 'badge-scheduled' },
            'COMPLETED': { label: '✅ Hoàn thành', class: 'badge-completed' },
            'PENDING': { label: '⏳ Chờ thực hiện', class: 'badge-pending' }
        };
        return statusMap[status] || { label: status, class: 'badge-default' };
    };
    const getAccessTypeLabel = (type) => {
        const labels = { 'RESTOCK': '📦 Nhập hàng', 'DISPENSE': '💊 Xuất thuốc', 'INSPECTION': '🔍 Kiểm tra', 'MAINTENANCE': '🔧 Bảo trì' };
        return labels[type] || type;
    };
    const getAlertTypeLabel = (type) => {
        const labels = { 'LOW_STOCK': '📉 Tồn kho thấp', 'EXPIRED_ITEMS': '⏰ Hết hạn', 'TEMPERATURE_ALERT': '🌡️ Cảnh báo nhiệt độ' };
        return labels[type] || type;
    };
    const getUtilizationColor = (percent) => percent < 50 ? '#28a745' : percent < 80 ? '#ffc107' : '#dc3545';
    const getSeverityClass = (severity) => ({ 'LOW': 'severity-low', 'MEDIUM': 'severity-medium', 'HIGH': 'severity-high' }[severity] || 'severity-low');
    
    const getInventoryStatusLabel = (status) => ({ 'AVAILABLE': 'Có sẵn', 'LOW_STOCK': 'Sắp hết', 'OUT_OF_STOCK': 'Hết hàng', 'EXPIRED': 'Hết hạn' }[status] || status || 'N/A');
    const getInventoryStatusBadgeClass = (status) => ({ 'AVAILABLE': 'badge-active', 'LOW_STOCK': 'badge-warning', 'OUT_OF_STOCK': 'badge-inactive', 'EXPIRED': 'badge-inactive' }[status] || 'badge-secondary');

    const isExpiredDate = (dateString) => {
        if (!dateString) return false;
        try { return new Date(dateString) < new Date().setHours(0, 0, 0, 0); } catch { return false; }
    };
    const isExpiringWithin30Days = (dateString) => {
        if (!dateString) return false;
        try {
            const expiry = new Date(dateString);
            const today = new Date(); today.setHours(0,0,0,0);
            const next30 = new Date(today); next30.setDate(today.getDate() + 30);
            return expiry >= today && expiry <= next30;
        } catch { return false; }
    };

    const handlePageChange = (newPage) => { if (newPage >= 0 && newPage < pagination.totalPages) loadCabinets(newPage); };
    const getErrorMessage = (err) => err.response?.status === 403 ? 'Bạn không có quyền thực hiện thao tác này.' : err.message || 'Lỗi hệ thống.';

    return (
        <div className="cabinet-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>💊 Quản lý Tủ thuốc/Vật tư</h2>
                    <p>Quản lý tủ thuốc, vật tư y tế và thiết bị (Giao diện Dược sĩ)</p>
                </div>
                <div className="header-right">
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/staff/duoc-si/tu-thuoc/locked')} // Route Dược sĩ
                        style={{ marginRight: '0.5rem' }}
                    >
                        <FiLock />
                        Tủ đang khóa ({stats.locked})
                    </button>
                    <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                    <button className="btn-primary" onClick={handleOpenCreateModal}>
                        <FiPlus />
                        Thêm tủ mới
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
                <div className="stat-card active">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-label">Đang hoạt động</div>
                        <div className="stat-value">{stats.active}</div>
                    </div>
                </div>
                <div className="stat-card inactive">
                    <div className="stat-icon">⏸️</div>
                    <div className="stat-info">
                        <div className="stat-label">Ngừng hoạt động</div>
                        <div className="stat-value">{stats.inactive}</div>
                    </div>
                </div>
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <div className="stat-label">Tổng số tủ</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                </div>
                <div className="stat-card locked" onClick={() => navigate('/staff/duoc-si/tu-thuoc/locked')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon">🔒</div>
                    <div className="stat-info">
                        <div className="stat-label">Đang khóa</div>
                        <div className="stat-value">{stats.locked}</div>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="view-tabs">
                <button className={`tab ${viewMode === 'active' ? 'active' : ''}`} onClick={() => setViewMode('active')}>Đang hoạt động ({stats.active})</button>
                <button className={`tab ${viewMode === 'inactive' ? 'active' : ''}`} onClick={() => setViewMode('inactive')}>Ngừng hoạt động ({stats.inactive})</button>
                <button className={`tab ${viewMode === 'all' ? 'active' : ''}`} onClick={() => setViewMode('all')}>Tất cả ({stats.total})</button>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-input-group">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Tìm kiếm tủ theo vị trí, khoa phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                </div>
                <button className="btn-search" onClick={handleSearch} disabled={loading}><FiSearch /> Tìm kiếm</button>
            </div>

            {/* Loading State & Table */}
            {loading ? <div className="loading-state"><p>⏳ Đang tải danh sách tủ...</p></div> : error ? <div className="error-message"><p>❌ {error}</p></div> : cabinets.length > 0 ? (
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
                            {Array.isArray(cabinets) && cabinets.map((cabinet, index) => (
                                <tr key={cabinet.cabinetId}>
                                    <td>{pagination.currentPage * pagination.pageSize + index + 1}</td>
                                    <td><strong>{cabinet.cabinetLocation}</strong></td>
                                    <td><span className={`badge badge-type-${cabinet.cabinetType?.toLowerCase() || 'unknown'}`}>{getCabinetTypeLabel(cabinet.cabinetType)}</span></td>
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
                                    <td><span className={`badge ${cabinet.isActive ? 'badge-active' : 'badge-inactive'}`}>{cabinet.isActive ? '✅ Hoạt động' : '⏸️ Ngừng'}</span></td>
                                    <td>
                                        <span className="lock-icon" style={{ color: getCurrentLockStatus(cabinet) ? '#dc3545' : '#28a745', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                            {getCurrentLockStatus(cabinet) ? <><FiLock /> Khóa</> : <><FiUnlock /> Mở</>}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-view" onClick={() => handleViewDetail(cabinet)} title="Xem chi tiết"><FiEye /></button>
                                            {cabinet.isActive && (
                                                <>
                                                    <button className="btn-icon btn-edit" onClick={() => handleOpenEditModal(cabinet)} title="Sửa"><FiEdit2 /></button>
                                                    <button className="btn-icon btn-lock" onClick={() => handleLockUnlock(cabinet)} title={getCurrentLockStatus(cabinet) ? 'Mở khóa' : 'Khóa'} style={{ background: getCurrentLockStatus(cabinet) ? '#28a745' : '#ffc107' }}>{getCurrentLockStatus(cabinet) ? <FiUnlock /> : <FiLock />}</button>
                                                    <button className="btn-icon btn-alert" onClick={() => handleViewAlerts(cabinet)} title="Cảnh báo"><FiAlertTriangle /></button>
                                                    <button className="btn-icon btn-log" onClick={() => handleViewAccessLog(cabinet)} title="Lịch sử truy cập"><FiClock /></button>
                                                    <button className="btn-icon btn-maintenance" onClick={() => handleViewMaintenance(cabinet)} title="Bảo trì"><FiTool /></button>
                                                    <button className="btn-icon btn-inventory" onClick={() => handleViewInventory(cabinet)} title="Xem tồn kho" style={{ background: '#17a2b8' }}><FiPackage /></button>
                                                    <button className="btn-icon btn-deactivate" onClick={() => handleDeactivate(cabinet)} title="Ngừng hoạt động"><FiTrash2 /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <div className="empty-state"><p>📦 Không có tủ nào</p></div>}

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

            {/* --- MODALS --- */}

            {/* Create Cabinet Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleCloseCreateModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>➕ Thêm tủ mới</h3><button className="btn-close" onClick={handleCloseCreateModal}>✕</button></div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Vị trí tủ <span className="required">*</span></label>
                                        <input type="text" name="cabinetLocation" value={createFormData.cabinetLocation} onChange={handleCreateInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Loại tủ <span className="required">*</span></label>
                                        <select name="cabinetType" value={createFormData.cabinetType} onChange={handleCreateInputChange} required>
                                            <option value="MEDICATION">Tủ thuốc</option><option value="MATERIAL">Tủ vật tư</option><option value="EQUIPMENT">Tủ thiết bị</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Khoa phòng <span className="required">*</span></label>
                                        <select name="departmentId" value={createFormData.departmentId} onChange={handleCreateInputChange} required>
                                            <option value="">-- Chọn khoa phòng --</option>
                                            {departments.map(d => <option key={d.departmentId || d.id} value={d.departmentId || d.id}>{d.departmentName || d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Người chịu trách nhiệm <span className="required">*</span></label>
                                        <select name="responsibleEmployeeId" value={createFormData.responsibleEmployeeId} onChange={handleCreateInputChange} required disabled={!createFormData.departmentId || loadingEmployees}>
                                            <option value="">{loadingEmployees ? '-- Đang tải... --' : '-- Chọn nhân viên --'}</option>
                                            {filteredEmployees.map(e => <option key={e.id || e.employeeId} value={e.id || e.employeeId}>{e.fullName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Mức độ truy cập</label>
                                        <select name="accessLevel" value={createFormData.accessLevel} onChange={handleCreateInputChange} required>
                                            <option value="PUBLIC">Công khai</option><option value="RESTRICTED">Hạn chế</option><option value="PRIVATE">Riêng tư</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Sức chứa tối đa</label>
                                        <input type="number" name="maxCapacity" value={createFormData.maxCapacity} onChange={handleCreateInputChange} required min="1" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Mã bảo mật</label><input type="text" name="securityCode" value={createFormData.securityCode} onChange={handleCreateInputChange} /></div>
                                    <div className="form-group checkbox-group">
                                        <label><input type="checkbox" name="isActive" checked={createFormData.isActive} onChange={handleCreateInputChange} /> Đang hoạt động</label>
                                        <label><input type="checkbox" name="isLocked" checked={createFormData.isLocked} onChange={handleCreateInputChange} /> Khóa tủ</label>
                                    </div>
                                </div>
                                <div className="form-group"><label>Mô tả</label><textarea name="description" value={createFormData.description} onChange={handleCreateInputChange} /></div>
                                <div className="form-group"><label>Ghi chú</label><textarea name="notes" value={createFormData.notes} onChange={handleCreateInputChange} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseCreateModal}>Hủy</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang tạo...' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>👁️ Chi tiết tủ</h3><button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="detail-row"><span className="detail-label">Vị trí:</span><span className="detail-value"><strong>{selectedCabinet.cabinetLocation}</strong></span></div>
                            <div className="detail-row"><span className="detail-label">Loại:</span><span className="detail-value">{getCabinetTypeLabel(selectedCabinet.cabinetType)}</span></div>
                            <div className="detail-row"><span className="detail-label">Khoa:</span><span className="detail-value">{selectedCabinet.departmentName}</span></div>
                            <div className="detail-row"><span className="detail-label">Phụ trách:</span><span className="detail-value">{selectedCabinet.responsibleEmployeeName}</span></div>
                            <div className="detail-row"><span className="detail-label">Tỷ lệ sử dụng:</span><span className="detail-value">{selectedCabinet.occupancyRate}%</span></div>
                            <div className="detail-row"><span className="detail-label">Trạng thái:</span><span className={`detail-value status ${selectedCabinet.isActive ? 'active' : 'inactive'}`}>{selectedCabinet.isActive ? 'Active' : 'Inactive'}</span></div>
                            <div className="detail-row"><span className="detail-label">Khóa:</span><span className="detail-value">{selectedCabinet.isLocked ? 'Locked' : 'Unlocked'}</span></div>
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* Inventory Modal (Mới) */}
            {showInventoryModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                        <div className="modal-header"><h3>📦 Tồn kho - {selectedCabinet.cabinetLocation}</h3><button className="btn-close" onClick={() => setShowInventoryModal(false)}>✕</button></div>
                        <div className="modal-body">
                            {loadingInventory ? <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}><p>⏳ Đang tải tồn kho...</p></div> : inventoryData && Array.isArray(inventoryData) ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase' }}>📍 Vị trí</div><div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedCabinet.cabinetLocation}</div></div>
                                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase' }}>📦 Tổng mặt hàng</div><div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#007bff' }}>{inventoryData.length}</div></div>
                                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase' }}>💊 Thuốc</div><div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#28a745' }}>{inventoryData.filter(i => i.item_type === 'MEDICINE').length}</div></div>
                                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase' }}>🩹 Vật tư</div><div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#fd7e14' }}>{inventoryData.filter(i => i.item_type === 'SUPPLY').length}</div></div>
                                    </div>
                                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="btn-refresh" onClick={handleRefreshInventory} disabled={loadingInventory}><FiRefreshCw className={loadingInventory ? 'spinning' : ''} /> Làm mới</button>
                                    </div>
                                    {inventoryData.length > 0 ? (
                                        <div className="cabinet-table-container">
                                            <table className="cabinet-table">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th><th>Stock ID</th><th>Tên thuốc/Vật tư</th><th>Loại</th><th>Số lô</th>
                                                        <th>Số lượng</th><th>Hạn sử dụng</th><th>Trạng thái</th><th>Cập nhật</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inventoryData.map((item, index) => {
                                                        const isExp = isExpiredDate(item.expiry_date);
                                                        const isNearExp = isExpiringWithin30Days(item.expiry_date);
                                                        const isLow = item.quantity <= 10;
                                                        return (
                                                            <tr key={item.stock_id || index} style={{ background: isExp ? '#fff5f5' : isNearExp ? '#fffbf0' : 'transparent' }}>
                                                                <td>{index + 1}</td>
                                                                <td><code style={{ background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>{item.stock_id}</code></td>
                                                                <td><strong>{item.item_name}</strong></td>
                                                                <td><span className={`badge badge-type-${(item.item_type || 'MEDICINE').toLowerCase()}`}>{item.item_type === 'MEDICINE' ? '💊 Thuốc' : '🩹 Vật tư'}</span></td>
                                                                <td><code style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px' }}>{item.batch_number || 'N/A'}</code></td>
                                                                <td><span style={{ color: isLow ? '#dc3545' : '#28a745', fontWeight: 'bold', fontSize: '1rem' }}>{item.quantity}{isLow && ' ⚠️'}</span></td>
                                                                <td style={{ color: isExp ? '#dc3545' : isNearExp ? '#ffc107' : 'inherit', fontWeight: (isExp || isNearExp) ? 'bold' : 'normal' }}>
                                                                    {formatDate(item.expiry_date)}{isExp && ' ❌'}{!isExp && isNearExp && ' ⚠️'}
                                                                </td>
                                                                <td><span className={`badge ${item.status === 'AVAILABLE' ? 'badge-success' : 'badge-secondary'}`}>{item.status === 'AVAILABLE' ? '✅ Sẵn sàng' : item.status}</span></td>
                                                                <td style={{ fontSize: '0.8rem', color: '#6c757d' }}>{item.last_updated ? new Date(item.last_updated).toLocaleDateString('vi-VN') : '-'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : <div className="empty-state"><p>Tủ này chưa có tồn kho</p></div>}
                                </>
                            ) : <div className="error-message"><p>❌ Không thể tải dữ liệu tồn kho</p></div>}
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowInventoryModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* Alerts Modal */}
            {showAlertsModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowAlertsModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>⚠️ Cảnh báo - {selectedCabinet.cabinetLocation}</h3><button className="btn-close" onClick={() => setShowAlertsModal(false)}>✕</button></div>
                        <div className="modal-body">
                            {alerts.length > 0 ? <div className="alerts-list">{alerts.map((alert, index) => (
                                <div key={index} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                                    <div className="alert-header"><span className="alert-type">{getAlertTypeLabel(alert.alertType)}</span><span className={`severity-badge ${getSeverityClass(alert.severity)}`}>{alert.severity}</span></div>
                                    <div className="alert-body"><p>{alert.message}</p><p>{formatDateTime(alert.createdAt)}</p></div>
                                </div>
                            ))}</div> : <div className="empty-state"><p>✅ Không có cảnh báo nào</p></div>}
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowAlertsModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* Access Log Modal */}
            {showAccessLogModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowAccessLogModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>🕐 Lịch sử truy cập</h3><button className="btn-close" onClick={() => setShowAccessLogModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="date-filter">
                                <div className="form-group"><label>Từ ngày:</label><input type="date" value={accessLogDateRange.startDate} onChange={(e) => setAccessLogDateRange(prev => ({ ...prev, startDate: e.target.value }))} /></div>
                                <div className="form-group"><label>Đến ngày:</label><input type="date" value={accessLogDateRange.endDate} onChange={(e) => setAccessLogDateRange(prev => ({ ...prev, endDate: e.target.value }))} /></div>
                                <button className="btn-primary" onClick={() => handleViewAccessLog(selectedCabinet)}>Lọc</button>
                            </div>
                            {accessLog.length > 0 ? (
                                <div className="access-log-table-container"><table className="access-log-table"><thead><tr><th>STT</th><th>Nhân viên</th><th>Hành động</th><th>Thời gian</th></tr></thead><tbody>{accessLog.map((log, index) => (<tr key={index}><td>{index + 1}</td><td>{log.employeeName}</td><td>{log.action}</td><td>{formatDateTime(log.timestamp)}</td></tr>))}</tbody></table></div>
                            ) : <div className="empty-state"><p>Không có dữ liệu</p></div>}
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowAccessLogModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>🔧 Lịch trình bảo trì</h3><button className="btn-close" onClick={() => setShowMaintenanceModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="maintenance-actions"><button className="btn-primary" onClick={() => { setShowMaintenanceModal(false); handleOpenScheduleMaintenance(selectedCabinet); }}><FiPlus /> Lên lịch bảo trì mới</button></div>
                            {maintenanceSchedule.length > 0 ? (
                                <div className="maintenance-table-container"><table className="maintenance-table"><thead><tr><th>STT</th><th>Loại</th><th>Ngày dự kiến</th><th>Trạng thái</th></tr></thead><tbody>{maintenanceSchedule.map((m, index) => (<tr key={index}><td>{index + 1}</td><td>{getMaintenanceTypeLabel(m.maintenanceType)}</td><td>{formatDate(m.scheduledDate)}</td><td><span className={`badge ${getMaintenanceStatusInfo(m.status).class}`}>{getMaintenanceStatusInfo(m.status).label}</span></td></tr>))}</tbody></table></div>
                            ) : <div className="empty-state"><p>Chưa có lịch trình</p></div>}
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowMaintenanceModal(false)}>Đóng</button></div>
                    </div>
                </div>
            )}

            {/* Schedule Maintenance Modal */}
            {showScheduleMaintenanceModal && (
                <div className="modal-overlay" onClick={() => setShowScheduleMaintenanceModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>📅 Lên lịch bảo trì</h3><button className="btn-close" onClick={() => setShowScheduleMaintenanceModal(false)}>✕</button></div>
                        <form onSubmit={handleScheduleMaintenance}>
                            <div className="modal-body">
                                <div className="form-group"><label>Loại bảo trì</label><select value={maintenanceFormData.maintenanceType} onChange={(e) => setMaintenanceFormData(prev => ({ ...prev, maintenanceType: e.target.value }))}><option value="CLEANING">Vệ sinh</option><option value="REPAIR">Sửa chữa</option><option value="INSPECTION">Kiểm tra</option></select></div>
                                <div className="form-group"><label>Ngày dự kiến</label><input type="date" value={maintenanceFormData.scheduledDate} onChange={(e) => setMaintenanceFormData(prev => ({ ...prev, scheduledDate: e.target.value }))} required /></div>
                                <div className="form-group"><label>Ghi chú</label><textarea value={maintenanceFormData.notes} onChange={(e) => setMaintenanceFormData(prev => ({ ...prev, notes: e.target.value }))} rows="3" /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setShowScheduleMaintenanceModal(false)}>Hủy</button><button type="submit" className="btn-primary" disabled={submitting}>Lên lịch</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Employee Modal */}
            {showAssignEmployeeModal && (
                <div className="modal-overlay" onClick={() => setShowAssignEmployeeModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>👤 Gán người chịu trách nhiệm</h3><button className="btn-close" onClick={() => setShowAssignEmployeeModal(false)}>✕</button></div>
                        <form onSubmit={handleAssignEmployee}>
                            <div className="modal-body">
                                <div className="form-group"><label>Chọn nhân viên</label><select value={assignEmployeeId} onChange={(e) => setAssignEmployeeId(e.target.value)} required><option value="">-- Chọn nhân viên --</option>{employees.map(e => <option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>)}</select></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setShowAssignEmployeeModal(false)}>Hủy</button><button type="submit" className="btn-primary" disabled={submitting}>Gán</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetManagementPage;