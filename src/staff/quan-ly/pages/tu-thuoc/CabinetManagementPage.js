import React, { useState, useEffect } from 'react';
import './CabinetManagementPage.css';
import { FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiLock, FiUnlock, FiAlertTriangle, FiClock, FiTool, FiPackage } from 'react-icons/fi';
import { adminCabinetAPI, adminDepartmentAPI, adminEmployeeAPI } from '../../../../services/staff/adminAPI';
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
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    // State cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('active'); // 'active', 'inactive', 'all'
    const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0, locked: 0 });
    const [submitting, setSubmitting] = useState(false);

    // State cho lock status checking
    const [lockStatusCache, setLockStatusCache] = useState({}); // Cache lock status by cabinetId
    const [checkingLockStatus, setCheckingLockStatus] = useState(false);

    // State cho departments và employees
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
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

    // State cho inventory
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

            // Luôn gọi API getAllCabinets (không có search endpoint)
            const response = await adminCabinetAPI.getAllCabinets(page, pagination.pageSize);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const data = response.data;

                if (data.content) {
                    // Paginated response
                    setAllCabinets(data.content);
                    calculateStats(data.content);

                    // Filter theo viewMode và searchTerm
                    applyFilters(data.content);

                    setPagination({
                        currentPage: data.page || 0,
                        totalPages: data.totalPages || 0,
                        totalElements: data.totalElements || 0,
                        pageSize: data.size || 20
                    });
                } else if (Array.isArray(data)) {
                    // Non-paginated response (current API behavior)
                    setAllCabinets(data);
                    calculateStats(data);

                    // Filter theo viewMode và searchTerm
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

    // Áp dụng filters (viewMode và searchTerm)
    const applyFilters = (cabinetList) => {
        let filtered = [...cabinetList];

        // Filter theo viewMode
        if (viewMode === 'active') {
            filtered = filtered.filter(c => c.isActive === true);
        } else if (viewMode === 'inactive') {
            filtered = filtered.filter(c => c.isActive === false);
        }

        // Filter theo searchTerm (client-side search)
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(cabinet => {
                return (
                    // Tìm theo ID (chuyển sang string để so sánh)
                    cabinet.cabinetId?.toString().includes(term) ||
                    // Tìm theo các trường text
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
            const response = await adminDepartmentAPI.getDepartments('', 0, 30);
            if (response && (response.status === 'OK' || response.code === 200 || response.status === 'success')) {
                // Response mới có cấu trúc: data.content (paginated)
                const deptData = response.data?.content || response.data || [];
                setDepartments(deptData);
            }
        } catch (err) {
            console.error('Error loading departments:', err);
        }
    };



    // Xử lý tìm kiếm (client-side)
    const handleSearch = () => {
        applyFilters(allCabinets);
    };

    // Xử lý làm mới
    const handleRefresh = () => {
        setSearchTerm('');
        loadCabinets(0);
    };

    // Load danh sách nhân viên theo khoa phòng
    const loadEmployeesByDepartment = async (departmentId) => {
        if (!departmentId) {
            setFilteredEmployees([]);
            return;
        }

        // Convert to integer and validate
        const deptId = parseInt(departmentId, 10);
        if (isNaN(deptId)) {
            console.error('Invalid departmentId:', departmentId);
            setFilteredEmployees([]);
            return;
        }

        try {
            setLoadingEmployees(true);
            const response = await adminEmployeeAPI.getEmployeesByDepartment(deptId);

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

    // Mở modal thêm mới
    const handleOpenCreateModal = () => {
        setCreateFormData({
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
        setFilteredEmployees([]);
        setShowCreateModal(true);
    };

    // Đóng modal tạo mới
    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setFilteredEmployees([]);
    };

    // Xử lý thay đổi input trong form tạo mới
    const handleCreateInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Nếu thay đổi khoa phòng, load nhân viên của khoa đó
        if (name === 'departmentId') {
            setCreateFormData(prev => ({
                ...prev,
                departmentId: value,
                responsibleEmployeeId: '' // Reset nhân viên khi đổi khoa
            }));

            // Only load if value is not empty and is a valid number
            if (value && value.trim() !== '') {
                loadEmployeesByDepartment(value);
            } else {
                setFilteredEmployees([]);
            }
        } else {
            setCreateFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Validate form tạo mới
    const validateCreateForm = () => {
        if (!createFormData.cabinetLocation.trim()) {
            alert('❌ Vui lòng nhập vị trí tủ');
            return false;
        }
        if (!createFormData.departmentId) {
            alert('❌ Vui lòng chọn khoa phòng');
            return false;
        }
        if (!createFormData.responsibleEmployeeId) {
            alert('❌ Vui lòng chọn người chịu trách nhiệm');
            return false;
        }
        if (!createFormData.maxCapacity || createFormData.maxCapacity <= 0) {
            alert('❌ Sức chứa tối đa phải lớn hơn 0');
            return false;
        }
        if (createFormData.securityCode && (createFormData.securityCode.length < 4 || createFormData.securityCode.length > 8)) {
            alert('❌ Mã bảo mật phải từ 4-8 ký tự');
            return false;
        }
        return true;
    };

    // Xử lý submit form tạo mới
    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        if (!validateCreateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            // Chuẩn bị data theo đúng format API
            const submitData = {
                cabinetLocation: createFormData.cabinetLocation,
                cabinetType: createFormData.cabinetType,
                departmentId: parseInt(createFormData.departmentId),
                responsibleEmployeeId: parseInt(createFormData.responsibleEmployeeId),
                description: createFormData.description || null,
                isActive: createFormData.isActive,
                isLocked: createFormData.isLocked,
                accessLevel: createFormData.accessLevel,
                maxCapacity: parseInt(createFormData.maxCapacity),
                securityCode: createFormData.securityCode || null,
                notes: createFormData.notes || null
            };

            console.log('Creating cabinet with data:', submitData);

            const response = await adminCabinetAPI.createCabinet(submitData);
            console.log('Create cabinet response:', response);

            // Check response status: CREATED, status: "CREATED", code: 201
            if (response && (response.status === 'CREATED' || response.code === 201 || response.status === 'success' || response.code === 200)) {
                alert('✅ Đã tạo tủ thành công!');
                handleCloseCreateModal();
                loadCabinets(0); // Reload danh sách từ trang đầu
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra khi tạo tủ');
            }
        } catch (err) {
            console.error('Error creating cabinet:', err);
            alert('❌ Lỗi khi tạo tủ: ' + getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    // Mở modal sửa (chưa implement)
    const handleOpenEditModal = (cabinet) => {
        alert('⚠️ Chức năng sửa thông tin tủ đang được phát triển');
    };



    // Kiểm tra trạng thái khóa của tủ (Check individual cabinet lock status)
    const checkCabinetLockStatus = async (cabinetId) => {
        try {
            const response = await adminCabinetAPI.getCabinetLockStatus(cabinetId);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const lockStatus = response.data?.isLocked;

                // Update cache
                setLockStatusCache(prev => ({
                    ...prev,
                    [cabinetId]: lockStatus
                }));

                // Update the cabinet in the list
                setCabinets(prevCabinets =>
                    prevCabinets.map(cab =>
                        cab.cabinetId === cabinetId
                            ? { ...cab, isLocked: lockStatus }
                            : cab
                    )
                );

                setAllCabinets(prevCabinets =>
                    prevCabinets.map(cab =>
                        cab.cabinetId === cabinetId
                            ? { ...cab, isLocked: lockStatus }
                            : cab
                    )
                );

                return lockStatus;
            }
        } catch (err) {
            console.error('Error checking lock status:', err);
        }
        return null;
    };

    // Lấy trạng thái khóa hiện tại của tủ (Get current lock status with cache)
    const getCurrentLockStatus = (cabinet) => {
        // Check cache first
        if (lockStatusCache.hasOwnProperty(cabinet.cabinetId)) {
            return lockStatusCache[cabinet.cabinetId];
        }
        // Fall back to cabinet's isLocked property
        return cabinet.isLocked;
    };

    // Xử lý khóa/mở khóa tủ
    const handleLockUnlock = async (cabinet) => {
        const currentLockStatus = getCurrentLockStatus(cabinet);
        const action = currentLockStatus ? 'mở khóa' : 'khóa';
        const newLockedState = !currentLockStatus;

        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tủ "${cabinet.cabinetLocation}"?`)) {
            return;
        }

        try {
            console.log(`Calling lockUnlockCabinet API: cabinetId=${cabinet.cabinetId}, locked=${newLockedState}`);
            const response = await adminCabinetAPI.lockUnlockCabinet(cabinet.cabinetId, newLockedState);
            console.log('Lock/Unlock response:', response);

            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200 || response.OK)) {
                alert(`✅ Đã ${action} tủ thành công!`);

                // Immediately update the lock status in cache and UI
                setLockStatusCache(prev => ({
                    ...prev,
                    [cabinet.cabinetId]: newLockedState
                }));

                // Update the cabinet in the list immediately
                setCabinets(prevCabinets =>
                    prevCabinets.map(cab =>
                        cab.cabinetId === cabinet.cabinetId
                            ? { ...cab, isLocked: newLockedState }
                            : cab
                    )
                );

                setAllCabinets(prevCabinets =>
                    prevCabinets.map(cab =>
                        cab.cabinetId === cabinet.cabinetId
                            ? { ...cab, isLocked: newLockedState }
                            : cab
                    )
                );

                // Reload to ensure consistency
                loadCabinets(pagination.currentPage);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error locking/unlocking cabinet:', err);
            alert('❌ Lỗi khi ' + action + ' tủ: ' + getErrorMessage(err));
        }
    };

    // Xử lý ngừng hoạt động tủ
    const handleDeactivate = async (cabinet) => {
        const reason = window.prompt('Vui lòng nhập lý do ngừng hoạt động tủ:');
        if (!reason || !reason.trim()) {
            return;
        }

        try {
            const response = await adminCabinetAPI.deactivateCabinet(cabinet.cabinetId, reason);
            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Đã ngừng hoạt động tủ thành công!');
                loadCabinets(pagination.currentPage);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error deactivating cabinet:', err);
            alert('❌ ' + getErrorMessage(err));
        }
    };

    // Xem chi tiết tủ
    const handleViewDetail = (cabinet) => {
        setSelectedCabinet(cabinet);
        setShowDetailModal(true);
    };

    // Xem cảnh báo
    const handleViewAlerts = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            const response = await adminCabinetAPI.getCabinetAlerts(cabinet.cabinetId);
            console.log('Alerts response:', response);

            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200 || response.OK)) {
                // Transform snake_case to camelCase
                const transformedData = Array.isArray(response.data)
                    ? response.data.map(item => ({
                        alertId: item.alert_id || item.alertId,
                        alertType: item.alert_type || item.alertType,
                        severity: item.severity,
                        message: item.message,
                        createdAt: item.created_at || item.createdAt,
                        // Parse message to extract details if needed
                        itemName: item.item_name || item.itemName || 'N/A',
                        currentQuantity: item.current_quantity || item.currentQuantity || 'N/A',
                        reorderLevel: item.reorder_level || item.reorderLevel || 'N/A'
                    }))
                    : [];

                setAlerts(transformedData);
                setShowAlertsModal(true);
            } else {
                throw new Error(response.message || 'Không thể tải cảnh báo');
            }
        } catch (err) {
            console.error('Error loading alerts:', err);
            alert('❌ ' + getErrorMessage(err));
        }
    };

    // Xem lịch sử truy cập
    const handleViewAccessLog = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            const response = await adminCabinetAPI.getCabinetAccessLog(
                cabinet.cabinetId,
                accessLogDateRange.startDate || null,
                accessLogDateRange.endDate || null
            );
            console.log('Access log response:', response);

            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200 || response.OK)) {
                // Transform snake_case to camelCase
                const transformedData = Array.isArray(response.data)
                    ? response.data.map(item => ({
                        accessId: item.access_id || item.accessId,
                        accessType: item.access_type || item.accessType,
                        employeeId: item.employee_id || item.employeeId,
                        employeeName: item.employee_name || item.employeeName,
                        accessTime: item.access_time || item.accessTime,
                        durationMinutes: item.duration_minutes || item.durationMinutes,
                        // Map accessType to action for display
                        action: getAccessTypeLabel(item.access_type || item.accessType),
                        timestamp: item.access_time || item.accessTime
                    }))
                    : [];

                setAccessLog(transformedData);
                setShowAccessLogModal(true);
            } else {
                throw new Error(response.message || 'Không thể tải lịch sử truy cập');
            }
        } catch (err) {
            console.error('Error loading access log:', err);
            alert('❌ ' + getErrorMessage(err));
        }
    };

    // Xem lịch trình bảo trì
    const handleViewMaintenance = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            const response = await adminCabinetAPI.getCabinetMaintenance(cabinet.cabinetId);
            console.log('Maintenance schedule response:', response);

            if (response && (response.status === 'success' || response.status === 'OK' || response.code === 200 || response.OK)) {
                // Transform snake_case to camelCase
                const transformedData = Array.isArray(response.data)
                    ? response.data.map(item => ({
                        maintenanceId: item.maintenance_id || item.maintenanceId,
                        maintenanceType: item.maintenance_type || item.maintenanceType,
                        scheduledDate: item.scheduled_date || item.scheduledDate,
                        estimatedDuration: item.estimated_duration || item.estimatedDuration,
                        status: item.status,
                        notes: item.notes || item.estimated_duration || '', // Use estimated_duration as notes if notes not available
                        completed: item.status === 'COMPLETED' || item.completed
                    }))
                    : [];

                setMaintenanceSchedule(transformedData);
                setShowMaintenanceModal(true);
            } else {
                throw new Error(response.message || 'Không thể tải lịch trình bảo trì');
            }
        } catch (err) {
            console.error('Error loading maintenance:', err);
            alert('❌ ' + getErrorMessage(err));
        }
    };

    // Xem tồn kho tủ
    const handleViewInventory = async (cabinet) => {
        try {
            setSelectedCabinet(cabinet);
            setLoadingInventory(true);
            setInventoryData(null);
            setShowInventoryModal(true);

            const response = await adminCabinetAPI.getCabinetInventory(cabinet.cabinetId);
            console.log('Cabinet inventory response:', response);

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

    // Refresh inventory
    const handleRefreshInventory = async () => {
        if (!selectedCabinet) return;

        try {
            setLoadingInventory(true);
            const response = await adminCabinetAPI.getCabinetInventory(selectedCabinet.cabinetId);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                setInventoryData(response.data);
            } else {
                throw new Error('Không thể tải tồn kho tủ');
            }
        } catch (err) {
            console.error('Error refreshing inventory:', err);
            alert('❌ ' + getErrorMessage(err));
        } finally {
            setLoadingInventory(false);
        }
    };

    // Mở modal lên lịch bảo trì
    const handleOpenScheduleMaintenance = (cabinet) => {
        setSelectedCabinet(cabinet);
        setMaintenanceFormData({
            maintenanceType: 'CLEANING',
            scheduledDate: '',
            notes: ''
        });
        setShowScheduleMaintenanceModal(true);
    };

    // Xử lý lên lịch bảo trì
    const handleScheduleMaintenance = async (e) => {
        e.preventDefault();

        if (!maintenanceFormData.scheduledDate) {
            alert('❌ Vui lòng chọn ngày bảo trì');
            return;
        }

        // Validate ngày phải >= ngày hiện tại
        const selectedDate = new Date(maintenanceFormData.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            alert('❌ Ngày bảo trì phải từ hôm nay trở đi');
            return;
        }

        try {
            setSubmitting(true);
            const response = await adminCabinetAPI.scheduleCabinetMaintenance(
                selectedCabinet.cabinetId,
                maintenanceFormData.maintenanceType,
                maintenanceFormData.scheduledDate,
                maintenanceFormData.notes
            );

            console.log('Schedule maintenance response:', response);

            // Check if response indicates success
            const isSuccess = response && (
                response.status === 'success' ||
                response.status === 'OK' ||
                response.code === 200 ||
                response.OK ||
                (response.message && response.message.toLowerCase().includes('success'))
            );

            if (isSuccess) {
                alert('✅ Đã lên lịch bảo trì thành công!');
                setShowScheduleMaintenanceModal(false);
                // Reset form
                setMaintenanceFormData({
                    maintenanceType: 'CLEANING',
                    scheduledDate: '',
                    notes: ''
                });
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error scheduling maintenance:', err);
            alert('❌ Lỗi khi lên lịch bảo trì: ' + getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    // Mở modal gán người chịu trách nhiệm
    const handleOpenAssignEmployee = (cabinet) => {
        setSelectedCabinet(cabinet);
        setAssignEmployeeId(cabinet.responsibleEmployeeId || '');
        setShowAssignEmployeeModal(true);
    };

    // Xử lý gán người chịu trách nhiệm
    const handleAssignEmployee = async (e) => {
        e.preventDefault();

        if (!assignEmployeeId) {
            alert('❌ Vui lòng chọn nhân viên');
            return;
        }

        try {
            setSubmitting(true);
            const response = await adminCabinetAPI.assignResponsibleEmployee(
                selectedCabinet.cabinetId,
                assignEmployeeId
            );

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Đã gán người chịu trách nhiệm thành công!');
                setShowAssignEmployeeModal(false);
                loadCabinets(pagination.currentPage);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error assigning employee:', err);
            alert('❌ ' + getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('vi-VN');
        } catch {
            return dateString;
        }
    };

    // Format date only
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    // Get cabinet type label
    const getCabinetTypeLabel = (type) => {
        if (!type) return 'Chưa xác định';
        const labels = {
            'MEDICATION': 'Tủ thuốc',
            'MATERIAL': 'Tủ vật tư',
            'EQUIPMENT': 'Tủ thiết bị'
        };
        return labels[type] || type;
    };

    // Get access level label
    const getAccessLevelLabel = (level) => {
        const labels = {
            'PUBLIC': 'Công khai',
            'RESTRICTED': 'Hạn chế',
            'PRIVATE': 'Riêng tư'
        };
        return labels[level] || level;
    };

    // Get maintenance type label
    const getMaintenanceTypeLabel = (type) => {
        const labels = {
            'CLEANING': 'Vệ sinh',
            'REPAIR': 'Sửa chữa',
            'INSPECTION': 'Kiểm tra',
            'CALIBRATION': 'Hiệu chuẩn',
            'ROUTINE_CHECK': 'Kiểm tra định kỳ',
            'DEEP_CLEANING': 'Vệ sinh sâu'
        };
        return labels[type] || type;
    };

    // Get maintenance status label and class
    const getMaintenanceStatusInfo = (status) => {
        const statusMap = {
            'SCHEDULED': { label: '📅 Đã lên lịch', class: 'badge-scheduled' },
            'PLANNED': { label: '📋 Đang lên kế hoạch', class: 'badge-planned' },
            'IN_PROGRESS': { label: '🔧 Đang thực hiện', class: 'badge-in-progress' },
            'COMPLETED': { label: '✅ Hoàn thành', class: 'badge-completed' },
            'CANCELLED': { label: '❌ Đã hủy', class: 'badge-cancelled' },
            'PENDING': { label: '⏳ Chờ thực hiện', class: 'badge-pending' }
        };
        return statusMap[status] || { label: status, class: 'badge-default' };
    };

    // Get access type label
    const getAccessTypeLabel = (type) => {
        const labels = {
            'RESTOCK': '📦 Nhập hàng',
            'DISPENSE': '💊 Xuất thuốc',
            'INSPECTION': '🔍 Kiểm tra',
            'MAINTENANCE': '🔧 Bảo trì',
            'AUDIT': '📋 Kiểm toán',
            'EMERGENCY': '🚨 Khẩn cấp'
        };
        return labels[type] || type;
    };

    // Get alert type label
    const getAlertTypeLabel = (type) => {
        const labels = {
            'LOW_STOCK': '📉 Tồn kho thấp',
            'EXPIRED_ITEMS': '⏰ Hết hạn',
            'MAINTENANCE_DUE': '🔧 Đến hạn bảo trì',
            'UNAUTHORIZED_ACCESS': '🚫 Truy cập trái phép',
            'TEMPERATURE_ALERT': '🌡️ Cảnh báo nhiệt độ',
            'HUMIDITY_ALERT': '💧 Cảnh báo độ ẩm'
        };
        return labels[type] || type;
    };

    // Get utilization color
    const getUtilizationColor = (percent) => {
        if (percent < 50) return '#28a745'; // green
        if (percent < 80) return '#ffc107'; // yellow
        return '#dc3545'; // red
    };

    // Get severity badge class
    const getSeverityClass = (severity) => {
        const classes = {
            'LOW': 'severity-low',
            'MEDIUM': 'severity-medium',
            'HIGH': 'severity-high'
        };
        return classes[severity] || 'severity-low';
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            loadCabinets(newPage);
        }
    };

    // Get error message
    const getErrorMessage = (err) => {
        if (err.response) {
            const status = err.response.status;
            if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
            if (status === 404) return 'Không tìm thấy tủ.';
            if (status === 500) return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        }
        return err.message || 'Không thể tải danh sách tủ. Vui lòng thử lại.';
    };

    // Check if date is expired
    const isExpiredDate = (dateString) => {
        if (!dateString) return false;
        try {
            const expiryDate = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return expiryDate < today;
        } catch {
            return false;
        }
    };

    // Check if date is expiring within 30 days
    const isExpiringWithin30Days = (dateString) => {
        if (!dateString) return false;
        try {
            const expiryDate = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const thirtyDaysFromNow = new Date(today);
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        } catch {
            return false;
        }
    };

    // Get inventory status label
    const getInventoryStatusLabel = (status) => {
        const labels = {
            'AVAILABLE': 'Có sẵn',
            'LOW_STOCK': 'Sắp hết',
            'OUT_OF_STOCK': 'Hết hàng',
            'EXPIRED': 'Hết hạn',
            'RESERVED': 'Đã đặt trước',
            'DAMAGED': 'Hư hỏng'
        };
        return labels[status] || status || 'N/A';
    };

    // Get inventory status badge class
    const getInventoryStatusBadgeClass = (status) => {
        const classes = {
            'AVAILABLE': 'badge-active',
            'LOW_STOCK': 'badge-warning',
            'OUT_OF_STOCK': 'badge-inactive',
            'EXPIRED': 'badge-inactive',
            'RESERVED': 'badge-info',
            'DAMAGED': 'badge-inactive'
        };
        return classes[status] || 'badge-secondary';
    };

    return (
        <div className="cabinet-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>🏥 Quản lý Tủ thuốc/Vật tư</h2>
                    <p>Quản lý tủ thuốc, vật tư y tế và thiết bị</p>
                </div>
                <div className="header-right">
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/staff/admin/tu-thuoc/locked')}
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
                <div
                    className="stat-card locked"
                    onClick={() => navigate('/staff/admin/tu-thuoc/locked')}
                    style={{ cursor: 'pointer' }}
                    title="Nhấn để xem danh sách tủ đang khóa"
                >
                    <div className="stat-icon">🔒</div>
                    <div className="stat-info">
                        <div className="stat-label">Đang khóa</div>
                        <div className="stat-value">{stats.locked}</div>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="view-tabs">
                <button
                    className={`tab ${viewMode === 'active' ? 'active' : ''}`}
                    onClick={() => setViewMode('active')}
                >
                    Đang hoạt động ({stats.active})
                </button>
                <button
                    className={`tab ${viewMode === 'inactive' ? 'active' : ''}`}
                    onClick={() => setViewMode('inactive')}
                >
                    Ngừng hoạt động ({stats.inactive})
                </button>
                <button
                    className={`tab ${viewMode === 'all' ? 'active' : ''}`}
                    onClick={() => setViewMode('all')}
                >
                    Tất cả ({stats.total})
                </button>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-input-group">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tủ theo vị trí, khoa phòng, người chịu trách nhiệm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button className="btn-search" onClick={handleSearch} disabled={loading}>
                    <FiSearch />
                    Tìm kiếm
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="loading-state">
                    <p>⏳ Đang tải danh sách tủ...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>❌ {error}</p>
                </div>
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
                            {Array.isArray(cabinets) && cabinets.map((cabinet, index) => (
                                <tr key={cabinet.cabinetId}>
                                    <td>{pagination.currentPage * pagination.pageSize + index + 1}</td>
                                    <td><strong>{cabinet.cabinetLocation}</strong></td>
                                    <td>
                                        <span className={`badge badge-type-${cabinet.cabinetType?.toLowerCase() || 'unknown'}`}>
                                            {getCabinetTypeLabel(cabinet.cabinetType)}
                                        </span>
                                    </td>
                                    <td>{cabinet.departmentName || 'N/A'}</td>
                                    <td>{cabinet.responsibleEmployeeName || 'Chưa gán'}</td>
                                    <td>
                                        <div className="utilization-container">
                                            <div className="utilization-bar">
                                                <div
                                                    className="utilization-fill"
                                                    style={{
                                                        width: `${cabinet.occupancyRate || 0}%`,
                                                        backgroundColor: getUtilizationColor(cabinet.occupancyRate || 0)
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="utilization-text">{cabinet.occupancyRate || 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${cabinet.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                            {cabinet.isActive ? '✅ Hoạt động' : '⏸️ Ngừng'}
                                        </span>
                                    </td>
                                    <td>
                                        {(() => {
                                            const isLocked = getCurrentLockStatus(cabinet);
                                            return (
                                                <span
                                                    className="lock-icon"
                                                    style={{
                                                        color: isLocked ? '#dc3545' : '#28a745',
                                                        fontWeight: 'bold',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem'
                                                    }}
                                                >
                                                    {isLocked ? (
                                                        <>
                                                            <FiLock style={{ fontSize: '1rem' }} />
                                                            Khóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiUnlock style={{ fontSize: '1rem' }} />
                                                            Mở
                                                        </>
                                                    )}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon btn-view"
                                                onClick={() => handleViewDetail(cabinet)}
                                                title="Xem chi tiết"
                                            >
                                                <FiEye />
                                            </button>
                                            {cabinet.isActive && (
                                                <>
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleOpenEditModal(cabinet)}
                                                        title="Sửa"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-lock"
                                                        onClick={() => handleLockUnlock(cabinet)}
                                                        title={getCurrentLockStatus(cabinet) ? 'Mở khóa' : 'Khóa'}
                                                        style={{
                                                            background: getCurrentLockStatus(cabinet) ? '#28a745' : '#ffc107'
                                                        }}
                                                    >
                                                        {getCurrentLockStatus(cabinet) ? <FiUnlock /> : <FiLock />}
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-alert"
                                                        onClick={() => handleViewAlerts(cabinet)}
                                                        title="Cảnh báo"
                                                    >
                                                        <FiAlertTriangle />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-log"
                                                        onClick={() => handleViewAccessLog(cabinet)}
                                                        title="Lịch sử truy cập"
                                                    >
                                                        <FiClock />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-maintenance"
                                                        onClick={() => handleViewMaintenance(cabinet)}
                                                        title="Bảo trì"
                                                    >
                                                        <FiTool />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-inventory"
                                                        onClick={() => handleViewInventory(cabinet)}
                                                        title="Xem tồn kho"
                                                        style={{ background: '#17a2b8' }}
                                                    >
                                                        <FiPackage />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-deactivate"
                                                        onClick={() => handleDeactivate(cabinet)}
                                                        title="Ngừng hoạt động"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
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
                    <p>📦 Không có tủ nào</p>
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

            {/* Create Cabinet Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleCloseCreateModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Thêm tủ mới</h3>
                            <button className="btn-close" onClick={handleCloseCreateModal}>✕</button>
                        </div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cabinetLocation">Vị trí tủ <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            id="cabinetLocation"
                                            name="cabinetLocation"
                                            value={createFormData.cabinetLocation}
                                            onChange={handleCreateInputChange}
                                            placeholder="VD: Khoa Nội - Tầng 3 - Phòng 301"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cabinetType">Loại tủ <span className="required">*</span></label>
                                        <select
                                            id="cabinetType"
                                            name="cabinetType"
                                            value={createFormData.cabinetType}
                                            onChange={handleCreateInputChange}
                                            required
                                        >
                                            <option value="MEDICATION">Tủ thuốc</option>
                                            <option value="MATERIAL">Tủ vật tư</option>
                                            <option value="EQUIPMENT">Tủ thiết bị</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="departmentId">Khoa phòng <span className="required">*</span></label>
                                        <select
                                            id="departmentId"
                                            name="departmentId"
                                            value={createFormData.departmentId}
                                            onChange={handleCreateInputChange}
                                            autoComplete="off"
                                            required
                                        >
                                            <option value="">-- Chọn khoa phòng --</option>
                                            {Array.isArray(departments) && departments.map(dept => {
                                                // Ensure we use the correct ID field
                                                const deptId = dept.departmentId || dept.id;

                                                if (!deptId) {
                                                    return null;
                                                }

                                                return (
                                                    <option key={deptId} value={deptId}>
                                                        {dept.departmentName || dept.name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="responsibleEmployeeId">Người chịu trách nhiệm <span className="required">*</span></label>
                                        <select
                                            id="responsibleEmployeeId"
                                            name="responsibleEmployeeId"
                                            value={createFormData.responsibleEmployeeId}
                                            onChange={handleCreateInputChange}
                                            required
                                            disabled={!createFormData.departmentId || loadingEmployees}
                                        >
                                            <option value="">
                                                {!createFormData.departmentId
                                                    ? '-- Chọn khoa phòng trước --'
                                                    : loadingEmployees
                                                    ? '-- Đang tải nhân viên... --'
                                                    : '-- Chọn nhân viên --'}
                                            </option>
                                            {Array.isArray(filteredEmployees) && filteredEmployees.map(emp => (
                                                <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId}>
                                                    {emp.fullName} - {emp.jobTitle}
                                                    {emp.specialization ? ` (${emp.specialization})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {createFormData.departmentId && filteredEmployees.length === 0 && !loadingEmployees && (
                                            <small style={{ color: '#dc3545', marginTop: '0.25rem', display: 'block' }}>
                                                ⚠️ Không có nhân viên nào trong khoa phòng này
                                            </small>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="accessLevel">Mức độ truy cập <span className="required">*</span></label>
                                        <select
                                            id="accessLevel"
                                            name="accessLevel"
                                            value={createFormData.accessLevel}
                                            onChange={handleCreateInputChange}
                                            required
                                        >
                                            <option value="PUBLIC">Công khai</option>
                                            <option value="RESTRICTED">Hạn chế</option>
                                            <option value="PRIVATE">Riêng tư</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="maxCapacity">Sức chứa tối đa <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            id="maxCapacity"
                                            name="maxCapacity"
                                            value={createFormData.maxCapacity}
                                            onChange={handleCreateInputChange}
                                            placeholder="VD: 500"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="securityCode">Mã bảo mật (4-8 ký tự)</label>
                                        <input
                                            type="text"
                                            id="securityCode"
                                            name="securityCode"
                                            value={createFormData.securityCode}
                                            onChange={handleCreateInputChange}
                                            placeholder="VD: 1234"
                                            minLength="4"
                                            maxLength="8"
                                        />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={createFormData.isActive}
                                                onChange={handleCreateInputChange}
                                            />
                                            <span>Đang hoạt động</span>
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="isLocked"
                                                checked={createFormData.isLocked}
                                                onChange={handleCreateInputChange}
                                            />
                                            <span>Khóa tủ</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Mô tả</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={createFormData.description}
                                        onChange={handleCreateInputChange}
                                        placeholder="VD: Tủ trực thuốc khoa Nội"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="notes">Ghi chú</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={createFormData.notes}
                                        onChange={handleCreateInputChange}
                                        placeholder="VD: Tủ mới lắp đặt tháng 11/2025"
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseCreateModal}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang tạo...' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>👁️ Chi tiết tủ</h3>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="detail-label">Mã tủ:</span>
                                <span className="detail-value">{selectedCabinet.cabinetId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Vị trí tủ:</span>
                                <span className="detail-value"><strong>{selectedCabinet.cabinetLocation}</strong></span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Loại tủ:</span>
                                <span className="detail-value">
                                    <span className={`badge badge-type-${selectedCabinet.cabinetType?.toLowerCase()}`}>
                                        {getCabinetTypeLabel(selectedCabinet.cabinetType)}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Khoa phòng:</span>
                                <span className="detail-value">{selectedCabinet.departmentName || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Người chịu trách nhiệm:</span>
                                <span className="detail-value">{selectedCabinet.responsibleEmployeeName || 'Chưa gán'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Mức độ truy cập:</span>
                                <span className="detail-value">
                                    <span className={`badge badge-access-${selectedCabinet.accessLevel?.toLowerCase()}`}>
                                        {getAccessLevelLabel(selectedCabinet.accessLevel)}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Sức chứa tối đa:</span>
                                <span className="detail-value">{selectedCabinet.maxCapacity}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Tỷ lệ sử dụng:</span>
                                <span className="detail-value">
                                    <div className="utilization-container">
                                        <div className="utilization-bar">
                                            <div
                                                className="utilization-fill"
                                                style={{
                                                    width: `${selectedCabinet.occupancyRate || 0}%`,
                                                    backgroundColor: getUtilizationColor(selectedCabinet.occupancyRate || 0)
                                                }}
                                            ></div>
                                        </div>
                                        <span className="utilization-text">{selectedCabinet.occupancyRate || 0}%</span>
                                    </div>
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Mô tả:</span>
                                <span className="detail-value">{selectedCabinet.description || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ghi chú:</span>
                                <span className="detail-value">{selectedCabinet.notes || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ngày tạo:</span>
                                <span className="detail-value">{formatDateTime(selectedCabinet.createdAt)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Trạng thái:</span>
                                <span className={`detail-value status ${selectedCabinet.isActive ? 'active' : 'inactive'}`}>
                                    {selectedCabinet.isActive ? '✅ Đang hoạt động' : '⏸️ Ngừng hoạt động'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Khóa:</span>
                                <span className="detail-value">
                                    {selectedCabinet.isLocked ? '🔒 Đã khóa' : '🔓 Mở'}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts Modal */}
            {showAlertsModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowAlertsModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚠️ Cảnh báo - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowAlertsModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {alerts.length > 0 ? (
                                <div className="alerts-list">
                                    {Array.isArray(alerts) && alerts.map((alert, index) => (
                                        <div key={alert.alertId || index} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                                            <div className="alert-header">
                                                <span className="alert-type">{getAlertTypeLabel(alert.alertType)}</span>
                                                <span className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <div className="alert-body">
                                                <p><strong>Thông báo:</strong> {alert.message}</p>
                                                <p><strong>Thời gian:</strong> {formatDateTime(alert.createdAt)}</p>
                                                {alert.itemName !== 'N/A' && (
                                                    <>
                                                        <p><strong>Vật phẩm:</strong> {alert.itemName}</p>
                                                        <p><strong>Số lượng hiện tại:</strong> {alert.currentQuantity}</p>
                                                        <p><strong>Mức đặt lại:</strong> {alert.reorderLevel}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>✅ Không có cảnh báo nào</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowAlertsModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Access Log Modal */}
            {showAccessLogModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowAccessLogModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🕐 Lịch sử truy cập - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowAccessLogModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="date-filter">
                                <div className="form-group">
                                    <label>Từ ngày:</label>
                                    <input
                                        type="date"
                                        value={accessLogDateRange.startDate}
                                        onChange={(e) => setAccessLogDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Đến ngày:</label>
                                    <input
                                        type="date"
                                        value={accessLogDateRange.endDate}
                                        onChange={(e) => setAccessLogDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleViewAccessLog(selectedCabinet)}
                                >
                                    Lọc
                                </button>
                            </div>
                            {accessLog.length > 0 ? (
                                <div className="access-log-table-container">
                                    <table className="access-log-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Nhân viên</th>
                                                <th>Hành động</th>
                                                <th>Thời gian</th>
                                                <th>Thời lượng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(accessLog) && accessLog.map((log, index) => (
                                                <tr key={log.accessId || index}>
                                                    <td>{index + 1}</td>
                                                    <td>{log.employeeName || 'N/A'}</td>
                                                    <td>{log.action || 'N/A'}</td>
                                                    <td>{formatDateTime(log.timestamp)}</td>
                                                    <td>{log.durationMinutes ? `${log.durationMinutes} phút` : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>📋 Không có lịch sử truy cập</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowAccessLogModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔧 Lịch trình bảo trì - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowMaintenanceModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="maintenance-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setShowMaintenanceModal(false);
                                        handleOpenScheduleMaintenance(selectedCabinet);
                                    }}
                                >
                                    <FiPlus /> Lên lịch bảo trì mới
                                </button>
                            </div>
                            {maintenanceSchedule.length > 0 ? (
                                <div className="maintenance-table-container">
                                    <table className="maintenance-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Loại bảo trì</th>
                                                <th>Ngày dự kiến</th>
                                                <th>Thời gian dự kiến</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(maintenanceSchedule) && maintenanceSchedule.map((maintenance, index) => {
                                                const statusInfo = getMaintenanceStatusInfo(maintenance.status);
                                                return (
                                                    <tr key={maintenance.maintenanceId || index}>
                                                        <td>{index + 1}</td>
                                                        <td>{getMaintenanceTypeLabel(maintenance.maintenanceType)}</td>
                                                        <td>{formatDate(maintenance.scheduledDate)}</td>
                                                        <td>{maintenance.estimatedDuration || maintenance.notes || 'N/A'}</td>
                                                        <td>
                                                            <span className={`badge ${statusInfo.class}`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>📅 Chưa có lịch trình bảo trì</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowMaintenanceModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Maintenance Modal */}
            {showScheduleMaintenanceModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowScheduleMaintenanceModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📅 Lên lịch bảo trì - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowScheduleMaintenanceModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleScheduleMaintenance}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="maintenanceType">Loại bảo trì <span className="required">*</span></label>
                                    <select
                                        id="maintenanceType"
                                        value={maintenanceFormData.maintenanceType}
                                        onChange={(e) => setMaintenanceFormData(prev => ({ ...prev, maintenanceType: e.target.value }))}
                                        required
                                    >
                                        <option value="CLEANING">Vệ sinh</option>
                                        <option value="REPAIR">Sửa chữa</option>
                                        <option value="INSPECTION">Kiểm tra</option>
                                        <option value="CALIBRATION">Hiệu chuẩn</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="scheduledDate">Ngày dự kiến <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        id="scheduledDate"
                                        value={maintenanceFormData.scheduledDate}
                                        onChange={(e) => setMaintenanceFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="maintenanceNotes">Ghi chú</label>
                                    <textarea
                                        id="maintenanceNotes"
                                        value={maintenanceFormData.notes}
                                        onChange={(e) => setMaintenanceFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Nhập ghi chú về bảo trì"
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowScheduleMaintenanceModal(false)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang lưu...' : 'Lên lịch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Employee Modal */}
            {showAssignEmployeeModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowAssignEmployeeModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>👤 Gán người chịu trách nhiệm - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowAssignEmployeeModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAssignEmployee}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="assignEmployeeId">Chọn nhân viên <span className="required">*</span></label>
                                    <select
                                        id="assignEmployeeId"
                                        value={assignEmployeeId}
                                        onChange={(e) => setAssignEmployeeId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {Array.isArray(employees) && employees.map(emp => (
                                            <option key={emp.employeeId} value={emp.employeeId}>
                                                {emp.fullName || emp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAssignEmployeeModal(false)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang gán...' : 'Gán'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inventory Modal */}
            {showInventoryModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                        <div className="modal-header">
                            <h3>📦 Tồn kho - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowInventoryModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {loadingInventory ? (
                                <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <p>⏳ Đang tải tồn kho...</p>
                                </div>
                            ) : inventoryData ? (
                                <>
                                    {/* Cabinet Summary */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '1rem',
                                        marginBottom: '1.5rem',
                                        padding: '1rem',
                                        background: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                                Vị trí tủ
                                            </div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                                                {inventoryData.cabinetLocation || selectedCabinet.cabinetLocation}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                                Tổng số items
                                            </div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', color: '#007bff' }}>
                                                {inventoryData.totalItems || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                                Tỷ lệ sử dụng
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    flex: 1,
                                                    height: '8px',
                                                    background: '#e9ecef',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${inventoryData.utilizationPercent || 0}%`,
                                                        height: '100%',
                                                        background: getUtilizationColor(inventoryData.utilizationPercent || 0),
                                                        transition: 'width 0.3s ease'
                                                    }}></div>
                                                </div>
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                    {inventoryData.utilizationPercent || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Refresh Button */}
                                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn-refresh"
                                            onClick={handleRefreshInventory}
                                            disabled={loadingInventory}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <FiRefreshCw className={loadingInventory ? 'spinning' : ''} />
                                            Làm mới
                                        </button>
                                    </div>

                                    {/* Inventory Items Table */}
                                    {inventoryData.items && inventoryData.items.length > 0 ? (
                                        <div className="cabinet-table-container">
                                            <table className="cabinet-table">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Stock ID</th>
                                                        <th>Tên thuốc/Vật tư</th>
                                                        <th>Loại</th>
                                                        <th>Số lượng</th>
                                                        <th>Mức đặt lại</th>
                                                        <th>Mức tối đa</th>
                                                        <th>Số lô</th>
                                                        <th>Hạn sử dụng</th>
                                                        <th>Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inventoryData.items.map((item, index) => {
                                                        const isLowStock = item.quantityOnHand <= item.reorderLevel;
                                                        const isExpiringSoon = isExpiringWithin30Days(item.expiryDate);
                                                        const isExpired = isExpiredDate(item.expiryDate);

                                                        return (
                                                            <tr key={item.stockId || index} style={{
                                                                background: isExpired ? '#fff5f5' : isExpiringSoon ? '#fffbf0' : 'transparent'
                                                            }}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.stockId}</td>
                                                                <td><strong>{item.itemName}</strong></td>
                                                                <td>
                                                                    <span className={`badge badge-type-${(item.itemType || 'MEDICINE').toLowerCase()}`}>
                                                                        {item.itemType || 'MEDICINE'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span style={{
                                                                        color: isLowStock ? '#dc3545' : '#28a745',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {item.quantityOnHand}
                                                                        {isLowStock && ' ⚠️'}
                                                                    </span>
                                                                </td>
                                                                <td>{item.reorderLevel}</td>
                                                                <td>{item.maxStockLevel}</td>
                                                                <td>{item.batchNumber || 'N/A'}</td>
                                                                <td style={{
                                                                    color: isExpired ? '#dc3545' : isExpiringSoon ? '#ffc107' : 'inherit',
                                                                    fontWeight: (isExpired || isExpiringSoon) ? 'bold' : 'normal'
                                                                }}>
                                                                    {formatDate(item.expiryDate)}
                                                                    {isExpired && ' ❌'}
                                                                    {!isExpired && isExpiringSoon && ' ⚠️'}
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${getInventoryStatusBadgeClass(item.status)}`}>
                                                                        {getInventoryStatusLabel(item.status)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                                            <FiPackage size={48} color="#dee2e6" />
                                            <p style={{ marginTop: '1rem', color: '#6c757d' }}>
                                                Tủ này chưa có tồn kho
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="error-message" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <p>❌ Không thể tải dữ liệu tồn kho</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowInventoryModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetManagementPage;




