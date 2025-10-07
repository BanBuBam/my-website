import React, { useState } from 'react';
import './SupplierPage.css';
import { useNavigate } from 'react-router-dom';

const SupplierPage = () => {
    const navigate = useNavigate();

    // Dữ liệu mẫu
    const [suppliers] = useState([
        { id: 1, name: 'Công ty Dược Phẩm A', tax: '0101234567', address: 'Hà Nội' },
        { id: 2, name: 'Công ty Dược B', tax: '0209876543', address: 'TP.HCM' },
        { id: 3, name: 'Nhà thuốc C', tax: '0301112223', address: 'Đà Nẵng' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="supplier-page">
            <h2>Quản lý Nhà cung cấp</h2>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Nhập tên nhà cung cấp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-search">Tìm kiếm</button>
                <button
                    className="btn-create"
                    onClick={() => navigate('/staff/duoc-si/tao-ncc')}
                >
                    Tạo mới nhà cung cấp
                </button>
            </div>

            <table className="supplier-table">
                <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên nhà cung cấp</th>
                    <th>Mã số thuế</th>
                    <th>Địa chỉ</th>
                </tr>
                </thead>
                <tbody>
                {filteredSuppliers.map((supplier, idx) => (
                    <tr key={supplier.id}>
                        <td>{idx + 1}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.tax}</td>
                        <td>{supplier.address}</td>
                    </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                    <tr>
                        <td colSpan="4" className="no-data">Không tìm thấy nhà cung cấp</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default SupplierPage;
