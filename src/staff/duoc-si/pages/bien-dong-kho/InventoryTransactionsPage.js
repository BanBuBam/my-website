import { useState, useEffect } from 'react';
import '../tu-thuoc/CabinetManagementPage.css';
import { FiRefreshCw, FiDownload, FiEye, FiFilter, FiX, FiCalendar, FiPackage, FiPlus, FiSave, FiClock, FiArchive, FiLayers, FiSearch, FiCheckCircle, FiBarChart2, FiTrendingUp, FiActivity, FiDollarSign } from 'react-icons/fi';
import { pharmacistInventoryMovementAPI, pharmacistCabinetAPI, pharmacistInventoryAPI } from '../../../../services/staff/pharmacistAPI';

const InventoryTransactionsPage = () => {
    // State
    const [transactions, setTransactions] = useState([]);
    const [cabinets, setCabinets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        cabinetId: '',
        operationType: 'ALL',
        itemType: 'ALL',
        search: '',
        recentDays: '30',  // Default: last 30 days
        // New filters
        referenceType: '',
        referenceId: '',
        patientId: '',
        employeeId: ''
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });

    // Modal state
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Record Movement Modal state
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [stockItems, setStockItems] = useState([]);
    const [loadingStockItems, setLoadingStockItems] = useState(false);
    const [submittingMovement, setSubmittingMovement] = useState(false);

    // Movement form state
    const [movementForm, setMovementForm] = useState({
        stockId: '',
        movementType: 'ADJUSTMENT',
        movementReason: '',
        quantity: 1,
        unitCost: '',
        batchNumber: '',
        expiryDate: '',
        referenceType: 'MANUAL',
        notes: ''
    });

    // Stock History Modal state
    const [showStockHistoryModal, setShowStockHistoryModal] = useState(false);
    const [stockHistory, setStockHistory] = useState([]);
    const [loadingStockHistory, setLoadingStockHistory] = useState(false);
    const [selectedStockId, setSelectedStockId] = useState(null);

    // Statistics state
    const [statistics, setStatistics] = useState(null);
    const [loadingStatistics, setLoadingStatistics] = useState(false);
    const [showStatistics, setShowStatistics] = useState(false);

    // Daily Summary state
    const [dailySummary, setDailySummary] = useState([]);
    const [loadingDailySummary, setLoadingDailySummary] = useState(false);
    const [showDailySummary, setShowDailySummary] = useState(false);

    // Load initial data
    useEffect(() => {
        loadCabinets();
        loadTransactions();
    }, []);

    // Load cabinets for filter dropdown
    const loadCabinets = async () => {
        try {
            // Use GET /cabinet-management to get all cabinets
            // Request large page size to get all cabinets at once
            const response = await pharmacistCabinetAPI.getAllCabinets(0, 1000);
            console.log('Cabinets API Response:', response);

            if (response && response.data) {
                if (response.data.content) {
                    // Paginated response: { data: { content: [...], totalPages, totalElements } }
                    setCabinets(response.data.content);
                } else if (Array.isArray(response.data)) {
                    // Direct array in data: { data: [...] }
                    setCabinets(response.data);
                }
            } else if (response && response.content) {
                // Direct paginated response: { content: [...], totalPages, totalElements }
                setCabinets(response.content);
            } else if (Array.isArray(response)) {
                // Direct array response: [...]
                setCabinets(response);
            } else {
                console.warn('Unexpected cabinets response structure:', response);
                setCabinets([]);
            }
        } catch (err) {
            console.error('Error loading cabinets:', err);
            setCabinets([]);
        }
    };

    // Load transactions
    const loadTransactions = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // Determine which API endpoint to use based on filters
            // Priority order: Reference > Patient > Employee > Cabinet > Type > Date Range > Recent
            if (filters.referenceType && filters.referenceId) {
                // Get movements by reference
                console.log('=== REFERENCE FILTER ===');
                console.log('Reference Type:', filters.referenceType);
                console.log('Reference ID:', filters.referenceId);
                response = await pharmacistInventoryMovementAPI.getMovementsByReference(
                    filters.referenceType,
                    filters.referenceId,
                    page,
                    20
                );
            } else if (filters.patientId) {
                // Get movements by patient
                console.log('=== PATIENT FILTER ===');
                console.log('Patient ID:', filters.patientId);
                response = await pharmacistInventoryMovementAPI.getMovementsByPatient(filters.patientId, page, 20);
            } else if (filters.employeeId) {
                // Get movements by employee
                console.log('=== EMPLOYEE FILTER ===');
                console.log('Employee ID:', filters.employeeId);
                response = await pharmacistInventoryMovementAPI.getMovementsByEmployee(filters.employeeId, page, 20);
            } else if (filters.cabinetId && filters.cabinetId !== '') {
                // Get movements by cabinet
                response = await pharmacistInventoryMovementAPI.getMovementsByCabinet(filters.cabinetId, page, 20);
            } else if (filters.operationType && filters.operationType !== 'ALL') {
                // Get movements by type
                console.log('=== MOVEMENT TYPE FILTER ===');
                console.log('Movement Type:', filters.operationType);
                response = await pharmacistInventoryMovementAPI.getMovementsByType(filters.operationType, page, 20);
            } else if (filters.startDate && filters.endDate) {
                // Get movements by date range
                // Convert YYYY-MM-DD to YYYY-MM-DDTHH:mm:ss format
                const startDateTime = `${filters.startDate}T00:00:00`;
                const endDateTime = `${filters.endDate}T23:59:59`;

                console.log('=== DATE RANGE FILTER ===');
                console.log('Start Date:', startDateTime);
                console.log('End Date:', endDateTime);

                response = await pharmacistInventoryMovementAPI.getMovementsByDateRange(startDateTime, endDateTime, page, 20);
            } else {
                // Get recent movements (default)
                // Get movements from the last X days (user-configurable)
                const days = parseInt(filters.recentDays) || 30;
                console.log('=== RECENT MOVEMENTS ===');
                console.log('Days:', days);
                response = await pharmacistInventoryMovementAPI.getRecentMovements(days);
            }

            console.log('Movements response:', response);

            // Handle different response structures
            if (response && response.data) {
                if (response.data.content) {
                    // Paginated response
                    setTransactions(response.data.content);
                    setPagination({
                        currentPage: response.data.number || 0,
                        totalPages: response.data.totalPages || 0,
                        totalElements: response.data.totalElements || 0,
                        pageSize: response.data.size || 20
                    });
                } else if (Array.isArray(response.data)) {
                    // Array response
                    setTransactions(response.data);
                    setPagination({
                        currentPage: page,
                        totalPages: 1,
                        totalElements: response.data.length,
                        pageSize: 20
                    });
                }
            } else if (response && response.content) {
                // Direct paginated response
                setTransactions(response.content);
                setPagination({
                    currentPage: response.number || 0,
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    pageSize: response.size || 20
                });
            } else if (Array.isArray(response)) {
                // Direct array response
                setTransactions(response);
                setPagination({
                    currentPage: page,
                    totalPages: 1,
                    totalElements: response.length,
                    pageSize: 20
                });
            } else {
                setTransactions([]);
                setPagination({
                    currentPage: 0,
                    totalPages: 0,
                    totalElements: 0,
                    pageSize: 20
                });
            }
        } catch (err) {
            console.error('Error loading movements:', err);
            setError(err.message || 'Không thể tải danh sách biến động kho');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Apply filters
    const handleApplyFilters = () => {
        // Validate reference filter
        if ((filters.referenceType && !filters.referenceId) || (!filters.referenceType && filters.referenceId)) {
            alert('⚠️ Vui lòng chọn cả loại tham chiếu và ID tham chiếu');
            return;
        }

        // Validate date range
        if ((filters.startDate && !filters.endDate) || (!filters.startDate && filters.endDate)) {
            alert('⚠️ Vui lòng chọn cả ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);

            if (start > end) {
                alert('⚠️ Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
                return;
            }
        }

        loadTransactions(0);
    };

    // Clear filters
    const handleClearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            cabinetId: '',
            operationType: 'ALL',
            itemType: 'ALL',
            search: '',
            recentDays: '30',  // Reset to default 30 days
            referenceType: '',
            referenceId: '',
            patientId: '',
            employeeId: ''
        });
        // Reload with cleared filters
        setTimeout(() => loadTransactions(0), 100);
    };

    // Load movement statistics
    const loadStatistics = async () => {
        try {
            setLoadingStatistics(true);

            // Determine date range for statistics
            let startDate, endDate;

            if (filters.startDate && filters.endDate) {
                // Use filter date range
                startDate = `${filters.startDate}T00:00:00`;
                endDate = `${filters.endDate}T23:59:59`;
            } else {
                // Use recent days
                const days = parseInt(filters.recentDays) || 30;
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - days);

                startDate = start.toISOString().split('.')[0];
                endDate = end.toISOString().split('.')[0];
            }

            console.log('=== LOADING STATISTICS ===');
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);

            const response = await pharmacistInventoryMovementAPI.getMovementStatistics(startDate, endDate);

            console.log('=== STATISTICS RESPONSE ===');
            console.log('Full Response:', response);
            console.log('Response.data:', response?.data);

            if (response && response.data) {
                console.log('Setting statistics from response.data:', response.data);
                setStatistics(response.data);
            } else if (response) {
                console.log('Setting statistics from response:', response);
                setStatistics(response);
            }

            console.log('Statistics state will be set to:', response?.data || response);
        } catch (err) {
            console.error('Error loading statistics:', err);
            alert('❌ Không thể tải thống kê biến động kho');
        } finally {
            setLoadingStatistics(false);
        }
    };

    // Toggle statistics display
    const handleToggleStatistics = () => {
        if (!showStatistics) {
            loadStatistics();
        }
        setShowStatistics(!showStatistics);
    };

    // Load daily movement summary
    const loadDailySummary = async () => {
        try {
            setLoadingDailySummary(true);

            // Determine date range for daily summary
            let startDate, endDate;

            if (filters.startDate && filters.endDate) {
                // Use filter date range
                startDate = `${filters.startDate}T00:00:00`;
                endDate = `${filters.endDate}T23:59:59`;
            } else {
                // Use recent days
                const days = parseInt(filters.recentDays) || 30;
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - days);

                startDate = start.toISOString().split('.')[0];
                endDate = end.toISOString().split('.')[0];
            }

            console.log('=== LOADING DAILY SUMMARY ===');
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);

            const response = await pharmacistInventoryMovementAPI.getDailyMovementSummary(startDate, endDate);

            console.log('=== DAILY SUMMARY RESPONSE ===');
            console.log('Full Response:', response);
            console.log('Response.data:', response?.data);

            if (response && response.data) {
                console.log('Setting daily summary from response.data:', response.data);
                setDailySummary(response.data);
            } else if (response) {
                console.log('Setting daily summary from response:', response);
                setDailySummary(response);
            }

            console.log('Daily summary state will be set to:', response?.data || response);
        } catch (err) {
            console.error('Error loading daily summary:', err);
            alert('❌ Không thể tải tổng hợp theo ngày');
        } finally {
            setLoadingDailySummary(false);
        }
    };

    // Toggle daily summary display
    const handleToggleDailySummary = () => {
        if (!showDailySummary) {
            loadDailySummary();
        }
        setShowDailySummary(!showDailySummary);
    };

    // View movement details
    const handleViewDetails = async (movement) => {
        try {
            setSelectedTransaction(movement);
            setShowDetailsModal(true);
            setLoadingDetails(true);

            // Load full movement details if needed
            // Use movementId instead of transactionId
            const movementId = movement.movementId || movement.transactionId || movement.id;
            const response = await pharmacistInventoryMovementAPI.getMovementById(movementId);

            if (response && response.data) {
                setSelectedTransaction(response.data);
            } else if (response) {
                setSelectedTransaction(response);
            }
        } catch (err) {
            console.error('Error loading movement details:', err);
            alert('❌ Không thể tải chi tiết biến động kho');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Open record movement modal
    const handleOpenRecordModal = () => {
        setShowRecordModal(true);
        loadStockItems();
    };

    // Close record movement modal
    const handleCloseRecordModal = () => {
        setShowRecordModal(false);
        resetMovementForm();
    };

    // Load stock items for dropdown
    const loadStockItems = async () => {
        try {
            setLoadingStockItems(true);
            const response = await pharmacistInventoryAPI.getInventory(0, 1000);
            console.log('Stock Items Response:', response);

            if (response && response.data) {
                if (response.data.content) {
                    setStockItems(response.data.content);
                } else if (Array.isArray(response.data)) {
                    setStockItems(response.data);
                }
            } else if (response && response.content) {
                setStockItems(response.content);
            } else if (Array.isArray(response)) {
                setStockItems(response);
            } else {
                setStockItems([]);
            }
        } catch (err) {
            console.error('Error loading stock items:', err);
            alert('❌ Không thể tải danh sách tồn kho');
            setStockItems([]);
        } finally {
            setLoadingStockItems(false);
        }
    };

    // Reset movement form
    const resetMovementForm = () => {
        setMovementForm({
            stockId: '',
            movementType: 'ADJUSTMENT',
            movementReason: '',
            quantity: 1,
            unitCost: '',
            batchNumber: '',
            expiryDate: '',
            referenceType: 'MANUAL',
            notes: ''
        });
    };

    // Handle form field change
    const handleFormChange = (field, value) => {
        setMovementForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Validate movement form
    const validateMovementForm = () => {
        if (!movementForm.stockId) {
            alert('⚠️ Vui lòng chọn stock item');
            return false;
        }
        if (!movementForm.movementType) {
            alert('⚠️ Vui lòng chọn loại biến động');
            return false;
        }
        if (!movementForm.movementReason || movementForm.movementReason.trim() === '') {
            alert('⚠️ Vui lòng nhập lý do biến động');
            return false;
        }
        if (!movementForm.quantity || movementForm.quantity <= 0) {
            alert('⚠️ Số lượng phải lớn hơn 0');
            return false;
        }
        if (!movementForm.batchNumber || movementForm.batchNumber.trim() === '') {
            alert('⚠️ Vui lòng nhập số lô');
            return false;
        }
        if (!movementForm.referenceType) {
            alert('⚠️ Vui lòng chọn loại tham chiếu');
            return false;
        }
        if (movementForm.unitCost && parseFloat(movementForm.unitCost) < 0) {
            alert('⚠️ Đơn giá phải >= 0');
            return false;
        }
        return true;
    };

    // Submit movement form
    const handleSubmitMovement = async () => {
        if (!validateMovementForm()) return;

        try {
            setSubmittingMovement(true);

            const movementData = {
                stockId: parseInt(movementForm.stockId),
                movementType: movementForm.movementType,
                movementReason: movementForm.movementReason.trim(),
                quantity: parseInt(movementForm.quantity),
                unitCost: movementForm.unitCost ? parseFloat(movementForm.unitCost) : undefined,
                batchNumber: movementForm.batchNumber.trim(),
                expiryDate: movementForm.expiryDate || undefined,
                referenceType: movementForm.referenceType,
                notes: movementForm.notes.trim() || undefined
            };

            console.log('=== RECORD MOVEMENT DEBUG ===');
            console.log('Movement Data:', JSON.stringify(movementData, null, 2));

            const response = await pharmacistInventoryMovementAPI.recordMovement(movementData);
            console.log('Movement Response:', response);

            if (response && (response.status === 'success' || response.data)) {
                const movementInfo = response.data || response;
                alert(`✅ Ghi nhận biến động kho thành công!\n\nMovement ID: ${movementInfo.movementId || 'N/A'}\nLoại: ${movementInfo.movementType || 'N/A'}\nSố lượng: ${movementInfo.quantity || 'N/A'}`);

                // Close modal and reload transactions
                handleCloseRecordModal();
                loadTransactions(pagination.currentPage);
            } else {
                alert('❌ Có lỗi xảy ra khi ghi nhận biến động kho');
            }
        } catch (err) {
            console.error('Error recording movement:', err);
            alert('❌ ' + getErrorMessage(err));
        } finally {
            setSubmittingMovement(false);
        }
    };

    // View Stock History
    const handleViewStockHistory = async (stockId) => {
        try {
            setSelectedStockId(stockId);
            setShowStockHistoryModal(true);
            setLoadingStockHistory(true);
            setStockHistory([]);

            console.log('=== LOADING STOCK HISTORY ===');
            console.log('Stock ID:', stockId);

            const response = await pharmacistInventoryMovementAPI.getMovementHistoryForStock(stockId, 0, 100);
            console.log('Stock History Response:', response);

            let historyData = [];
            if (response && response.data) {
                if (response.data.content) {
                    historyData = response.data.content;
                } else if (Array.isArray(response.data)) {
                    historyData = response.data;
                }
            } else if (response && response.content) {
                historyData = response.content;
            } else if (Array.isArray(response)) {
                historyData = response;
            }

            setStockHistory(historyData);
            console.log('Stock History Data:', historyData);
        } catch (err) {
            console.error('Error loading stock history:', err);
            alert('❌ Không thể tải lịch sử biến động của stock item');
            setStockHistory([]);
        } finally {
            setLoadingStockHistory(false);
        }
    };

    // Close Stock History Modal
    const handleCloseStockHistoryModal = () => {
        setShowStockHistoryModal(false);
        setStockHistory([]);
        setSelectedStockId(null);
    };

    // Format datetime
    const formatDateTime = (datetime) => {
        if (!datetime) return '-';
        const date = new Date(datetime);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get operation type badge
    const getOperationTypeBadge = (type) => {
        const badges = {
            'RESTOCK': { label: 'Bổ sung', color: '#007bff' },
            'DISPENSE': { label: 'Cấp phát', color: '#28a745' },
            'ADJUSTMENT': { label: 'Điều chỉnh', color: '#fd7e14' },
            'TRANSFER': { label: 'Chuyển kho', color: '#6f42c1' }
        };

        const badge = badges[type] || { label: type, color: '#6c757d' };

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '500',
                background: badge.color,
                color: '#fff'
            }}>
                {badge.label}
            </span>
        );
    };

    // Get error message
    const getErrorMessage = (err) => {
        if (err.response) {
            const status = err.response.status;
            if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
            if (status === 404) return 'Không tìm thấy dữ liệu.';
            if (status === 500) return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        }
        return err.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
    };

    return (
        <div className="cabinet-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>📊 Quản lý biến động kho</h2>
                    <p>Theo dõi các giao dịch biến động kho tủ thuốc</p>
                </div>
                <div className="header-right">
                    <button
                        className="btn-primary"
                        onClick={handleToggleStatistics}
                        style={{
                            background: showStatistics ? '#8b5cf6' : '#667eea',
                            color: '#fff',
                            marginRight: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FiBarChart2 />
                        {showStatistics ? 'Ẩn thống kê' : 'Xem thống kê'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleToggleDailySummary}
                        style={{
                            background: showDailySummary ? '#10b981' : '#059669',
                            color: '#fff',
                            marginRight: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FiCalendar />
                        {showDailySummary ? 'Ẩn tổng hợp' : 'Tổng hợp theo ngày'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleOpenRecordModal}
                        style={{ background: '#007bff', color: '#fff', marginRight: '0.5rem' }}
                    >
                        <FiPlus />
                        Ghi nhận biến động
                    </button>
                    <button className="btn-refresh" onClick={() => loadTransactions(pagination.currentPage)} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                    <button className="btn-secondary" style={{ background: '#28a745', color: '#fff' }}>
                        <FiDownload />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)',
                    pointerEvents: 'none'
                }}></div>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <FiFilter size={20} style={{ color: '#fff' }} />
                        </div>
                        <div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#fff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                Bộ lọc tìm kiếm
                            </h3>
                            <p style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                marginTop: '0.25rem'
                            }}>
                                Tùy chỉnh tiêu chí để tìm kiếm chính xác
                            </p>
                        </div>
                    </div>
                    {(filters.referenceType && filters.referenceId) ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#3b82f6',
                            padding: '0.5rem 1rem',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <FiPackage size={16} />
                            <span>
                                {filters.referenceType} #{filters.referenceId}
                            </span>
                        </div>
                    ) : filters.patientId ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#ec4899',
                            padding: '0.5rem 1rem',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <FiPackage size={16} />
                            <span>
                                Bệnh nhân #{filters.patientId}
                            </span>
                        </div>
                    ) : filters.employeeId ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#8b5cf6',
                            padding: '0.5rem 1rem',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <FiPackage size={16} />
                            <span>
                                Nhân viên #{filters.employeeId}
                            </span>
                        </div>
                    ) : (filters.startDate && filters.endDate) ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#007bff',
                            padding: '0.5rem 1rem',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <FiCalendar size={16} />
                            <span>
                                {new Date(filters.startDate).toLocaleDateString('vi-VN')}
                                {' → '}
                                {new Date(filters.endDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#28a745',
                            padding: '0.5rem 1rem',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <FiClock size={16} />
                            <span>
                                {filters.recentDays} ngày gần đây
                            </span>
                        </div>
                    )}
                </div>

                {/* Filter Content Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 1
                }}>

                    {/* Time Period Group */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '2px solid #f0f0f0'
                        }}>
                            <FiCalendar size={18} style={{ color: '#667eea' }} />
                            <h4 style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#2d3748',
                                letterSpacing: '0.5px'
                            }}>
                                Khoảng thời gian
                            </h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            {/* Date Range - Start */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiCalendar size={14} style={{ color: '#667eea' }} />
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${filters.startDate ? '#667eea' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: filters.startDate ? '#f7fafc' : '#fff',
                                        boxShadow: filters.startDate ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                                    }}
                                />
                                {filters.startDate && !filters.endDate && (
                                    <small style={{
                                        color: '#f59e0b',
                                        fontSize: '0.8rem',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        animation: 'fadeIn 0.3s ease-out'
                                    }}>
                                        ⚠️ Vui lòng chọn ngày kết thúc
                                    </small>
                                )}
                            </div>

                            {/* Date Range - End */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiCalendar size={14} style={{ color: '#667eea' }} />
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${filters.endDate ? '#667eea' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: filters.endDate ? '#f7fafc' : '#fff',
                                        boxShadow: filters.endDate ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                                    }}
                                />
                                {!filters.startDate && filters.endDate && (
                                    <small style={{
                                        color: '#f59e0b',
                                        fontSize: '0.8rem',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        animation: 'fadeIn 0.3s ease-out'
                                    }}>
                                        ⚠️ Vui lòng chọn ngày bắt đầu
                                    </small>
                                )}
                            </div>

                            {/* Recent Days Filter */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiClock size={14} style={{ color: '#10b981' }} />
                                    Xem gần đây
                                </label>
                                <select
                                    value={filters.recentDays}
                                    onChange={(e) => handleFilterChange('recentDays', e.target.value)}
                                    disabled={filters.startDate || filters.endDate}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${(!filters.startDate && !filters.endDate) ? '#10b981' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: (!filters.startDate && !filters.endDate) ? '#f0fdf4' : '#f9fafb',
                                        opacity: (filters.startDate || filters.endDate) ? 0.6 : 1,
                                        cursor: (filters.startDate || filters.endDate) ? 'not-allowed' : 'pointer',
                                        boxShadow: (!filters.startDate && !filters.endDate) ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none'
                                    }}
                                >
                                    <option value="7">7 ngày qua</option>
                                    <option value="14">14 ngày qua</option>
                                    <option value="30">30 ngày qua</option>
                                    <option value="60">60 ngày qua</option>
                                    <option value="90">90 ngày qua</option>
                                </select>
                                {(!filters.startDate && !filters.endDate) && (
                                    <small style={{
                                        color: '#10b981',
                                        fontSize: '0.8rem',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontWeight: '600',
                                        animation: 'fadeIn 0.3s ease-out'
                                    }}>
                                        <FiCheckCircle size={12} /> Đang áp dụng
                                    </small>
                                )}
                                {(filters.startDate || filters.endDate) && (
                                    <small style={{
                                        color: '#9ca3af',
                                        fontSize: '0.8rem',
                                        marginTop: '0.5rem',
                                        display: 'block'
                                    }}>
                                        Tắt khi dùng khoảng ngày
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category Filters Group */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '2px solid #f0f0f0'
                        }}>
                            <FiLayers size={18} style={{ color: '#8b5cf6' }} />
                            <h4 style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#2d3748',
                                letterSpacing: '0.5px'
                            }}>
                                Phân loại
                            </h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            {/* Cabinet Filter */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiArchive size={14} style={{ color: '#8b5cf6' }} />
                                    Tủ thuốc
                                </label>
                                <select
                                    value={filters.cabinetId}
                                    onChange={(e) => handleFilterChange('cabinetId', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${filters.cabinetId ? '#8b5cf6' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: filters.cabinetId ? '#faf5ff' : '#fff',
                                        cursor: 'pointer',
                                        boxShadow: filters.cabinetId ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                                    }}
                                >
                                    <option value="">-- Tất cả tủ --</option>
                                    {cabinets.map(cabinet => (
                                        <option key={cabinet.cabinetId} value={cabinet.cabinetId}>
                                            {cabinet.cabinetLocation}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Movement Type Filter */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiPackage size={14} style={{ color: '#f59e0b' }} />
                                    Loại biến động
                                </label>
                                <select
                                    value={filters.operationType}
                                    onChange={(e) => handleFilterChange('operationType', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${(filters.operationType && filters.operationType !== 'ALL') ? '#f59e0b' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: (filters.operationType && filters.operationType !== 'ALL') ? '#fffbeb' : '#fff',
                                        cursor: 'pointer',
                                        boxShadow: (filters.operationType && filters.operationType !== 'ALL') ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : 'none'
                                    }}
                                >
                                    <option value="ALL">-- Tất cả --</option>
                                    <option value="IN">IN - Nhập kho</option>
                                    <option value="OUT">OUT - Xuất kho</option>
                                    <option value="TRANSFER">TRANSFER - Điều chuyển</option>
                                    <option value="ADJUSTMENT">ADJUSTMENT - Điều chỉnh</option>
                                    <option value="RETURN">RETURN - Trả lại</option>
                                </select>
                                {(filters.operationType && filters.operationType !== 'ALL') && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem',
                                        color: '#f59e0b',
                                        fontWeight: '500'
                                    }}>
                                        ✓ Đang lọc: {filters.operationType}
                                    </div>
                                )}
                            </div>

                            {/* Employee ID Filter */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiPackage size={14} style={{ color: '#8b5cf6' }} />
                                    ID Nhân viên
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập ID nhân viên..."
                                    value={filters.employeeId}
                                    onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${filters.employeeId ? '#8b5cf6' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: filters.employeeId ? '#faf5ff' : '#fff',
                                        boxShadow: filters.employeeId ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                                    }}
                                />
                                {filters.employeeId && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem',
                                        color: '#8b5cf6',
                                        fontWeight: '500'
                                    }}>
                                        ✓ Đang lọc theo nhân viên #{filters.employeeId}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search Group */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '2px solid #f0f0f0'
                        }}>
                            <FiSearch size={18} style={{ color: '#ef4444' }} />
                            <h4 style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#2d3748',
                                letterSpacing: '0.5px'
                            }}>
                                Tìm kiếm
                            </h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            {/* Search Keyword */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiSearch size={14} style={{ color: '#ef4444' }} />
                                    Từ khóa
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Nhập số lô, ghi chú..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                                            border: `2px solid ${filters.search ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s ease',
                                            background: filters.search ? '#fef2f2' : '#fff',
                                            boxShadow: filters.search ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                                        }}
                                    />
                                    <FiSearch
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            left: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: filters.search ? '#ef4444' : '#9ca3af',
                                            transition: 'color 0.3s ease'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Reference Type */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiPackage size={14} style={{ color: '#3b82f6' }} />
                                    Loại tham chiếu
                                </label>
                                <select
                                    value={filters.referenceType}
                                    onChange={(e) => handleFilterChange('referenceType', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${filters.referenceType ? '#3b82f6' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: filters.referenceType ? '#eff6ff' : '#fff',
                                        boxShadow: filters.referenceType ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">-- Chọn loại --</option>
                                    <option value="PRESCRIPTION">PRESCRIPTION</option>
                                    <option value="GOODS_RECEIPT">GOODS_RECEIPT</option>
                                    <option value="INVOICE">INVOICE</option>
                                    <option value="MANUAL">MANUAL</option>
                                    <option value="GOODS_ISSUE">GOODS_ISSUE</option>
                                    <option value="PURCHASE_ORDER">PURCHASE_ORDER</option>
                                    <option value="TRANSFER_ORDER">TRANSFER_ORDER</option>
                                    <option value="INVENTORY_CHECK">INVENTORY_CHECK</option>
                                </select>
                                {filters.referenceType && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem',
                                        color: '#3b82f6',
                                        fontWeight: '500'
                                    }}>
                                        ✓ Đã chọn: {filters.referenceType}
                                    </div>
                                )}
                            </div>

                            {/* Reference ID */}
                            <div className="form-group">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>
                                    <FiPackage size={14} style={{ color: '#3b82f6' }} />
                                    ID tham chiếu
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập ID tham chiếu..."
                                    value={filters.referenceId}
                                    onChange={(e) => handleFilterChange('referenceId', e.target.value)}
                                    disabled={!filters.referenceType}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: `2px solid ${filters.referenceId ? '#3b82f6' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        background: !filters.referenceType ? '#f9fafb' : (filters.referenceId ? '#eff6ff' : '#fff'),
                                        boxShadow: filters.referenceId ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                        cursor: !filters.referenceType ? 'not-allowed' : 'text',
                                        opacity: !filters.referenceType ? 0.6 : 1
                                    }}
                                />
                                {!filters.referenceType && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem',
                                        color: '#9ca3af',
                                        fontWeight: '500'
                                    }}>
                                        Chọn loại tham chiếu trước
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Patient ID Filter */}
                        <div className="form-group" style={{ marginTop: '1.25rem' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#4a5568'
                            }}>
                                <FiPackage size={14} style={{ color: '#ec4899' }} />
                                ID Bệnh nhân
                            </label>
                            <input
                                type="number"
                                placeholder="Nhập ID bệnh nhân để xem lịch sử biến động..."
                                value={filters.patientId}
                                onChange={(e) => handleFilterChange('patientId', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `2px solid ${filters.patientId ? '#ec4899' : '#e2e8f0'}`,
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease',
                                    background: filters.patientId ? '#fdf2f8' : '#fff',
                                    boxShadow: filters.patientId ? '0 0 0 3px rgba(236, 72, 153, 0.1)' : 'none'
                                }}
                            />
                            {filters.patientId && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.8rem',
                                    color: '#ec4899',
                                    fontWeight: '500'
                                }}>
                                    ✓ Đang lọc theo bệnh nhân #{filters.patientId}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        paddingTop: '1.5rem',
                        borderTop: '2px solid #f0f0f0'
                    }}>
                        <button
                            onClick={handleClearFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.875rem 1.75rem',
                                background: '#fff',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#f8fafc';
                                e.target.style.borderColor = '#cbd5e1';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#fff';
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            }}
                        >
                            <FiX size={18} />
                            Xóa bộ lọc
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.875rem 2rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <FiCheckCircle size={18} />
                            Áp dụng bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Dashboard */}
            {showStatistics && (
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {/* Decorative Background */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }}></div>

                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FiBarChart2 size={24} style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#fff',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    Thống kê biến động kho
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    marginTop: '0.25rem'
                                }}>
                                    Tổng quan về các giao dịch trong khoảng thời gian đã chọn
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleStatistics}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '10px',
                                padding: '0.5rem 1rem',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Statistics Content */}
                    {loadingStatistics ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '3rem',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <FiActivity size={48} style={{ color: '#667eea', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Đang tải thống kê...</p>
                        </div>
                    ) : statistics ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '16px',
                            padding: '2rem',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Summary Cards Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {/* Total Movements */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FiActivity size={20} />
                                        <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>Tổng giao dịch</span>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                        {(statistics.total_movements || 0).toLocaleString()}
                                    </div>
                                </div>

                                {/* Total Value */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FiDollarSign size={20} />
                                        <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>Tổng giá trị</span>
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                                        {(statistics.total_value || 0).toLocaleString('vi-VN')} ₫
                                    </div>
                                </div>

                                {/* Total Quantity */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FiTrendingUp size={20} />
                                        <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>Tổng số lượng</span>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                        {(statistics.total_quantity || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Movement Types Breakdown */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{
                                    margin: '0 0 1rem 0',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#2d3748'
                                }}>
                                    Phân loại theo loại biến động
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '1rem'
                                }}>
                                    {statistics.by_type && Object.entries(statistics.by_type).map(([type, data]) => (
                                        <div key={type} style={{
                                            background: '#fff',
                                            borderRadius: '10px',
                                            padding: '1.5rem',
                                            border: '2px solid #e2e8f0',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: '#64748b',
                                                marginBottom: '1rem',
                                                fontWeight: '600',
                                                textAlign: 'center'
                                            }}>
                                                {type}
                                            </div>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '1rem'
                                            }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Số lượng</div>
                                                    <div style={{
                                                        fontSize: '1.5rem',
                                                        fontWeight: '700',
                                                        color: type === 'IN' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {(data.quantity || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Giá trị</div>
                                                    <div style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '700',
                                                        color: type === 'IN' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {data.total_cost ? `${(data.total_cost || 0).toLocaleString('vi-VN')} ₫` : '-'}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Giao dịch</div>
                                                    <div style={{
                                                        fontSize: '1.5rem',
                                                        fontWeight: '700',
                                                        color: type === 'IN' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {(data.count || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '3rem',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <FiBarChart2 size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Không có dữ liệu thống kê</p>
                        </div>
                    )}
                </div>
            )}

            {/* Daily Summary Dashboard */}
            {showDailySummary && (
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {/* Decorative Background */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }}></div>

                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FiCalendar size={24} style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#fff',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    Tổng hợp theo ngày
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    marginTop: '0.25rem'
                                }}>
                                    Thống kê biến động kho theo từng ngày
                                </p>
                            </div>
                        </div>
                        {loadingDailySummary && (
                            <FiRefreshCw className="spinning" size={24} style={{ color: '#fff' }} />
                        )}
                    </div>

                    {/* Daily Summary Content */}
                    {!loadingDailySummary && dailySummary && dailySummary.length > 0 ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            position: 'relative',
                            zIndex: 1,
                            maxHeight: '500px',
                            overflowY: 'auto'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: '#f8fafc',
                                        borderBottom: '2px solid #e2e8f0'
                                    }}>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#2d3748',
                                            fontSize: '0.9rem'
                                        }}>
                                            Ngày
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#2d3748',
                                            fontSize: '0.9rem'
                                        }}>
                                            Loại biến động
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#2d3748',
                                            fontSize: '0.9rem'
                                        }}>
                                            Số lượng
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#2d3748',
                                            fontSize: '0.9rem'
                                        }}>
                                            Số giao dịch
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailySummary.map((item, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #e2e8f0',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{
                                                padding: '1rem',
                                                fontWeight: '600',
                                                color: '#2d3748'
                                            }}>
                                                {new Date(item.date).toLocaleDateString('vi-VN', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    fontSize: '0.9rem',
                                                    background: item.movement_type === 'IN' ? '#d1fae5' : item.movement_type === 'OUT' ? '#fee2e2' : '#e0e7ff',
                                                    color: item.movement_type === 'IN' ? '#059669' : item.movement_type === 'OUT' ? '#dc2626' : '#667eea'
                                                }}>
                                                    {item.movement_type}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center',
                                                fontWeight: '700',
                                                color: item.movement_type === 'IN' ? '#10b981' : item.movement_type === 'OUT' ? '#ef4444' : '#667eea',
                                                fontSize: '1.1rem'
                                            }}>
                                                {(item.quantity || 0).toLocaleString()}
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center',
                                                fontWeight: '700',
                                                color: '#667eea',
                                                fontSize: '1.1rem'
                                            }}>
                                                {(item.count || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '3rem',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <FiCalendar size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Không có dữ liệu tổng hợp theo ngày</p>
                        </div>
                    )}
                </div>
            )}

            {/* Transactions Table */}
            <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                {/* Table Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                        Danh sách giao dịch
                        {pagination.totalElements > 0 && (
                            <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.9rem', fontWeight: '400' }}>
                                ({pagination.totalElements} giao dịch)
                            </span>
                        )}
                    </h3>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                        <FiRefreshCw className="spinning" size={32} />
                        <p style={{ marginTop: '1rem' }}>Đang tải dữ liệu...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#dc3545',
                        background: '#fff5f5',
                        borderRadius: '8px'
                    }}>
                        <p style={{ margin: 0, fontWeight: '500' }}>❌ {error}</p>
                        <button
                            className="btn-primary"
                            onClick={() => loadTransactions(0)}
                            style={{ marginTop: '1rem' }}
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && transactions.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#6c757d',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <FiPackage size={48} color="#dee2e6" />
                        <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Không có giao dịch nào</p>
                        <p style={{ fontSize: '0.9rem', color: '#adb5bd' }}>
                            Thử thay đổi bộ lọc hoặc tạo giao dịch mới
                        </p>
                    </div>
                )}

                {/* Transactions Table */}
                {!loading && !error && transactions.length > 0 && (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="cabinet-table" style={{ minWidth: '1200px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px', textAlign: 'center' }}>ID</th>
                                        <th style={{ width: '140px' }}>Ngày giờ</th>
                                        <th style={{ width: '120px' }}>Loại biến động</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Số lượng</th>
                                        <th style={{ width: '150px', textAlign: 'center' }}>Tồn kho</th>
                                        <th style={{ width: '120px' }}>Lý do</th>
                                        <th style={{ width: '120px' }}>Tham chiếu</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Stock ID</th>
                                        <th style={{ minWidth: '200px' }}>Ghi chú</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Trạng thái</th>
                                        <th style={{ width: '80px', textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((movement, index) => (
                                        <tr key={movement.movementId} style={{
                                            background: movement.isReversed ? '#fff5f5' : 'transparent',
                                            opacity: movement.isReversed ? 0.7 : 1
                                        }}>
                                            {/* Movement ID */}
                                            <td style={{ textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                                                #{movement.movementId}
                                            </td>

                                            {/* Date Time */}
                                            <td style={{ fontSize: '0.9rem' }}>
                                                <div style={{ fontWeight: '500', color: '#2d3748' }}>
                                                    {new Date(movement.movementDate).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.15rem' }}>
                                                    {new Date(movement.movementDate).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>

                                            {/* Movement Type */}
                                            <td>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.4rem 0.75rem',
                                                    borderRadius: '8px',
                                                    background: movement.movementColor ? `${movement.movementColor}15` : '#f0f0f0',
                                                    border: `1.5px solid ${movement.movementColor || '#ddd'}`,
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: movement.movementColor || '#666'
                                                }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{movement.movementIcon || '•'}</span>
                                                    <span>{movement.movementType}</span>
                                                </div>
                                            </td>

                                            {/* Quantity Moved */}
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '0.4rem 0.75rem',
                                                    borderRadius: '8px',
                                                    background: movement.movementType === 'IN' ? '#d4edda' : '#f8d7da',
                                                    color: movement.movementType === 'IN' ? '#155724' : '#721c24',
                                                    fontWeight: '700',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {movement.movementType === 'IN' ? '+' : '-'}{movement.quantityMoved}
                                                </div>
                                            </td>

                                            {/* Stock Quantity Change */}
                                            <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: '600', color: '#4a5568' }}>
                                                        {movement.quantityBefore}
                                                    </span>
                                                    <span style={{ color: '#cbd5e0' }}>→</span>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        color: movement.quantityAfter > movement.quantityBefore ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {movement.quantityAfter}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Movement Reason */}
                                            <td>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '6px',
                                                    background: '#f7fafc',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.85rem',
                                                    color: '#4a5568',
                                                    fontWeight: '500'
                                                }}>
                                                    {movement.movementReason || '-'}
                                                </span>
                                            </td>

                                            {/* Reference */}
                                            <td>
                                                {movement.referenceType && movement.referenceId ? (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        <div style={{ fontWeight: '600', color: '#667eea' }}>
                                                            {movement.referenceType}
                                                        </div>
                                                        <div style={{ color: '#718096', marginTop: '0.15rem' }}>
                                                            #{movement.referenceId}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#cbd5e0' }}>-</span>
                                                )}
                                            </td>

                                            {/* Stock ID */}
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '6px',
                                                    background: '#fef3c7',
                                                    border: '1px solid #fbbf24',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#92400e'
                                                }}>
                                                    #{movement.stockId}
                                                </span>
                                            </td>

                                            {/* Notes */}
                                            <td>
                                                <div style={{
                                                    maxWidth: '200px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '0.9rem',
                                                    color: '#4a5568'
                                                }}>
                                                    {movement.notes || '-'}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td style={{ textAlign: 'center' }}>
                                                {movement.isReversed ? (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        background: '#fee2e2',
                                                        border: '1px solid #ef4444',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        color: '#991b1b'
                                                    }}>
                                                        ✕ Đã hủy
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        background: '#d1fae5',
                                                        border: '1px solid #10b981',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        color: '#065f46'
                                                    }}>
                                                        ✓ Hoạt động
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleViewDetails(movement)}
                                                    title="Xem chi tiết"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '8px',
                                                        border: '2px solid #667eea',
                                                        background: '#f0f4ff',
                                                        color: '#667eea',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = '#667eea';
                                                        e.target.style.color = '#fff';
                                                        e.target.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = '#f0f4ff';
                                                        e.target.style.color = '#667eea';
                                                        e.target.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination" style={{ marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => loadTransactions(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 0}
                                    className="btn-secondary"
                                >
                                    ← Trước
                                </button>

                                <div className="page-numbers">
                                    {[...Array(pagination.totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadTransactions(index)}
                                            className={pagination.currentPage === index ? 'active' : ''}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => loadTransactions(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                                    className="btn-secondary"
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Movement Details Modal */}
            {showDetailsModal && selectedTransaction && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        {/* Modal Header */}
                        <div className="modal-header" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            padding: '1.5rem 2rem',
                            borderRadius: '12px 12px 0 0',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FiPackage size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                            Chi tiết biến động #{selectedTransaction.movementId}
                                        </h3>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                                            {selectedTransaction.summary || 'Thông tin chi tiết về biến động kho'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        color: '#fff',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="modal-body" style={{ padding: '2rem' }}>
                            {loadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <FiRefreshCw className="spinning" size={40} style={{ color: '#667eea' }} />
                                    <p style={{ marginTop: '1rem', color: '#718096', fontSize: '1rem' }}>Đang tải chi tiết...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Status Badge */}
                                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {selectedTransaction.isReversed ? (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: '12px',
                                                background: '#fee2e2',
                                                border: '2px solid #ef4444',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#991b1b'
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>✕</span>
                                                Biến động đã bị hủy
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: '12px',
                                                background: '#d1fae5',
                                                border: '2px solid #10b981',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#065f46'
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>✓</span>
                                                Biến động đang hoạt động
                                            </div>
                                        )}
                                        {selectedTransaction.canBeReversed && !selectedTransaction.isReversed && (
                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                background: '#fef3c7',
                                                border: '1px solid #fbbf24',
                                                fontSize: '0.85rem',
                                                color: '#92400e'
                                            }}>
                                                Có thể hủy
                                            </div>
                                        )}
                                    </div>

                                    {/* Movement Type & Quantity Section */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '1.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        {/* Movement Type Card */}
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            background: selectedTransaction.movementColor ? `${selectedTransaction.movementColor}10` : '#f7fafc',
                                            border: `2px solid ${selectedTransaction.movementColor || '#e2e8f0'}`,
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                                {selectedTransaction.movementIcon || '📦'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                                                Loại biến động
                                            </div>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: selectedTransaction.movementColor || '#2d3748'
                                            }}>
                                                {selectedTransaction.movementTypeDisplay || selectedTransaction.movementType}
                                            </div>
                                        </div>

                                        {/* Quantity Moved Card */}
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            background: selectedTransaction.movementType === 'IN' ? '#d4edda' : '#f8d7da',
                                            border: `2px solid ${selectedTransaction.movementType === 'IN' ? '#28a745' : '#dc3545'}`,
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                fontSize: '2.5rem',
                                                fontWeight: '700',
                                                color: selectedTransaction.movementType === 'IN' ? '#155724' : '#721c24',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {selectedTransaction.movementType === 'IN' ? '+' : '-'}{selectedTransaction.quantityMoved}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                                                Số lượng biến động
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                                                {selectedTransaction.movementReason || 'N/A'}
                                            </div>
                                        </div>

                                        {/* Stock Change Card */}
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                                            border: '2px solid #667eea',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.75rem' }}>
                                                Thay đổi tồn kho
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.75rem',
                                                fontSize: '1.5rem',
                                                fontWeight: '700'
                                            }}>
                                                <span style={{ color: '#4a5568' }}>{selectedTransaction.quantityBefore}</span>
                                                <span style={{ color: '#cbd5e0', fontSize: '1.2rem' }}>→</span>
                                                <span style={{
                                                    color: selectedTransaction.quantityAfter > selectedTransaction.quantityBefore ? '#10b981' : '#ef4444'
                                                }}>
                                                    {selectedTransaction.quantityAfter}
                                                </span>
                                            </div>
                                            <div style={{
                                                marginTop: '0.75rem',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                color: selectedTransaction.quantityAfter > selectedTransaction.quantityBefore ? '#10b981' : '#ef4444'
                                            }}>
                                                {selectedTransaction.quantityAfter > selectedTransaction.quantityBefore ? '↑' : '↓'}
                                                {' '}
                                                {Math.abs(selectedTransaction.quantityAfter - selectedTransaction.quantityBefore)} đơn vị
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Information Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '1.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        {/* Basic Info Section */}
                                        <div style={{
                                            padding: '1.5rem',
                                            background: '#f7fafc',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem 0',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#2d3748',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <FiCalendar size={18} style={{ color: '#667eea' }} />
                                                Thông tin cơ bản
                                            </h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                        Movement ID
                                                    </div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#667eea' }}>
                                                        #{selectedTransaction.movementId}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                        Stock ID
                                                    </div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b' }}>
                                                        #{selectedTransaction.stockId}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                        Ngày giờ biến động
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>
                                                        {new Date(selectedTransaction.movementDate).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                        Ngày tạo
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                                                        {new Date(selectedTransaction.createdAt).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>

                                                {selectedTransaction.updatedAt && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Cập nhật lần cuối
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                                                            {new Date(selectedTransaction.updatedAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reference & Item Info Section */}
                                        <div style={{
                                            padding: '1.5rem',
                                            background: '#f7fafc',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem 0',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#2d3748',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <FiPackage size={18} style={{ color: '#8b5cf6' }} />
                                                Thông tin tham chiếu & Item
                                            </h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {/* Reference Type & ID */}
                                                {selectedTransaction.referenceType && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Loại tham chiếu
                                                        </div>
                                                        <div style={{
                                                            display: 'inline-block',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            background: '#e0e7ff',
                                                            border: '1px solid #667eea',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            color: '#4338ca'
                                                        }}>
                                                            {selectedTransaction.referenceType}
                                                            {selectedTransaction.referenceId && ` #${selectedTransaction.referenceId}`}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Item Name */}
                                                {selectedTransaction.itemName && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Tên item
                                                        </div>
                                                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                                            {selectedTransaction.itemName}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Item Type */}
                                                {selectedTransaction.itemType && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Loại item
                                                        </div>
                                                        <div style={{
                                                            display: 'inline-block',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '6px',
                                                            background: '#fef3c7',
                                                            border: '1px solid #fbbf24',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            color: '#92400e'
                                                        }}>
                                                            {selectedTransaction.itemType}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Batch Number */}
                                                {selectedTransaction.batchNumber && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Số lô
                                                        </div>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>
                                                            {selectedTransaction.batchNumber}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Expiry Date */}
                                                {selectedTransaction.expiryDate && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Hạn sử dụng
                                                        </div>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>
                                                            {new Date(selectedTransaction.expiryDate).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Information */}
                                    {(selectedTransaction.unitCost || selectedTransaction.totalCost) && (
                                        <div style={{
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, #d1fae515 0%, #10b98115 100%)',
                                            borderRadius: '12px',
                                            border: '2px solid #10b981',
                                            marginBottom: '2rem'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem 0',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#065f46',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                💰 Thông tin chi phí
                                            </h4>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                                {selectedTransaction.unitCost && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#065f46', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Đơn giá
                                                        </div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#047857' }}>
                                                            {selectedTransaction.unitCost.toLocaleString('vi-VN')} ₫
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedTransaction.totalCost && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#065f46', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Tổng chi phí
                                                        </div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#047857' }}>
                                                            {selectedTransaction.totalCost.toLocaleString('vi-VN')} ₫
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cabinet Information */}
                                    {(selectedTransaction.sourceCabinetName || selectedTransaction.destinationCabinetName) && (
                                        <div style={{
                                            padding: '1.5rem',
                                            background: '#fef3c7',
                                            borderRadius: '12px',
                                            border: '2px solid #fbbf24',
                                            marginBottom: '2rem'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem 0',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#92400e',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <FiArchive size={18} />
                                                Thông tin tủ thuốc
                                            </h4>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                                {selectedTransaction.sourceCabinetName && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Tủ nguồn
                                                        </div>
                                                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#78350f' }}>
                                                            {selectedTransaction.sourceCabinetName}
                                                            {selectedTransaction.sourceCabinetId && (
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '500', marginLeft: '0.5rem' }}>
                                                                    (ID: {selectedTransaction.sourceCabinetId})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedTransaction.destinationCabinetName && (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '0.25rem', fontWeight: '600' }}>
                                                            Tủ đích
                                                        </div>
                                                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#78350f' }}>
                                                            {selectedTransaction.destinationCabinetName}
                                                            {selectedTransaction.destinationCabinetId && (
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '500', marginLeft: '0.5rem' }}>
                                                                    (ID: {selectedTransaction.destinationCabinetId})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* People Information */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '1.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        {/* Employee Info */}
                                        {(selectedTransaction.employeeId || selectedTransaction.employeeName) && (
                                            <div style={{
                                                padding: '1.5rem',
                                                background: '#e0e7ff',
                                                borderRadius: '12px',
                                                border: '2px solid #667eea'
                                            }}>
                                                <h4 style={{
                                                    margin: '0 0 1rem 0',
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    color: '#4338ca',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    👤 Nhân viên thực hiện
                                                </h4>

                                                <div>
                                                    {selectedTransaction.employeeName && (
                                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3730a3', marginBottom: '0.5rem' }}>
                                                            {selectedTransaction.employeeName}
                                                        </div>
                                                    )}
                                                    {selectedTransaction.employeeId && (
                                                        <div style={{ fontSize: '0.9rem', color: '#4338ca' }}>
                                                            ID: {selectedTransaction.employeeId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Patient Info */}
                                        {(selectedTransaction.patientId || selectedTransaction.patientName) && (
                                            <div style={{
                                                padding: '1.5rem',
                                                background: '#fce7f3',
                                                borderRadius: '12px',
                                                border: '2px solid #ec4899'
                                            }}>
                                                <h4 style={{
                                                    margin: '0 0 1rem 0',
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    color: '#9f1239',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    🏥 Thông tin bệnh nhân
                                                </h4>

                                                <div>
                                                    {selectedTransaction.patientName && (
                                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#831843', marginBottom: '0.5rem' }}>
                                                            {selectedTransaction.patientName}
                                                        </div>
                                                    )}
                                                    {selectedTransaction.patientId && (
                                                        <div style={{ fontSize: '0.9rem', color: '#9f1239' }}>
                                                            ID: {selectedTransaction.patientId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    {selectedTransaction.notes && (
                                        <div style={{
                                            padding: '1.5rem',
                                            background: '#f0f9ff',
                                            borderRadius: '12px',
                                            border: '2px solid #0ea5e9',
                                            marginBottom: '2rem'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem 0',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#075985',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                📝 Ghi chú
                                            </h4>
                                            <div style={{
                                                fontSize: '0.95rem',
                                                color: '#0c4a6e',
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {selectedTransaction.notes}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reversal Information */}
                                    {selectedTransaction.reversedByMovementId && (
                                        <div style={{
                                            padding: '1.5rem',
                                            background: '#fee2e2',
                                            borderRadius: '12px',
                                            border: '2px solid #ef4444',
                                            marginBottom: '2rem'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 0.5rem 0',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#991b1b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                ⚠️ Thông tin hủy bỏ
                                            </h4>
                                            <div style={{ fontSize: '0.95rem', color: '#7f1d1d' }}>
                                                Biến động này đã bị hủy bởi Movement #{selectedTransaction.reversedByMovementId}
                                            </div>
                                        </div>
                                    )}

                                    {/* Items Table - Keep if exists */}
                                    {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                                        <div>
                                            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                                                Danh sách items ({selectedTransaction.items.length})
                                            </h4>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="cabinet-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '50px' }}>STT</th>
                                                            <th>Tên item</th>
                                                            <th style={{ width: '100px' }}>Loại</th>
                                                            <th style={{ width: '100px', textAlign: 'right' }}>Số lượng</th>
                                                            <th style={{ width: '120px' }}>Số lô</th>
                                                            <th style={{ width: '120px' }}>Hạn SD</th>
                                                            <th>Ghi chú</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedTransaction.items.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td style={{ fontWeight: '500' }}>
                                                                    {item.itemName || item.medicineName || '-'}
                                                                </td>
                                                                <td>
                                                                    <span style={{
                                                                        padding: '0.25rem 0.5rem',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.8rem',
                                                                        background: '#e7f3ff',
                                                                        color: '#007bff'
                                                                    }}>
                                                                        {item.itemType}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                                    {item.quantity}
                                                                </td>
                                                                <td>{item.batchNumber || '-'}</td>
                                                                <td>
                                                                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '-'}
                                                                </td>
                                                                <td>{item.notes || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            {selectedTransaction && selectedTransaction.stockId && (
                                <button
                                    className="btn-primary"
                                    onClick={() => handleViewStockHistory(selectedTransaction.stockId)}
                                    style={{
                                        background: '#17a2b8',
                                        color: '#fff',
                                        marginRight: 'auto'
                                    }}
                                >
                                    <FiClock style={{ marginRight: '0.5rem' }} />
                                    Xem lịch sử Stock
                                </button>
                            )}
                            <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Movement Modal */}
            {showRecordModal && (
                <div className="modal-overlay" onClick={handleCloseRecordModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Ghi nhận biến động kho</h3>
                            <button className="btn-icon" onClick={handleCloseRecordModal}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            <form style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {/* Stock Item */}
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>
                                        Stock Item <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <select
                                        value={movementForm.stockId}
                                        onChange={(e) => handleFormChange('stockId', e.target.value)}
                                        disabled={loadingStockItems}
                                    >
                                        <option value="">-- Chọn stock item --</option>
                                        {stockItems.map(item => (
                                            <option key={item.stockId} value={item.stockId}>
                                                {item.itemName} ({item.itemType}) - Tồn: {item.currentQuantity || 0}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Movement Type */}
                                <div className="form-group">
                                    <label>
                                        Loại biến động <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <select
                                        value={movementForm.movementType}
                                        onChange={(e) => handleFormChange('movementType', e.target.value)}
                                    >
                                        <option value="IN">IN - Nhập kho</option>
                                        <option value="OUT">OUT - Xuất kho</option>
                                        <option value="TRANSFER">TRANSFER - Điều chuyển</option>
                                        <option value="ADJUSTMENT">ADJUSTMENT - Điều chỉnh</option>
                                        <option value="RETURN">RETURN - Trả lại</option>
                                    </select>
                                </div>

                                {/* Reference Type */}
                                <div className="form-group">
                                    <label>
                                        Loại tham chiếu <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <select
                                        value={movementForm.referenceType}
                                        onChange={(e) => handleFormChange('referenceType', e.target.value)}
                                    >
                                        <option value="MANUAL">MANUAL - Thủ công</option>
                                        <option value="PRESCRIPTION">PRESCRIPTION - Đơn thuốc</option>
                                        <option value="PURCHASE_ORDER">PURCHASE_ORDER - Đơn đặt hàng</option>
                                        <option value="TRANSFER_ORDER">TRANSFER_ORDER - Lệnh điều chuyển</option>
                                        <option value="INVENTORY_CHECK">INVENTORY_CHECK - Kiểm kê</option>
                                    </select>
                                </div>

                                {/* Movement Reason */}
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>
                                        Lý do biến động <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={movementForm.movementReason}
                                        onChange={(e) => handleFormChange('movementReason', e.target.value)}
                                        placeholder="Ví dụ: Kiểm kê định kỳ - điều chỉnh số lượng"
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="form-group">
                                    <label>
                                        Số lượng <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={movementForm.quantity}
                                        onChange={(e) => handleFormChange('quantity', e.target.value)}
                                    />
                                </div>

                                {/* Unit Cost */}
                                <div className="form-group">
                                    <label>Đơn giá (VNĐ)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={movementForm.unitCost}
                                        onChange={(e) => handleFormChange('unitCost', e.target.value)}
                                        placeholder="300.00"
                                    />
                                </div>

                                {/* Batch Number */}
                                <div className="form-group">
                                    <label>
                                        Số lô <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={movementForm.batchNumber}
                                        onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                                        placeholder="BATCH-2025-001"
                                    />
                                </div>

                                {/* Expiry Date */}
                                <div className="form-group">
                                    <label>Hạn sử dụng</label>
                                    <input
                                        type="date"
                                        value={movementForm.expiryDate}
                                        onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                                    />
                                </div>

                                {/* Notes */}
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Ghi chú</label>
                                    <textarea
                                        value={movementForm.notes}
                                        onChange={(e) => handleFormChange('notes', e.target.value)}
                                        placeholder="Nhập ghi chú bổ sung (tùy chọn)"
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={handleCloseRecordModal}
                                disabled={submittingMovement}
                            >
                                Đóng
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSubmitMovement}
                                disabled={submittingMovement}
                                style={{
                                    background: submittingMovement ? '#6c757d' : '#007bff',
                                    cursor: submittingMovement ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FiSave style={{ marginRight: '0.5rem' }} />
                                {submittingMovement ? 'Đang xử lý...' : 'Ghi nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock History Modal */}
            {showStockHistoryModal && (
                <div className="modal-overlay" onClick={handleCloseStockHistoryModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h3>
                                <FiClock style={{ marginRight: '0.5rem' }} />
                                Lịch sử biến động Stock (ID: {selectedStockId})
                            </h3>
                            <button className="btn-icon" onClick={handleCloseStockHistoryModal}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingStockHistory ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{
                                        border: '3px solid #f3f3f3',
                                        borderTop: '3px solid #007bff',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 1rem'
                                    }}></div>
                                    <p style={{ color: '#6c757d' }}>Đang tải lịch sử biến động...</p>
                                </div>
                            ) : stockHistory.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    color: '#6c757d'
                                }}>
                                    <FiPackage size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                                        Không có lịch sử biến động
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        background: '#e7f3ff',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '0.25rem' }}>
                                                Tổng số biến động
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#007bff' }}>
                                                {stockHistory.length}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '0.25rem' }}>
                                                Stock ID
                                            </div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#495057' }}>
                                                {selectedStockId}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                                        <table className="cabinet-table">
                                            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                                                <tr>
                                                    <th style={{ width: '50px' }}>STT</th>
                                                    <th style={{ width: '80px' }}>ID</th>
                                                    <th style={{ width: '130px' }}>Loại</th>
                                                    <th style={{ width: '150px', textAlign: 'center' }}>Số lượng</th>
                                                    <th style={{ width: '120px' }}>Lý do</th>
                                                    <th style={{ width: '150px' }}>Thời gian</th>
                                                    <th>Ghi chú</th>
                                                    <th style={{ width: '100px', textAlign: 'center' }}>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockHistory.map((movement, index) => (
                                                    <tr key={movement.movementId || index}>
                                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                                        <td style={{ fontWeight: '600', color: '#007bff' }}>
                                                            #{movement.movementId}
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                background: movement.movementType === 'IN' ? '#d4edda' : '#f8d7da',
                                                                color: movement.movementColor || (movement.movementType === 'IN' ? '#155724' : '#721c24')
                                                            }}>
                                                                {movement.movementIcon || (movement.movementType === 'IN' ? '↓' : '↑')}
                                                                {movement.movementTypeDisplay || (movement.movementType === 'IN' ? 'Nhập kho' : 'Xuất kho')}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                <span style={{
                                                                    fontWeight: '700',
                                                                    fontSize: '1rem',
                                                                    color: movement.movementType === 'IN' ? '#28a745' : '#dc3545'
                                                                }}>
                                                                    {movement.movementType === 'IN' ? '+' : '-'}{movement.quantityMoved || movement.quantity || 0}
                                                                </span>
                                                                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                                                    {movement.quantityBefore} → {movement.quantityAfter}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                padding: '0.2rem 0.4rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.8rem',
                                                                background: '#e9ecef',
                                                                color: '#495057'
                                                            }}>
                                                                {movement.movementReason || movement.reason || '-'}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem' }}>
                                                            {formatDateTime(movement.movementDate || movement.transactionDate)}
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem', color: '#6c757d', maxWidth: '200px' }}>
                                                            {movement.notes || movement.summary || '-'}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {movement.isReversed ? (
                                                                <span style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.8rem',
                                                                    background: '#f8d7da',
                                                                    color: '#721c24',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    ❌ Đã hủy
                                                                </span>
                                                            ) : movement.canBeReversed ? (
                                                                <span style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.8rem',
                                                                    background: '#d4edda',
                                                                    color: '#155724',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    ✅ Hoạt động
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.8rem',
                                                                    background: '#e9ecef',
                                                                    color: '#6c757d',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    🔒 Đã khóa
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCloseStockHistoryModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryTransactionsPage;

