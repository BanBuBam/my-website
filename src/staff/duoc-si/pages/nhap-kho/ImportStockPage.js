import React, { useState } from 'react';
import './ImportStockPage.css';
import { useNavigate } from 'react-router-dom';

const ImportStockPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);

    // Mock dữ liệu thuốc
    const mockMedicines = [
        {
            id: 'T001',
            name: 'Paracetamol 500mg',
            description: 'Thuốc hạ sốt, giảm đau',
            supplier: 'Công ty Dược Hà Nội'
        },
        {
            id: 'T002',
            name: 'Amoxicillin 500mg',
            description: 'Kháng sinh phổ rộng',
            supplier: 'Công ty Dược Hậu Giang'
        },
        {
            id: 'T003',
            name: 'Vitamin C 1000mg',
            description: 'Tăng cường sức đề kháng',
            supplier: 'Traphaco'
        }
    ];

    const handleSearch = () => {
        const filtered = mockMedicines.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filtered);
    };

    return (
        <div className="import-stock-page">
            <h2 className="page-title">Nhập kho</h2>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Nhập tên thuốc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Tìm kiếm</button>
            </div>

            <div className="medicine-list">
                {results.map((med) => (
                    <div key={med.id} className="medicine-item">
                        <div className="medicine-info">
                            <div className="medicine-name">{med.name}</div>
                            <div className="medicine-meta">
                                Mã thuốc: {med.id} | Nhà cung cấp: {med.supplier}
                            </div>
                            <div className="medicine-desc">{med.description}</div>
                        </div>
                        <div className="medicine-actions">
                            <button
                                className="btn-import"
                                onClick={() => navigate('/staff/duoc-si/phieu-thanh-toan')}
                            >
                                Nhập thuốc
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImportStockPage;
