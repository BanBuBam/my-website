import React, { useState } from 'react';
import './ExportStockPage.css';
import { FiPlus, FiSearch, FiEye, FiPrinter, FiFilter } from 'react-icons/fi';

const ExportStockPage = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedExport, setSelectedExport] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Mock data - Danh sách phiếu xuất kho
    const [exportRecords] = useState([
        {
            id: 'PXK001',
            date: '06/10/2025',
            prescriptionId: 'DT001',
            patientName: 'Nguyễn Văn A',
            department: 'Khoa Nội',
            totalAmount: 850000,
            status: 'Đã xuất',
            createdBy: 'Dược sĩ Trần B',
            medicines: [
                { id: 1, name: 'Paracetamol 500mg', unit: 'Viên', quantity: 20, price: 5000, batch: 'LOT001', expiry: '12/2026' },
                { id: 2, name: 'Amoxicillin 500mg', unit: 'Viên', quantity: 30, price: 8000, batch: 'LOT002', expiry: '06/2026' },
                { id: 3, name: 'Vitamin C 1000mg', unit: 'Viên', quantity: 50, price: 3000, batch: 'LOT003', expiry: '09/2026' }
            ]
        },
        {
            id: 'PXK002',
            date: '05/10/2025',
            prescriptionId: 'DT002',
            patientName: 'Trần Thị B',
            department: 'Khoa Ngoại',
            totalAmount: 1200000,
            status: 'Đã xuất',
            createdBy: 'Dược sĩ Lê C',
            medicines: [
                { id: 1, name: 'Cefixime 200mg', unit: 'Viên', quantity: 20, price: 15000, batch: 'LOT004', expiry: '03/2027' },
                { id: 2, name: 'Omeprazole 20mg', unit: 'Viên', quantity: 30, price: 10000, batch: 'LOT005', expiry: '08/2026' }
            ]
        },
        {
            id: 'PXK003',
            date: '04/10/2025',
            prescriptionId: 'DT003',
            patientName: 'Lê Văn C',
            department: 'Khoa Nhi',
            totalAmount: 650000,
            status: 'Chờ xuất',
            createdBy: 'Dược sĩ Trần B',
            medicines: [
                { id: 1, name: 'Siro ho trẻ em', unit: 'Chai', quantity: 2, price: 45000, batch: 'LOT006', expiry: '11/2025' },
                { id: 2, name: 'Paracetamol 250mg', unit: 'Viên', quantity: 40, price: 3000, batch: 'LOT007', expiry: '05/2026' }
            ]
        }
    ]);

    // Form state cho tạo phiếu xuất
    const [formData, setFormData] = useState({
        prescriptionId: '',
        patientName: '',
        department: '',
        note: '',
        medicines: []
    });

    // State cho thêm thuốc vào phiếu
    const [medicineSearch, setMedicineSearch] = useState('');
    const [selectedMedicines, setSelectedMedicines] = useState([]);

    // Mock data - Danh sách thuốc có sẵn trong kho
    const availableMedicines = [
        { id: 1, name: 'Paracetamol 500mg', unit: 'Viên', stock: 1000, price: 5000, batch: 'LOT001', expiry: '12/2026' },
        { id: 2, name: 'Amoxicillin 500mg', unit: 'Viên', stock: 800, price: 8000, batch: 'LOT002', expiry: '06/2026' },
        { id: 3, name: 'Vitamin C 1000mg', unit: 'Viên', stock: 1500, price: 3000, batch: 'LOT003', expiry: '09/2026' },
        { id: 4, name: 'Cefixime 200mg', unit: 'Viên', stock: 500, price: 15000, batch: 'LOT004', expiry: '03/2027' },
        { id: 5, name: 'Omeprazole 20mg', unit: 'Viên', stock: 600, price: 10000, batch: 'LOT005', expiry: '08/2026' }
    ];

    // Filter records
    const filteredRecords = exportRecords.filter(record => {
        const matchSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDate = filterDate ? record.date.includes(filterDate) : true;
        const matchStatus = filterStatus ? record.status === filterStatus : true;
        return matchSearch && matchDate && matchStatus;
    });

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const handleViewDetail = (record) => {
        setSelectedExport(record);
        setShowDetailModal(true);
    };

    const handleAddMedicine = (medicine) => {
        const exists = selectedMedicines.find(m => m.id === medicine.id);
        if (!exists) {
            setSelectedMedicines([...selectedMedicines, { ...medicine, exportQuantity: 1 }]);
        }
    };

    const handleRemoveMedicine = (medicineId) => {
        setSelectedMedicines(selectedMedicines.filter(m => m.id !== medicineId));
    };

    const handleQuantityChange = (medicineId, quantity) => {
        setSelectedMedicines(selectedMedicines.map(m => 
            m.id === medicineId ? { ...m, exportQuantity: parseInt(quantity) || 0 } : m
        ));
    };

    const handleSubmitExport = (e) => {
        e.preventDefault();
        if (selectedMedicines.length === 0) {
            alert('Vui lòng chọn ít nhất một loại thuốc!');
            return;
        }
        alert('Tạo phiếu xuất kho thành công!');
        setShowCreateModal(false);
        setSelectedMedicines([]);
        setFormData({
            prescriptionId: '',
            patientName: '',
            department: '',
            note: '',
            medicines: []
        });
    };

    const calculateTotal = () => {
        return selectedMedicines.reduce((sum, m) => sum + (m.price * m.exportQuantity), 0);
    };

    return (
        <div className="export-stock-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Xuất kho</h2>
                    <p>Theo dõi và quản lý các phiếu xuất thuốc</p>
                </div>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    <FiPlus /> Tạo phiếu xuất kho
                </button>
            </div>

            {/* Stats */}
            <div className="stats-section">
                <div className="stat-card">
                    <h3>{exportRecords.length}</h3>
                    <p>Tổng phiếu xuất</p>
                </div>
                <div className="stat-card success">
                    <h3>{exportRecords.filter(r => r.status === 'Đã xuất').length}</h3>
                    <p>Đã xuất</p>
                </div>
                <div className="stat-card warning">
                    <h3>{exportRecords.filter(r => r.status === 'Chờ xuất').length}</h3>
                    <p>Chờ xuất</p>
                </div>
                <div className="stat-card info">
                    <h3>{formatCurrency(exportRecords.reduce((sum, r) => sum + r.totalAmount, 0))}</h3>
                    <p>Tổng giá trị</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo mã phiếu, tên bệnh nhân, mã đơn thuốc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <input
                    type="date"
                    className="date-filter"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
                <select
                    className="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đã xuất">Đã xuất</option>
                    <option value="Chờ xuất">Chờ xuất</option>
                </select>
            </div>

            {/* Export Records Table */}
            <div className="records-table">
                <table>
                    <thead>
                        <tr>
                            <th>Mã phiếu</th>
                            <th>Ngày xuất</th>
                            <th>Mã đơn thuốc</th>
                            <th>Bệnh nhân</th>
                            <th>Khoa</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Người tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.map((record) => (
                            <tr key={record.id}>
                                <td className="code">{record.id}</td>
                                <td>{record.date}</td>
                                <td className="prescription-id">{record.prescriptionId}</td>
                                <td>{record.patientName}</td>
                                <td>{record.department}</td>
                                <td className="amount">{formatCurrency(record.totalAmount)}</td>
                                <td>
                                    <span className={`status-badge ${record.status === 'Đã xuất' ? 'success' : 'warning'}`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td>{record.createdBy}</td>
                                <td className="actions">
                                    <button className="btn-icon" onClick={() => handleViewDetail(record)} title="Xem chi tiết">
                                        <FiEye />
                                    </button>
                                    <button className="btn-icon" title="In phiếu">
                                        <FiPrinter />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Create Export */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo phiếu xuất kho</h3>
                            <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitExport}>
                            <div className="modal-body">
                                {/* Thông tin chung */}
                                <div className="form-section">
                                    <h4>Thông tin chung</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Mã đơn thuốc:</label>
                                            <input
                                                type="text"
                                                value={formData.prescriptionId}
                                                onChange={(e) => setFormData({...formData, prescriptionId: e.target.value})}
                                                placeholder="Nhập mã đơn thuốc"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên bệnh nhân: <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.patientName}
                                                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                                                placeholder="Nhập tên bệnh nhân"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Khoa:</label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                                placeholder="Nhập tên khoa"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Chọn thuốc */}
                                <div className="form-section">
                                    <h4>Chọn thuốc xuất kho</h4>
                                    <div className="medicine-search">
                                        <FiSearch />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm thuốc..."
                                            value={medicineSearch}
                                            onChange={(e) => setMedicineSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="medicine-list">
                                        {availableMedicines
                                            .filter(m => m.name.toLowerCase().includes(medicineSearch.toLowerCase()))
                                            .map(medicine => (
                                                <div key={medicine.id} className="medicine-item">
                                                    <div className="medicine-info">
                                                        <strong>{medicine.name}</strong>
                                                        <span>Tồn kho: {medicine.stock} {medicine.unit}</span>
                                                        <span>Giá: {formatCurrency(medicine.price)}</span>
                                                        <span>Lô: {medicine.batch} - HSD: {medicine.expiry}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-add-medicine"
                                                        onClick={() => handleAddMedicine(medicine)}
                                                        disabled={selectedMedicines.find(m => m.id === medicine.id)}
                                                    >
                                                        <FiPlus /> Thêm
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Danh sách thuốc đã chọn */}
                                {selectedMedicines.length > 0 && (
                                    <div className="form-section">
                                        <h4>Danh sách thuốc xuất ({selectedMedicines.length})</h4>
                                        <table className="selected-medicines-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên thuốc</th>
                                                    <th>Đơn vị</th>
                                                    <th>Số lượng xuất</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedMedicines.map(medicine => (
                                                    <tr key={medicine.id}>
                                                        <td>{medicine.name}</td>
                                                        <td>{medicine.unit}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={medicine.stock}
                                                                value={medicine.exportQuantity}
                                                                onChange={(e) => handleQuantityChange(medicine.id, e.target.value)}
                                                                className="quantity-input"
                                                            />
                                                        </td>
                                                        <td>{formatCurrency(medicine.price)}</td>
                                                        <td className="amount">{formatCurrency(medicine.price * medicine.exportQuantity)}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn-remove"
                                                                onClick={() => handleRemoveMedicine(medicine.id)}
                                                            >
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" className="text-right"><strong>Tổng cộng:</strong></td>
                                                    <td className="amount"><strong>{formatCurrency(calculateTotal())}</strong></td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}

                                {/* Ghi chú */}
                                <div className="form-group">
                                    <label>Ghi chú:</label>
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                        rows="3"
                                        placeholder="Nhập ghi chú (nếu có)"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    Tạo phiếu xuất
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            {showDetailModal && selectedExport && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết phiếu xuất kho</h3>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-info">
                                <div className="info-row">
                                    <span className="label">Mã phiếu:</span>
                                    <span className="value">{selectedExport.id}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Ngày xuất:</span>
                                    <span className="value">{selectedExport.date}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Mã đơn thuốc:</span>
                                    <span className="value">{selectedExport.prescriptionId}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Bệnh nhân:</span>
                                    <span className="value">{selectedExport.patientName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Khoa:</span>
                                    <span className="value">{selectedExport.department}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Trạng thái:</span>
                                    <span className={`status-badge ${selectedExport.status === 'Đã xuất' ? 'success' : 'warning'}`}>
                                        {selectedExport.status}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Người tạo:</span>
                                    <span className="value">{selectedExport.createdBy}</span>
                                </div>
                            </div>

                            <h4>Danh sách thuốc</h4>
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên thuốc</th>
                                        <th>Đơn vị</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedExport.medicines.map((medicine, index) => (
                                        <tr key={medicine.id}>
                                            <td>{index + 1}</td>
                                            <td>{medicine.name}</td>
                                            <td>{medicine.unit}</td>
                                            <td>{medicine.quantity}</td>
                                            <td>{formatCurrency(medicine.price)}</td>
                                            <td className="amount">{formatCurrency(medicine.price * medicine.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="5" className="text-right"><strong>Tổng cộng:</strong></td>
                                        <td className="amount"><strong>{formatCurrency(selectedExport.totalAmount)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-print">
                                <FiPrinter /> In phiếu
                            </button>
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportStockPage;

