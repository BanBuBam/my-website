import React, { useState, useEffect } from 'react';
import './CabinetManagementPage.css';
import { 
    FiRefreshCw, FiSearch, FiPackage, FiAlertCircle, 
    FiX, FiPlus, FiTrash2, FiSave, FiCheckCircle
} from 'react-icons/fi';
import { pharmacistCabinetAPI, pharmacistPatientAPI, medicineAPI } from '../../../../services/staff/pharmacistAPI';
import PatientSearchModal from '../../components/PatientSearchModal';

const CabinetInventoryPage = () => {
    // ==================== STATE MANAGEMENT ====================
    
    // Cabinet & Inventory State
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [error, setError] = useState(null);

    // Dispense Modal State
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
    const [selectedItems, setSelectedItems] = useState([]); // Danh sách thuốc được chọn để cấp phát

    // Patient Search State
    const [showPatientSearchModal, setShowPatientSearchModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Restock Modal State
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockItems, setRestockItems] = useState([]);
    const [restockNotes, setRestockNotes] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [loadingMedicines, setLoadingMedicines] = useState(false);

    // ==================== INITIALIZATION ====================

    useEffect(() => {
        loadCabinets();
    }, []);

    // ==================== DATA FETCHING ====================

    // 1. Tải danh sách tủ
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

    // 2. Tải tồn kho của một tủ
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

    // 3. Tải danh sách thuốc (cho dropdown Restock & Dispense Quick Add)
    const loadMedicines = async () => {
        try {
            setLoadingMedicines(true);
            const response = await medicineAPI.getMedicines('', 0, 1000); 
            
            if (response?.status === 'OK' && response?.data?.content) {
                setMedicines(response.data.content);
            } else if (response?.data && Array.isArray(response.data)) {
                setMedicines(response.data);
            } else if (response?.content) {
                setMedicines(response.content);
            } else {
                setMedicines([]);
            }
        } catch (err) {
            console.error('Error loading medicines:', err);
            setMedicines([]);
        } finally {
            setLoadingMedicines(false);
        }
    };

    // ==================== EVENT HANDLERS ====================

    const handleSelectCabinet = (cabinet) => {
        setSelectedCabinet(cabinet);
        loadCabinetInventory(cabinet.cabinetId);
    };

    // --- Xử lý Tìm kiếm Bệnh nhân ---
    const handleSelectPatientFromModal = (patient) => {
        setSelectedPatient(patient);
        setDispenseFormData(prev => ({
            ...prev,
            patientId: patient.id || patient.patientId
        }));
        setShowPatientSearchModal(false);
    };

    // --- Xử lý Cấp phát (Dispense) ---
    
    // Mở modal cấp phát
    const handleOpenDispenseModal = () => {
        if (!selectedCabinet) { alert('⚠️ Vui lòng chọn tủ thuốc trước!'); return; }
        if (selectedCabinet.isLocked) { alert('⚠️ Tủ đang bị khóa. Không thể cấp phát!'); return; }

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
        
        // QUAN TRỌNG: Không reset selectedItems ở đây để giữ lại các thuốc đã chọn từ bảng bên ngoài
        if (!selectedPatient) setSelectedPatient(null);
        setShowDispenseModal(true);
    };

    // Thêm item vào danh sách cấp phát
    const handleAddDispenseItem = (inventoryItem) => {
        // Kiểm tra trùng lặp dựa trên ItemID và Số lô
        const existingItem = selectedItems.find(item =>
            item.itemId === inventoryItem.item_id &&
            item.batchNumber === inventoryItem.batch_number
        );

        if (existingItem) { 
            alert('⚠️ Thuốc này (cùng số lô) đã có trong danh sách cấp phát!'); 
            return; 
        }

        const newItem = {
            itemType: inventoryItem.item_type || 'MEDICINE',
            itemId: inventoryItem.item_id,
            itemName: inventoryItem.item_name,
            quantity: 1,
            availableQuantity: inventoryItem.quantity,
            batchNumber: inventoryItem.batch_number || '',
            expiryDate: inventoryItem.expiry_date,
            notes: ''
        };

        setSelectedItems([...selectedItems, newItem]);
    };

    // Xử lý chọn nhanh thuốc từ dropdown trong Modal
    const handleQuickSelectInventory = (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex === "") return;
        
        const item = inventoryItems[selectedIndex];
        if (item) {
            handleAddDispenseItem(item);
        }
        e.target.value = ""; // Reset dropdown
    };

    const handleRemoveDispenseItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleUpdateDispenseItem = (index, field, value) => {
        const updatedItems = [...selectedItems];
        if (field === 'quantity') {
            const qty = parseInt(value);
            if (qty > updatedItems[index].availableQuantity) return; // Không cho phép nhập quá tồn kho
            if (qty < 1) return;
            updatedItems[index].quantity = qty;
        } else {
            updatedItems[index][field] = value;
        }
        setSelectedItems(updatedItems);
    };

    const handleDispense = async () => {
        // Validation
        if (!selectedPatient || !dispenseFormData.patientId) { alert('⚠️ Vui lòng chọn bệnh nhân!'); return; }
        if (!dispenseFormData.encounterId) { alert('⚠️ Vui lòng nhập Encounter ID!'); return; }
        if (selectedItems.length === 0) { alert('⚠️ Vui lòng chọn ít nhất một item!'); return; }
        if (!dispenseFormData.reason) { alert('⚠️ Vui lòng nhập lý do!'); return; }

        // Chuẩn bị payload
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
                setSelectedItems([]); // Xóa danh sách sau khi thành công
                setSelectedPatient(null);
                if (selectedCabinet) loadCabinetInventory(selectedCabinet.cabinetId);
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

    // --- Xử lý Bổ sung tồn kho (Restock) ---
    
    const handleOpenRestockModal = () => {
        if (!selectedCabinet) { alert('⚠️ Vui lòng chọn tủ thuốc trước!'); return; }
        if (selectedCabinet.isLocked) { alert('⚠️ Tủ đang bị khóa!'); return; }

        setRestockItems([]);
        setRestockNotes('');
        setShowRestockModal(true);
        loadMedicines(); // Tải danh sách thuốc để chọn
    };

    const handleAddRestockItem = () => {
        const newItem = {
            itemType: 'MEDICINE',
            itemId: '',
            itemName: '',
            quantity: 1,
            batchNumber: '',
            // Đã bỏ expiryDate và unitPrice theo yêu cầu API mới nhất
        };
        setRestockItems([...restockItems, newItem]);
    };

    const handleRemoveRestockItem = (index) => {
        setRestockItems(restockItems.filter((_, i) => i !== index));
    };

    const handleUpdateRestockItem = (index, field, value) => {
        const updatedItems = [...restockItems];
        updatedItems[index][field] = value;

        // Tự động điền tên thuốc khi chọn ID
        if (field === 'itemId') {
            const selectedMedicine = medicines.find(m => m.medicineId === parseInt(value));
            if (selectedMedicine) {
                updatedItems[index].itemName = selectedMedicine.medicineName;
            }
        }
        setRestockItems(updatedItems);
    };

    const handleRestock = async () => {
        // 1. Validation
        if (restockItems.length === 0) { alert('⚠️ Vui lòng thêm item!'); return; }
        
        for (let i = 0; i < restockItems.length; i++) {
            const item = restockItems[i];
            if (!item.itemId) { alert(`⚠️ Item ${i + 1}: Vui lòng chọn thuốc!`); return; }
            if (!item.quantity || item.quantity < 1) { alert(`⚠️ Item ${i + 1}: Số lượng phải lớn hơn 0!`); return; }
            if (!item.batchNumber) { alert(`⚠️ Item ${i + 1}: Vui lòng nhập số lô!`); return; }
        }

        // 2. Chuẩn bị Payload (Chỉ gửi các trường API yêu cầu)
        const payload = restockItems.map(item => ({
            itemType: item.itemType,
            itemId: parseInt(item.itemId),
            quantity: parseInt(item.quantity),
            batchNumber: item.batchNumber
        }));

        try {
            setLoading(true);
            const response = await pharmacistCabinetAPI.restockCabinet(selectedCabinet.cabinetId, payload);

            if (response && response.status === 'OK') {
                const result = response.data;
                let message = `✅ ${response.message}\n• Thành công: ${result.success_count}\n• Thất bại: ${result.fail_count}`;
                
                if (result.errors?.length > 0) {
                    message += `\n⚠️ Lỗi chi tiết:\n${result.errors.join('\n')}`;
                }
                
                alert(message);
                setShowRestockModal(false);
                if (selectedCabinet) loadCabinetInventory(selectedCabinet.cabinetId);
            } else {
                throw new Error(response.message || 'Lỗi hệ thống');
            }
        } catch (err) {
            console.error('Error restocking:', err);
            alert('❌ ' + getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // ==================== HELPERS ====================
    
    const getErrorMessage = (err) => err.response?.data?.message || err.message || 'Lỗi hệ thống';
    
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleDateString('vi-VN'); } catch { return dateString; }
    };
    
    // Kiểm tra item đã được chọn chưa (để tô màu UI)
    const isItemSelected = (item) => {
        return selectedItems.some(si => 
            si.itemId === item.item_id && 
            si.batchNumber === item.batch_number
        );
    };

    // ==================== RENDER ====================
    return (
        <div className="cabinet-management-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>📦 Tồn kho Tủ thuốc</h2>
                    <p>Quản lý tồn kho và cấp phát từ tủ thuốc</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={loadCabinets} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} /> Làm mới
                    </button>
                    {selectedCabinet && (
                        <>
                            <button className="btn-secondary" onClick={handleOpenRestockModal} style={{ background: '#17a2b8', color: '#fff', border: 'none' }}>
                                <FiPackage /> Bổ sung tồn kho
                            </button>
                            <button className="btn-primary" onClick={handleOpenDispenseModal}>
                                <FiPlus /> Cấp phát ({selectedItems.length})
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                
                {/* Left Panel: Cabinet List */}
                <div style={{ flex: '0 0 350px' }}>
                    <div className="cabinet-list-panel" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', maxHeight: '700px', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Danh sách tủ thuốc</h3>
                        {loading ? <p>⏳ Đang tải...</p> : 
                         cabinets.map(cabinet => (
                            <div key={cabinet.cabinetId} onClick={() => handleSelectCabinet(cabinet)}
                                style={{
                                    padding: '1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.5rem',
                                    border: selectedCabinet?.cabinetId === cabinet.cabinetId ? '2px solid #007bff' : '1px solid #dee2e6',
                                    background: selectedCabinet?.cabinetId === cabinet.cabinetId ? '#e7f3ff' : '#f8f9fa'
                                }}>
                                <div style={{ fontWeight: '600' }}>{cabinet.cabinetLocation}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{cabinet.departmentName}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Inventory Table */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {selectedCabinet ? (
                        <div className="inventory-panel" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', minHeight: '400px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>{selectedCabinet.cabinetLocation}</h3>
                            {loadingInventory ? <p>⏳ Đang tải tồn kho...</p> : 
                            inventoryItems.length > 0 ? (
                                <table className="cabinet-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th><th>Tên thuốc</th><th>Loại</th><th>Lô</th><th>Tồn</th><th>HSD</th><th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryItems.map((item, index) => {
                                            const isSelected = isItemSelected(item);
                                            return (
                                                <tr key={index} style={{ background: isSelected ? '#f0f9ff' : 'transparent' }}>
                                                    <td>{index + 1}</td>
                                                    <td><strong>{item.item_name}</strong></td>
                                                    <td>
                                                        <span className={`badge badge-type-${(item.item_type || 'MEDICINE').toLowerCase()}`}>
                                                            {item.item_type || 'MEDICINE'}
                                                        </span>
                                                    </td>
                                                    <td>{item.batch_number}</td>
                                                    <td style={{ color: item.quantity < 10 ? 'red' : 'green', fontWeight: 'bold' }}>{item.quantity}</td>
                                                    <td>{formatDateTime(item.expiry_date)}</td>
                                                    <td>
                                                        <button 
                                                            className={`btn-icon ${isSelected ? 'btn-selected' : 'btn-view'}`}
                                                            onClick={() => isSelected ? handleRemoveDispenseItem(selectedItems.findIndex(si => si.itemId === item.item_id && si.batchNumber === item.batch_number)) : handleAddDispenseItem(item)}
                                                            disabled={item.quantity === 0}
                                                            title={isSelected ? "Đã chọn (Bỏ chọn)" : "Thêm vào danh sách"}
                                                            style={{
                                                                background: isSelected ? '#28a745' : '#007bff',
                                                                color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer'
                                                            }}
                                                        >
                                                            {isSelected ? <FiCheckCircle /> : <FiPlus />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : <p style={{textAlign: 'center', padding: '2rem'}}>Chưa có thuốc trong tủ này.</p>}
                        </div>
                    ) : <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px' }}><p>Chọn tủ để xem</p></div>}
                </div>
            </div>

            {/* ==================== MODALS ==================== */}

            {/* 1. DISPENSE MODAL */}
            {showDispenseModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h3>💊 Cấp phát từ tủ thuốc</h3>
                            <button className="btn-close" onClick={() => setShowDispenseModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            {/* Patient Info */}
                            <div className="form-group">
                                <label>Bệnh nhân <span style={{color: 'red'}}>*</span></label>
                                {!selectedPatient ? (
                                    <button className="btn-primary" onClick={() => setShowPatientSearchModal(true)} style={{width: '100%'}}>
                                        <FiSearch /> Tìm kiếm bệnh nhân
                                    </button>
                                ) : (
                                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#e9ecef', borderRadius: '4px'}}>
                                        <span><strong>{selectedPatient.fullName}</strong> ({selectedPatient.patientCode})</span>
                                        <button onClick={() => setSelectedPatient(null)} style={{border:'none', color:'red', cursor:'pointer'}}>Thay đổi</button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Encounter ID <span style={{color: 'red'}}>*</span></label>
                                <input type="number" className="form-control" value={dispenseFormData.encounterId} onChange={e => setDispenseFormData({...dispenseFormData, encounterId: e.target.value})} placeholder="Nhập ID đợt khám..." />
                            </div>

                            {/* TÍNH NĂNG MỚI: Thêm thuốc nhanh ngay trong Modal */}
                            <div className="form-group" style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px dashed #ced4da'}}>
                                <label style={{marginBottom: '5px', display: 'block', fontWeight: 'bold', color: '#007bff'}}>
                                    <FiPlus /> Thêm thuốc nhanh từ tủ trực:
                                </label>
                                <select 
                                    className="form-control" 
                                    onChange={handleQuickSelectInventory} 
                                    defaultValue=""
                                >
                                    <option value="" disabled>-- Chọn thuốc để thêm vào danh sách --</option>
                                    {inventoryItems.map((item, idx) => {
                                        const isAlreadyAdded = isItemSelected(item);
                                        if (item.quantity === 0) return null;
                                        return (
                                            <option key={idx} value={idx} disabled={isAlreadyAdded}>
                                                {isAlreadyAdded ? '✓ ' : ''}{item.item_name} (Lô: {item.batch_number}) - Tồn: {item.quantity}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Selected Items Table */}
                            <div className="form-group">
                                <label>Danh sách thuốc cấp phát ({selectedItems.length})</label>
                                {selectedItems.length === 0 ? (
                                    <div style={{textAlign: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: '4px', color: '#666'}}>
                                        Chưa chọn item nào. Vui lòng chọn ở trên hoặc từ bảng tồn kho.
                                    </div>
                                ) : (
                                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '5px'}}>
                                        <thead style={{background: '#eee'}}>
                                            <tr>
                                                <th style={{padding: '8px', textAlign: 'left'}}>Tên thuốc</th>
                                                <th style={{padding: '8px', textAlign: 'left'}}>Lô</th>
                                                <th style={{padding: '8px', textAlign: 'left'}}>SL Cấp</th>
                                                <th style={{padding: '8px', textAlign: 'left'}}>Ghi chú</th>
                                                <th style={{padding: '8px', textAlign: 'center'}}>Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedItems.map((item, idx) => (
                                                <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                                                    <td style={{padding: '8px'}}>{item.itemName}</td>
                                                    <td style={{padding: '8px'}}>{item.batchNumber}</td>
                                                    <td style={{padding: '8px'}}>
                                                        <input type="number" min="1" max={item.availableQuantity} value={item.quantity} 
                                                            onChange={(e) => handleUpdateDispenseItem(idx, 'quantity', e.target.value)}
                                                            style={{width: '60px', padding: '4px'}}
                                                        /> / {item.availableQuantity}
                                                    </td>
                                                    <td style={{padding: '8px'}}>
                                                        <input type="text" value={item.notes} onChange={(e) => handleUpdateDispenseItem(idx, 'notes', e.target.value)} placeholder="Ghi chú..." style={{width: '100%', padding: '4px'}} />
                                                    </td>
                                                    <td style={{padding: '8px', textAlign: 'center'}}>
                                                        <button onClick={() => handleRemoveDispenseItem(idx)} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}>
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Lý do <span style={{color: 'red'}}>*</span></label>
                                <input type="text" className="form-control" value={dispenseFormData.reason} onChange={e => setDispenseFormData({...dispenseFormData, reason: e.target.value})} placeholder="VD: Theo y lệnh..." />
                            </div>

                            <div className="form-group">
                                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <input type="checkbox" checked={dispenseFormData.isEmergency} onChange={e => setDispenseFormData({...dispenseFormData, isEmergency: e.target.checked})} />
                                    Cấp phát khẩn cấp
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDispenseModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleDispense} disabled={loading || selectedItems.length === 0}>
                                {loading ? 'Đang xử lý...' : 'Xác nhận cấp phát'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. RESTOCK MODAL */}
            {showRestockModal && selectedCabinet && (
                <div className="modal-overlay">
                    <div className="modal-content modal-large" style={{maxWidth: '1000px'}}>
                        <div className="modal-header"><h3>📦 Bổ sung tồn kho - {selectedCabinet.cabinetLocation}</h3><button className="btn-close" onClick={()=>setShowRestockModal(false)}><FiX/></button></div>
                        <div className="modal-body">
                            <div style={{marginBottom: '10px', display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                                <h4>Danh sách items</h4>
                                <button className="btn-primary" onClick={handleAddRestockItem} style={{fontSize: '0.9rem'}}><FiPlus/> Thêm item</button>
                            </div>
                            
                            {restockItems.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px', color: '#666'}}>
                                    <FiPackage size={48}/> <p>Chưa có item nào. Nhấn "Thêm item" để bắt đầu.</p>
                                </div>
                            ) : (
                                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                    {restockItems.map((item, index) => (
                                        <div key={index} style={{border:'1px solid #ddd', padding:'15px', marginBottom:'10px', borderRadius:'8px', background: '#fff'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                                                <strong>Item #{index+1}</strong>
                                                <button onClick={()=>handleRemoveRestockItem(index)} style={{border:'none', background:'none', color:'red', cursor: 'pointer'}}><FiTrash2/></button>
                                            </div>
                                            <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr 1fr', gap:'10px'}}>
                                                <div className="form-group">
                                                    <label>Loại <span className="required">*</span></label>
                                                    <select className="form-control" value={item.itemType} onChange={(e)=>handleUpdateRestockItem(index, 'itemType', e.target.value)}>
                                                        <option value="MEDICINE">Thuốc</option><option value="MATERIAL">Vật tư</option><option value="EQUIPMENT">Thiết bị</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Thuốc <span className="required">*</span></label>
                                                    <select className="form-control" value={item.itemId} onChange={(e)=>handleUpdateRestockItem(index, 'itemId', e.target.value)} disabled={loadingMedicines}>
                                                        <option value="">{loadingMedicines ? 'Đang tải...' : '--Chọn thuốc--'}</option>
                                                        {medicines.map(m=><option key={m.medicineId} value={m.medicineId}>[{m.sku}] {m.medicineName}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-group"><label>SL <span className="required">*</span></label><input type="number" min="1" className="form-control" value={item.quantity} onChange={(e)=>handleUpdateRestockItem(index, 'quantity', e.target.value)}/></div>
                                                <div className="form-group"><label>Số lô <span className="required">*</span></label><input type="text" className="form-control" value={item.batchNumber} onChange={(e)=>handleUpdateRestockItem(index, 'batchNumber', e.target.value)} placeholder="VD: BATCH-001"/></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Summary */}
                            {restockItems.length > 0 && (
                                <div style={{padding: '10px', background: '#e7f3ff', borderRadius: '8px', marginTop: '10px'}}>
                                    <strong>Tổng kết:</strong> {restockItems.length} items. Tổng số lượng: {restockItems.reduce((sum, i) => sum + (parseInt(i.quantity)||0), 0)}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={()=>setShowRestockModal(false)} disabled={loading}>Hủy</button>
                            <button className="btn-primary" onClick={handleRestock} disabled={loading || restockItems.length === 0}>
                                <FiSave/> {loading ? 'Đang xử lý...' : 'Xác nhận bổ sung'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. PATIENT SEARCH MODAL */}
            <PatientSearchModal 
                isOpen={showPatientSearchModal} 
                onClose={()=>setShowPatientSearchModal(false)} 
                onSelectPatient={handleSelectPatientFromModal} 
                searchAPI={pharmacistPatientAPI.searchPatientsByName} 
            />
        </div>
    );
};

export default CabinetInventoryPage;