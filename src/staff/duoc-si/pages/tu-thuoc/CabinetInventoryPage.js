import React, { useState, useEffect } from 'react';
import './CabinetManagementPage.css';
import { FiRefreshCw, FiSearch, FiPackage, FiAlertCircle, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { pharmacistCabinetAPI, pharmacistPatientAPI, medicineAPI } from '../../../../services/staff/pharmacistAPI';

const CabinetInventoryPage = () => {
    // State quản lý
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [error, setError] = useState(null);

    // State cho modal cấp phát
    const [showDispenseModal, setShowDispenseModal] = useState(false);
    const [dispenseFormData, setDispenseFormData] = useState({
        cabinetId: '',
        patientId: '',
        encounterId: '',
        operationType: 'DISPENSE',
        items: [],
        reason: '',
        notes: '',
        isEmergency: false
    });

    // State cho tìm kiếm bệnh nhân
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchingPatient, setSearchingPatient] = useState(false);

    // State cho items được chọn để cấp phát
    const [selectedItems, setSelectedItems] = useState([]);

    // State cho modal bổ sung tồn kho
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockItems, setRestockItems] = useState([]);
    const [restockNotes, setRestockNotes] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [loadingMedicines, setLoadingMedicines] = useState(false);

    // Load danh sách tủ khi component mount
    useEffect(() => {
        loadCabinets();
    }, []);

    // Load danh sách tủ
    const loadCabinets = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await pharmacistCabinetAPI.getAllCabinets(0, 100);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const data = response.data;
                const cabinetList = data.content || data || [];
                
                // Chỉ lấy tủ đang hoạt động và không bị khóa
                const activeCabinets = cabinetList.filter(cab => cab.isActive && !cab.isLocked);
                setCabinets(activeCabinets);
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

    // Load tồn kho của tủ
    const loadCabinetInventory = async (cabinetId) => {
        try {
            setLoadingInventory(true);
            setError(null);

            const response = await pharmacistCabinetAPI.getCabinetInventory(cabinetId);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const items = response.data || [];
                setInventoryItems(items);
            } else {
                throw new Error('Không thể tải tồn kho tủ');
            }
        } catch (err) {
            console.error('Error loading cabinet inventory:', err);
            setError(getErrorMessage(err));
            setInventoryItems([]);
        } finally {
            setLoadingInventory(false);
        }
    };

    // Xử lý chọn tủ
    const handleSelectCabinet = (cabinet) => {
        setSelectedCabinet(cabinet);
        loadCabinetInventory(cabinet.cabinetId);
    };

    // Tìm kiếm bệnh nhân
    const handleSearchPatient = async (searchTerm) => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setPatientSearchResults([]);
            return;
        }

        try {
            setSearchingPatient(true);
            const response = await pharmacistPatientAPI.searchPatient(searchTerm);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                const patients = response.data || [];
                setPatientSearchResults(patients);
            } else {
                setPatientSearchResults([]);
            }
        } catch (err) {
            console.error('Error searching patient:', err);
            setPatientSearchResults([]);
        } finally {
            setSearchingPatient(false);
        }
    };

    // Chọn bệnh nhân
    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setDispenseFormData(prev => ({
            ...prev,
            patientId: patient.patientId || patient.id
        }));
        setPatientSearchResults([]);
        setPatientSearchTerm(patient.fullName || patient.name || '');
    };

    // Mở modal cấp phát
    const handleOpenDispenseModal = () => {
        if (!selectedCabinet) {
            alert('⚠️ Vui lòng chọn tủ thuốc trước!');
            return;
        }

        if (selectedCabinet.isLocked) {
            alert('⚠️ Tủ đang bị khóa. Không thể cấp phát!');
            return;
        }

        setDispenseFormData({
            cabinetId: selectedCabinet.cabinetId,
            patientId: '',
            encounterId: '',
            operationType: 'DISPENSE',
            items: [],
            reason: '',
            notes: '',
            isEmergency: false
        });
        setSelectedPatient(null);
        setPatientSearchTerm('');
        setSelectedItems([]);
        setShowDispenseModal(true);
    };

    // --- ĐÃ CHỈNH SỬA: Xử lý mapping dữ liệu từ snake_case sang camelCase ---
    const handleAddItem = (inventoryItem) => {
        // Kiểm tra item đã tồn tại trong danh sách chọn chưa (dùng key snake_case từ input)
        const existingItem = selectedItems.find(item =>
            item.itemId === inventoryItem.item_id &&
            item.batchNumber === inventoryItem.batch_number
        );

        if (existingItem) {
            alert('⚠️ Item này đã được thêm vào danh sách!');
            return;
        }

        // Tạo object mới mapping từ snake_case (API) sang camelCase (State form)
        const newItem = {
            itemType: inventoryItem.item_type || 'MEDICINE',
            itemId: inventoryItem.item_id,
            itemName: inventoryItem.item_name,
            quantity: 1,
            availableQuantity: inventoryItem.quantity,
            batchNumber: inventoryItem.batch_number || '',
            notes: ''
        };

        setSelectedItems([...selectedItems, newItem]);
    };

    // Xóa item khỏi danh sách cấp phát
    const handleRemoveItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    // Cập nhật số lượng item
    const handleUpdateItemQuantity = (index, quantity) => {
        const updatedItems = [...selectedItems];
        const item = updatedItems[index];

        if (quantity > item.availableQuantity) {
            alert(`⚠️ Số lượng không được vượt quá ${item.availableQuantity}!`);
            return;
        }

        if (quantity < 1) {
            alert('⚠️ Số lượng phải lớn hơn 0!');
            return;
        }

        updatedItems[index].quantity = quantity;
        setSelectedItems(updatedItems);
    };

    // Cập nhật ghi chú item
    const handleUpdateItemNotes = (index, notes) => {
        const updatedItems = [...selectedItems];
        updatedItems[index].notes = notes;
        setSelectedItems(updatedItems);
    };

    // Xử lý cấp phát
    const handleDispense = async () => {
        // Validation
        if (!selectedPatient || !dispenseFormData.patientId) {
            alert('⚠️ Vui lòng chọn bệnh nhân!');
            return;
        }

        if (!dispenseFormData.encounterId || dispenseFormData.encounterId.trim() === '') {
            alert('⚠️ Vui lòng nhập Encounter ID!');
            return;
        }

        if (selectedItems.length === 0) {
            alert('⚠️ Vui lòng chọn ít nhất một item để cấp phát!');
            return;
        }

        if (!dispenseFormData.reason || dispenseFormData.reason.trim() === '') {
            alert('⚠️ Vui lòng nhập lý do cấp phát!');
            return;
        }

        // Prepare items for API
        const items = selectedItems.map(item => ({
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            notes: item.notes
        }));

        const dispenseData = {
            cabinetId: dispenseFormData.cabinetId,
            patientId: dispenseFormData.patientId,
            encounterId: parseInt(dispenseFormData.encounterId),
            operationType: 'DISPENSE',
            items: items,
            reason: dispenseFormData.reason,
            notes: dispenseFormData.notes,
            isEmergency: dispenseFormData.isEmergency
        };

        try {
            setLoading(true);
            const response = await pharmacistCabinetAPI.dispenseFromCabinet(dispenseData);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Cấp phát thành công!');
                setShowDispenseModal(false);

                // Reload inventory
                if (selectedCabinet) {
                    loadCabinetInventory(selectedCabinet.cabinetId);
                }
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra khi cấp phát');
            }
        } catch (err) {
            console.error('Error dispensing:', err);
            alert('❌ Lỗi khi cấp phát: ' + getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // ==================== RESTOCK HANDLERS ====================

    // Load danh sách medicines
    const loadMedicines = async () => {
        try {
            setLoadingMedicines(true);
            // API: GET /api/v1/medicines?page=0&size=1000&sort=medicineName,asc
            const response = await medicineAPI.getMedicines('', 0, 1000);
            console.log('Medicines API Response:', response);

            // Response format: { message, status, data: { content: [...], totalPages, ... }, code }
            if (response?.status === 'OK' && response?.data?.content) {
                setMedicines(response.data.content);
            } else if (response?.data && Array.isArray(response.data)) {
                // Trường hợp data là array trực tiếp
                setMedicines(response.data);
            } else if (response?.content) {
                // Fallback cho format cũ
                setMedicines(response.content);
            } else {
                console.warn('Unexpected response structure:', response);
                setMedicines([]);
            }
        } catch (err) {
            console.error('Error loading medicines:', err);
            alert('❌ ' + getErrorMessage(err));
            setMedicines([]);
        } finally {
            setLoadingMedicines(false);
        }
    };

    // Mở modal bổ sung tồn kho
    const handleOpenRestockModal = () => {
        if (!selectedCabinet) {
            alert('⚠️ Vui lòng chọn tủ thuốc trước!');
            return;
        }

        if (selectedCabinet.isLocked) {
            alert('⚠️ Tủ đang bị khóa. Không thể bổ sung tồn kho!');
            return;
        }

        setRestockItems([]);
        setRestockNotes('');
        setShowRestockModal(true);
        loadMedicines();
    };

    // Thêm item vào danh sách restock
    const handleAddRestockItem = () => {
        const newItem = {
            itemType: 'MEDICINE',
            itemId: '',
            itemName: '',
            quantity: 1,
            batchNumber: '',
            expiryDate: '',
            unitPrice: 0
        };
        setRestockItems([...restockItems, newItem]);
    };

    // Xóa item khỏi danh sách restock
    const handleRemoveRestockItem = (index) => {
        const updatedItems = restockItems.filter((_, i) => i !== index);
        setRestockItems(updatedItems);
    };

    // Cập nhật thông tin restock item
    const handleUpdateRestockItem = (index, field, value) => {
        const updatedItems = [...restockItems];
        updatedItems[index][field] = value;

        // Nếu thay đổi itemId, cập nhật itemName
        if (field === 'itemId') {
            const selectedMedicine = medicines.find(m => m.medicineId === parseInt(value));
            if (selectedMedicine) {
                updatedItems[index].itemName = selectedMedicine.medicineName;
            }
        }

        setRestockItems(updatedItems);
    };

    // Xử lý bổ sung tồn kho
    const handleRestock = async () => {
        // Validation
        if (restockItems.length === 0) {
            alert('⚠️ Vui lòng thêm ít nhất một item để bổ sung!');
            return;
        }

        // Validate từng item
        for (let i = 0; i < restockItems.length; i++) {
            const item = restockItems[i];

            if (!item.itemId || item.itemId === '') {
                alert(`⚠️ Vui lòng chọn thuốc cho item ${i + 1}!`);
                return;
            }

            if (!item.quantity || item.quantity < 1) {
                alert(`⚠️ Số lượng phải lớn hơn 0 cho item ${i + 1}!`);
                return;
            }

            if (!item.batchNumber || item.batchNumber.trim() === '') {
                alert(`⚠️ Vui lòng nhập số lô cho item ${i + 1}!`);
                return;
            }

            if (!item.expiryDate || item.expiryDate === '') {
                alert(`⚠️ Vui lòng chọn hạn sử dụng cho item ${i + 1}!`);
                return;
            }

            // Validate expiry date is in the future
            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiryDate <= today) {
                alert(`⚠️ Hạn sử dụng phải là ngày trong tương lai cho item ${i + 1}!`);
                return;
            }

            if (!item.unitPrice || item.unitPrice < 0) {
                alert(`⚠️ Đơn giá phải lớn hơn hoặc bằng 0 cho item ${i + 1}!`);
                return;
            }
        }

        // Prepare data for API - sử dụng snake_case theo format backend
        const items = restockItems.map(item => ({
            item_type: item.itemType,
            item_id: parseInt(item.itemId),
            quantity: parseInt(item.quantity),
            batch_number: item.batchNumber,
            expiry_date: item.expiryDate,
            unit_price: parseFloat(item.unitPrice) || 0
        }));

        // API expects array of items directly, not wrapped in object
        const restockData = items;

        console.log('=== RESTOCK DEBUG ===');
        console.log('Cabinet ID:', selectedCabinet.cabinetId);
        console.log('Restock Data (snake_case):', restockData);
        console.log('Items:', items);

        try {
            setLoading(true);
            const response = await pharmacistCabinetAPI.restockCabinet(selectedCabinet.cabinetId, restockData);

            console.log('Restock Response:', response);

            if (response && (response.status === 'success' || response.code === 200 || response.OK)) {
                alert('✅ Bổ sung tồn kho thành công!');
                setShowRestockModal(false);

                // Reload inventory
                if (selectedCabinet) {
                    loadCabinetInventory(selectedCabinet.cabinetId);
                }
            } else {
                console.error('Unexpected response:', response);
                throw new Error(response.message || 'Có lỗi xảy ra khi bổ sung tồn kho');
            }
        } catch (err) {
            console.error('Error restocking:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });
            alert('❌ Lỗi khi bổ sung tồn kho: ' + getErrorMessage(err));
        } finally {
            setLoading(false);
        }
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

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="cabinet-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>📦 Tồn kho Tủ thuốc</h2>
                    <p>Quản lý tồn kho và cấp phát từ tủ thuốc</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={loadCabinets} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                    {selectedCabinet && (
                        <>
                            <button
                                className="btn-secondary"
                                onClick={handleOpenRestockModal}
                                style={{ background: '#17a2b8', color: '#fff' }}
                            >
                                <FiPackage />
                                Bổ sung tồn kho
                            </button>
                            <button className="btn-primary" onClick={handleOpenDispenseModal}>
                                <FiPlus />
                                Cấp phát
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                {/* Left Panel - Cabinet List */}
                <div style={{ flex: '0 0 350px' }}>
                    <div className="cabinet-list-panel" style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        maxHeight: '700px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            Danh sách tủ thuốc
                        </h3>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>⏳ Đang tải...</p>
                            </div>
                        ) : error ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
                                <p>❌ {error}</p>
                            </div>
                        ) : cabinets.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {cabinets.map(cabinet => (
                                    <div
                                        key={cabinet.cabinetId}
                                        onClick={() => handleSelectCabinet(cabinet)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: selectedCabinet?.cabinetId === cabinet.cabinetId
                                                ? '2px solid #007bff'
                                                : '1px solid #dee2e6',
                                            background: selectedCabinet?.cabinetId === cabinet.cabinetId
                                                ? '#e7f3ff'
                                                : '#f8f9fa',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {cabinet.cabinetLocation}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                            {cabinet.departmentName || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#28a745', marginTop: '0.25rem' }}>
                                            ✓ Đang hoạt động
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>📦 Không có tủ nào</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Inventory Items */}
                <div style={{ flex: 1 }}>
                    {selectedCabinet ? (
                        <div className="inventory-panel" style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {selectedCabinet.cabinetLocation}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0 }}>
                                        {selectedCabinet.departmentName || 'N/A'}
                                    </p>
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={handleOpenDispenseModal}
                                    disabled={selectedCabinet.isLocked}
                                >
                                    <FiPlus />
                                    Cấp phát
                                </button>
                            </div>

                            {loadingInventory ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <p>⏳ Đang tải tồn kho...</p>
                                </div>
                            ) : inventoryItems.length > 0 ? (
                                <div className="cabinet-table-container">
                                    {/* --- ĐÃ CHỈNH SỬA: Bảng hiển thị dùng key snake_case --- */}
                                    <table className="cabinet-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Tên thuốc/Vật tư</th>
                                                <th>Loại</th>
                                                <th>Số lô</th>
                                                <th>Số lượng</th>
                                                <th>Hạn sử dụng</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inventoryItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td><strong>{item.item_name}</strong></td>
                                                    <td>
                                                        <span className={`badge badge-type-${(item.item_type || 'MEDICINE').toLowerCase()}`}>
                                                            {item.item_type || 'MEDICINE'}
                                                        </span>
                                                    </td>
                                                    <td>{item.batch_number || 'N/A'}</td>
                                                    <td>
                                                        <span style={{
                                                            color: item.quantity < 10 ? '#dc3545' : '#28a745',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {item.quantity || 0}
                                                        </span>
                                                    </td>
                                                    <td>{formatDateTime(item.expiry_date)}</td>
                                                    <td>
                                                        <button
                                                            className="btn-icon btn-view"
                                                            onClick={() => handleAddItem(item)}
                                                            title="Thêm vào danh sách cấp phát"
                                                            disabled={item.quantity === 0}
                                                        >
                                                            <FiPlus />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <FiPackage size={48} color="#dee2e6" />
                                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>
                                        Tủ này chưa có tồn kho
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '3rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            textAlign: 'center'
                        }}>
                            <FiPackage size={64} color="#dee2e6" />
                            <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#6c757d' }}>
                                Vui lòng chọn tủ thuốc để xem tồn kho
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dispense Modal */}
            {showDispenseModal && (
                <div className="modal-overlay" onClick={() => setShowDispenseModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h3>💊 Cấp phát từ tủ thuốc</h3>
                            <button className="btn-close" onClick={() => setShowDispenseModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Cabinet Info */}
                            <div style={{
                                background: '#e7f3ff',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                border: '1px solid #b3d9ff'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                    Tủ: {selectedCabinet?.cabinetLocation}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                                    Khoa: {selectedCabinet?.departmentName || 'N/A'}
                                </div>
                            </div>

                            {/* Patient Search */}
                            <div className="form-group">
                                <label>Bệnh nhân <span style={{ color: '#dc3545' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm kiếm bệnh nhân (tên, ID, số điện thoại)..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatient(e.target.value);
                                        }}
                                        disabled={selectedPatient !== null}
                                    />
                                    {selectedPatient && (
                                        <button
                                            onClick={() => {
                                                setSelectedPatient(null);
                                                setPatientSearchTerm('');
                                                setDispenseFormData(prev => ({ ...prev, patientId: '' }));
                                            }}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: '#dc3545',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '0.25rem 0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                </div>

                                {/* Patient Search Results */}
                                {patientSearchResults.length > 0 && !selectedPatient && (
                                    <div style={{
                                        position: 'absolute',
                                        zIndex: 1000,
                                        background: '#fff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        marginTop: '0.25rem',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        width: '100%'
                                    }}>
                                        {patientSearchResults.map(patient => (
                                            <div
                                                key={patient.patientId || patient.id}
                                                onClick={() => handleSelectPatient(patient)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f1f3f5',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <div style={{ fontWeight: '600' }}>
                                                    {patient.fullName || patient.name}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                    ID: {patient.patientId || patient.id} |
                                                    SĐT: {patient.phoneNumber || patient.phone || 'N/A'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedPatient && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '0.75rem',
                                        background: '#d4edda',
                                        border: '1px solid #c3e6cb',
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#155724' }}>
                                            ✓ {selectedPatient.fullName || selectedPatient.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#155724' }}>
                                            ID: {selectedPatient.patientId || selectedPatient.id}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Encounter ID */}
                            <div className="form-group">
                                <label>Encounter ID <span style={{ color: '#dc3545' }}>*</span></label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Nhập Encounter ID"
                                    value={dispenseFormData.encounterId}
                                    onChange={(e) => setDispenseFormData(prev => ({
                                        ...prev,
                                        encounterId: e.target.value
                                    }))}
                                />
                            </div>

                            {/* Selected Items */}
                            <div className="form-group">
                                <label>Danh sách thuốc/vật tư cấp phát <span style={{ color: '#dc3545' }}>*</span></label>
                                {selectedItems.length > 0 ? (
                                    <div style={{
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8f9fa' }}>
                                                <tr>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Tên</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Số lô</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Số lượng</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Ghi chú</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Xóa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItems.map((item, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <strong>{item.itemName}</strong>
                                                        </td>
                                                        <td style={{ padding: '0.75rem' }}>{item.batchNumber}</td>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={item.availableQuantity}
                                                                value={item.quantity}
                                                                onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value))}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '0.25rem 0.5rem',
                                                                    border: '1px solid #dee2e6',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#6c757d' }}>
                                                                / {item.availableQuantity}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Ghi chú..."
                                                                value={item.notes}
                                                                onChange={(e) => handleUpdateItemNotes(index, e.target.value)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.25rem 0.5rem',
                                                                    border: '1px solid #dee2e6',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => handleRemoveItem(index)}
                                                                style={{
                                                                    background: '#dc3545',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    padding: '0.25rem 0.5rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px dashed #dee2e6'
                                    }}>
                                        <FiAlertCircle size={32} color="#6c757d" />
                                        <p style={{ marginTop: '0.5rem', color: '#6c757d' }}>
                                            Chưa có item nào. Vui lòng chọn từ danh sách tồn kho.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Reason */}
                            <div className="form-group">
                                <label>Lý do cấp phát <span style={{ color: '#dc3545' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ví dụ: Theo đơn thuốc, Cấp cứu..."
                                    value={dispenseFormData.reason}
                                    onChange={(e) => setDispenseFormData(prev => ({
                                        ...prev,
                                        reason: e.target.value
                                    }))}
                                />
                            </div>

                            {/* Notes */}
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Ghi chú thêm (nếu có)..."
                                    value={dispenseFormData.notes}
                                    onChange={(e) => setDispenseFormData(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                    }))}
                                />
                            </div>

                            {/* Emergency Checkbox */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={dispenseFormData.isEmergency}
                                        onChange={(e) => setDispenseFormData(prev => ({
                                            ...prev,
                                            isEmergency: e.target.checked
                                        }))}
                                        style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                                    />
                                    <span>Cấp phát khẩn cấp</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowDispenseModal(false)}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleDispense}
                                disabled={loading || !selectedPatient || selectedItems.length === 0}
                            >
                                {loading ? '⏳ Đang xử lý...' : '✓ Xác nhận cấp phát'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {showRestockModal && selectedCabinet && (
                <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                        <div className="modal-header">
                            <h3>📦 Bổ sung tồn kho - {selectedCabinet.cabinetLocation}</h3>
                            <button className="btn-close" onClick={() => setShowRestockModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            {/* Cabinet Info */}
                            <div style={{
                                padding: '1rem',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                            Tủ thuốc
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {selectedCabinet.cabinetLocation}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                            Loại tủ
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {selectedCabinet.cabinetType || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Restock Items */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                        Danh sách items bổ sung
                                    </h4>
                                    <button
                                        className="btn-primary"
                                        onClick={handleAddRestockItem}
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        <FiPlus /> Thêm item
                                    </button>
                                </div>

                                {restockItems.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        color: '#6c757d'
                                    }}>
                                        <FiPackage size={48} color="#dee2e6" />
                                        <p style={{ marginTop: '1rem' }}>
                                            Chưa có item nào. Nhấn "Thêm item" để bắt đầu.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {restockItems.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '1rem',
                                                    background: '#fff',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '8px',
                                                    marginBottom: '1rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>
                                                        Item #{index + 1}
                                                    </h5>
                                                    <button
                                                        className="btn-icon btn-deactivate"
                                                        onClick={() => handleRemoveRestockItem(index)}
                                                        title="Xóa item"
                                                        style={{ padding: '0.4rem' }}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                    {/* Item Type */}
                                                    <div className="form-group">
                                                        <label>Loại <span className="required">*</span></label>
                                                        <select
                                                            value={item.itemType}
                                                            onChange={(e) => handleUpdateRestockItem(index, 'itemType', e.target.value)}
                                                            required
                                                        >
                                                            <option value="MEDICINE">Thuốc</option>
                                                            <option value="MATERIAL">Vật tư</option>
                                                            <option value="EQUIPMENT">Thiết bị</option>
                                                        </select>
                                                    </div>

                                                    {/* Medicine Selection */}
                                                    <div className="form-group">
                                                        <label>Chọn thuốc <span className="required">*</span></label>
                                                        <select
                                                            value={item.itemId}
                                                            onChange={(e) => handleUpdateRestockItem(index, 'itemId', e.target.value)}
                                                            required
                                                            disabled={loadingMedicines}
                                                            style={{ fontSize: '0.9rem' }}
                                                        >
                                                            <option value="">{loadingMedicines ? '⏳ Đang tải...' : '-- Chọn thuốc --'}</option>
                                                            {medicines.map(med => (
                                                                <option key={med.medicineId} value={med.medicineId}>
                                                                    [{med.sku}] {med.medicineName} - {med.unit} ({med.manufacturer})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="form-group">
                                                        <label>Số lượng <span className="required">*</span></label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleUpdateRestockItem(index, 'quantity', e.target.value)}
                                                            min="1"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Batch Number */}
                                                    <div className="form-group">
                                                        <label>Số lô <span className="required">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={item.batchNumber}
                                                            onChange={(e) => handleUpdateRestockItem(index, 'batchNumber', e.target.value)}
                                                            placeholder="VD: BATCH-2025-001"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Expiry Date */}
                                                    <div className="form-group">
                                                        <label>Hạn sử dụng <span className="required">*</span></label>
                                                        <input
                                                            type="date"
                                                            value={item.expiryDate}
                                                            onChange={(e) => handleUpdateRestockItem(index, 'expiryDate', e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Unit Price */}
                                                    <div className="form-group">
                                                        <label>Đơn giá (VNĐ) <span className="required">*</span></label>
                                                        <input
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleUpdateRestockItem(index, 'unitPrice', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="form-group">
                                <label htmlFor="restockNotes">Ghi chú</label>
                                <textarea
                                    id="restockNotes"
                                    value={restockNotes}
                                    onChange={(e) => setRestockNotes(e.target.value)}
                                    rows="3"
                                    placeholder="Nhập ghi chú về đợt bổ sung tồn kho..."
                                />
                            </div>

                            {/* Summary */}
                            {restockItems.length > 0 && (
                                <div style={{
                                    padding: '1rem',
                                    background: '#e7f3ff',
                                    borderRadius: '8px',
                                    marginTop: '1rem'
                                }}>
                                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: '600' }}>
                                        📊 Tổng kết
                                    </h5>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <div>Tổng số items: <strong>{restockItems.length}</strong></div>
                                        <div>Tổng số lượng: <strong>{restockItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}</strong></div>
                                        <div>Tổng giá trị: <strong>{restockItems.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0).toLocaleString('vi-VN')} VNĐ</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowRestockModal(false)}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleRestock}
                                disabled={loading || restockItems.length === 0}
                            >
                                {loading ? '⏳ Đang xử lý...' : '✓ Xác nhận bổ sung'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetInventoryPage;