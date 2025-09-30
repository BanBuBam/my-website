import React, { useState } from 'react';
import './InventoryManagementPage.css';

const InventoryManagementPage = () => {
    // Mock danh sách thuốc
    const [medicines, setMedicines] = useState([
        {
            id: 'T001',
            name: 'Paracetamol 500mg',
            quantity: 120,
            description: 'Thuốc hạ sốt, giảm đau',
            manufacturer: 'Công ty Dược Hà Nội',
            expiry: '15/01/2026',
            price: '2,000 VNĐ/viên',
            batch: 'BATCH2025-01',
            type: 'Viên nén'
        },
        {
            id: 'T002',
            name: 'Amoxicillin 500mg',
            quantity: 80,
            description: 'Kháng sinh phổ rộng',
            manufacturer: 'Công ty Dược Hậu Giang',
            expiry: '05/08/2025',
            price: '3,500 VNĐ/viên',
            batch: 'BATCH2025-02',
            type: 'Viên nang'
        },
        {
            id: 'T003',
            name: 'Vitamin C 1000mg',
            quantity: 200,
            description: 'Tăng cường sức đề kháng',
            manufacturer: 'Công ty Traphaco',
            expiry: '20/11/2026',
            price: '1,800 VNĐ/viên',
            batch: 'BATCH2025-03',
            type: 'Viên sủi'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importQuantity, setImportQuantity] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImport = () => {
        if (importQuantity && selectedMedicine) {
            const updatedList = medicines.map(m =>
                m.id === selectedMedicine.id
                    ? { ...m, quantity: m.quantity + parseInt(importQuantity) }
                    : m
            );
            setMedicines(updatedList);
            alert(`Nhập thêm ${importQuantity} cho thuốc ${selectedMedicine.name} thành công!`);
            setImportQuantity('');
            setSelectedSupplier('');
            setShowImportForm(false);
            setSelectedMedicine(null);
        }
    };

    return (
        <div className="inventory-page">
            {/* Khối tính năng */}
            {!selectedMedicine && !showImportForm && (
                <>
                    <h2 className="page-title">Quản lý tồn kho</h2>

                    <div className="features-card">
                        <h3>Các tính năng</h3>
                        <div className="feature-buttons">
                            <button className="btn-feature">Xem thuốc sắp hết hạn</button>
                            <button className="btn-feature">Xem thuốc còn lại</button>
                            <button className="btn-feature btn-danger">Xóa thuốc</button>
                            <button className="btn-feature btn-success">Thêm thuốc</button>
                        </div>
                    </div>

                    {/* Danh sách thuốc */}
                    <div className="inventory-list-card">
                        <h3>Danh sách thuốc</h3>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên thuốc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-box"
                        />

                        <div className="medicine-list">
                            {filteredMedicines.map((med) => (
                                <div key={med.id} className="medicine-item">
                                    <div className="medicine-info">
                                        <div className="medicine-name">{med.name}</div>
                                        <div className="medicine-meta">
                                            Số lượng còn lại: {med.quantity}
                                        </div>
                                        <div className="medicine-desc">{med.description}</div>
                                    </div>
                                    <div className="medicine-actions">
                                        <button
                                            className="btn-view"
                                            onClick={() => setSelectedMedicine(med)}
                                        >
                                            Xem chi tiết
                                        </button>
                                        <button
                                            className="btn-import"
                                            onClick={() => {
                                                setSelectedMedicine(med);
                                                setShowImportForm(true);
                                            }}
                                        >
                                            Nhập thuốc
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Chi tiết thuốc */}
            {selectedMedicine && !showImportForm && (
                <div className="medicine-detail">
                    <h2 className="page-title">Chi tiết thuốc</h2>
                    <div className="detail-card">
                        <p><strong>Tên thuốc:</strong> {selectedMedicine.name}</p>
                        <p><strong>Mã thuốc:</strong> {selectedMedicine.id}</p>
                        <p><strong>Số lượng còn lại:</strong> {selectedMedicine.quantity}</p>
                        <p><strong>Mô tả:</strong> {selectedMedicine.description}</p>
                        <p><strong>Nhà sản xuất:</strong> {selectedMedicine.manufacturer}</p>
                        <p><strong>Hạn sử dụng:</strong> {selectedMedicine.expiry}</p>
                        <p><strong>Giá bán:</strong> {selectedMedicine.price}</p>
                        <p><strong>Lô thuốc:</strong> {selectedMedicine.batch}</p>
                        <p><strong>Dạng bào chế:</strong> {selectedMedicine.type}</p>
                    </div>
                    <div className="detail-actions">
                        <button className="btn-back" onClick={() => setSelectedMedicine(null)}>Quay lại</button>
                    </div>
                </div>
            )}

            {/* Giao diện nhập thuốc */}
            {selectedMedicine && showImportForm && (
                <div className="import-form">
                    <h2 className="page-title">Nhập thuốc: {selectedMedicine.name}</h2>
                    <div className="form-group">
                        <label>Số lượng nhập thêm:</label>
                        <input
                            type="number"
                            min="1"
                            value={importQuantity}
                            onChange={(e) => setImportQuantity(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Chọn nhà cung cấp:</label>
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">--Chọn nhà cung cấp--</option>
                            <option value="Công ty Dược HN">Công ty Dược Hà Nội</option>
                            <option value="Công ty Dược HG">Công ty Dược Hậu Giang</option>
                            <option value="Traphaco">Traphaco</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button className="btn-issue" onClick={handleImport}>Xác nhận nhập</button>
                        <button
                            className="btn-back"
                            onClick={() => {
                                setShowImportForm(false);
                                setSelectedMedicine(null);
                            }}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagementPage;
