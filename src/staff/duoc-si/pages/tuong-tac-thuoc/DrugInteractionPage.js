import React, { useState, useEffect } from 'react';
import './DrugInteractionPage.css';
import { 
    FiSearch, FiAlertTriangle, FiPlus, FiTrash2, FiActivity, 
    FiCheckCircle, FiRefreshCw, FiAlertOctagon, FiBookOpen, FiZap 
} from 'react-icons/fi';
import { pharmacistInteractionAPI, medicineAPI } from '../../../../services/staff/pharmacistAPI';

const DrugInteractionPage = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'check' | 'recycle'
    
    // State cho List Tab
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ critical: 0, major: 0, moderate: 0, minor: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    // State cho Check Tab
    const [selectedMeds, setSelectedMeds] = useState([]); // Danh sách thuốc để check
    const [checkResult, setCheckResult] = useState([]);   // Kết quả check
    const [medSearchTerm, setMedSearchTerm] = useState('');
    const [medSearchResults, setMedSearchResults] = useState([]);

    // Load data ban đầu
    useEffect(() => {
        if (activeTab === 'list') {
            loadInteractions();
            loadStats();
        }
    }, [activeTab]);

    const loadInteractions = async () => {
        setLoading(true);
        try {
            const res = await pharmacistInteractionAPI.getAllInteractions();
            if (res?.data?.content) setInteractions(res.data.content);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadStats = async () => {
        try {
            const res = await pharmacistInteractionAPI.getStatistics();
            if (res?.data) setStats(res.data);
        } catch (err) { console.error(err); }
    };

    // --- Logic Tab Kiểm tra (Check) ---
    const searchMedicineToAdd = async (term) => {
        setMedSearchTerm(term);
        if (term.length < 2) return;
        try {
            const res = await medicineAPI.getMedicines(0, 10); // Giả sử có API search thuốc
            // Filter client-side tạm thời nếu API search chưa chuẩn
            const found = res?.content?.filter(m => m.medicineName.toLowerCase().includes(term.toLowerCase())) || [];
            setMedSearchResults(found);
        } catch (err) { console.error(err); }
    };

    const addMedToCheck = (med) => {
        if (!selectedMeds.find(m => m.medicineId === med.medicineId)) {
            setSelectedMeds([...selectedMeds, med]);
        }
        setMedSearchTerm('');
        setMedSearchResults([]);
    };

    const removeMedFromCheck = (id) => {
        setSelectedMeds(selectedMeds.filter(m => m.medicineId !== id));
        setCheckResult([]); // Reset kết quả khi thay đổi danh sách
    };

    const performCheck = async () => {
        if (selectedMeds.length < 2) {
            alert("Vui lòng chọn ít nhất 2 loại thuốc để kiểm tra tương tác.");
            return;
        }
        setLoading(true);
        try {
            const ids = selectedMeds.map(m => m.medicineId);
            const res = await pharmacistInteractionAPI.checkInteractions(ids);
            if (res?.data) setCheckResult(res.data);
            else setCheckResult([]); // Không có tương tác
        } catch (err) { console.error(err); alert("Lỗi khi kiểm tra."); }
        finally { setLoading(false); }
    };

    // Helper render badge
    const renderSeverityBadge = (severity) => {
        let colorClass = 'low';
        let icon = <FiActivity />;
        if (severity === 'CONTRAINDICATED' || severity === 'CRITICAL') { colorClass = 'critical'; icon = <FiAlertOctagon />; }
        else if (severity === 'MAJOR') { colorClass = 'major'; icon = <FiAlertTriangle />; }
        else if (severity === 'MODERATE') { colorClass = 'moderate'; }
        
        return <span className={`severity-badge ${colorClass}`}>{icon} {severity}</span>;
    };

    return (
        <div className="interaction-page">
            <div className="page-header">
                <div className="header-left">
                    <h2>⚡ Quản lý Tương tác Thuốc</h2>
                    <p>Cơ sở dữ liệu an toàn dùng thuốc & Công cụ kiểm tra</p>
                </div>
                <div className="tabs-control">
                    <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                        <FiBookOpen /> Danh mục
                    </button>
                    <button className={`tab-btn ${activeTab === 'check' ? 'active' : ''}`} onClick={() => setActiveTab('check')}>
                        <FiZap /> Kiểm tra nhanh
                    </button>
                    <button className={`tab-btn ${activeTab === 'recycle' ? 'active' : ''}`} onClick={() => setActiveTab('recycle')}>
                        <FiTrash2 /> Thùng rác
                    </button>
                </div>
            </div>

            <div className="tab-content-container">
                {/* === TAB 1: DANH MỤC (LIST) === */}
                {activeTab === 'list' && (
                    <div className="list-view">
                        {/* Stats Cards */}
                        <div className="stats-row">
                            <div className="stat-card critical">
                                <h3>{stats.critical || 0}</h3>
                                <span>Chống chỉ định</span>
                            </div>
                            <div className="stat-card major">
                                <h3>{stats.major || 0}</h3>
                                <span>Nghiêm trọng</span>
                            </div>
                            <div className="stat-card moderate">
                                <h3>{stats.moderate || 0}</h3>
                                <span>Trung bình</span>
                            </div>
                        </div>

                        {/* Tools Bar */}
                        <div className="toolbar">
                            <div className="search-box">
                                <FiSearch />
                                <input 
                                    type="text" 
                                    placeholder="Tìm tương tác (tên thuốc, hoạt chất)..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary"><FiPlus /> Thêm mới</button>
                        </div>

                        {/* Table */}
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Thuốc A</th>
                                    <th>Thuốc B</th>
                                    <th>Mức độ</th>
                                    <th>Cơ chế / Hậu quả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interactions.map(item => (
                                    <tr key={item.id}>
                                        <td className="fw-bold">{item.medicineA_Name}</td>
                                        <td className="fw-bold">{item.medicineB_Name}</td>
                                        <td>{renderSeverityBadge(item.severity)}</td>
                                        <td>
                                            <div className="interaction-desc">{item.description}</div>
                                            <small className="text-muted">{item.management}</small>
                                        </td>
                                        <td>
                                            <button className="btn-icon">✎</button>
                                            <button className="btn-icon delete">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* === TAB 2: CÔNG CỤ KIỂM TRA (CHECKER) === */}
                {activeTab === 'check' && (
                    <div className="check-tool-view">
                        <div className="checker-container">
                            {/* Left: Input */}
                            <div className="checker-input-panel">
                                <h3>1. Chọn thuốc cần kiểm tra</h3>
                                <div className="med-search-box">
                                    <input 
                                        type="text" 
                                        placeholder="Nhập tên thuốc để thêm..." 
                                        value={medSearchTerm}
                                        onChange={e => searchMedicineToAdd(e.target.value)}
                                    />
                                    {medSearchResults.length > 0 && (
                                        <ul className="search-dropdown">
                                            {medSearchResults.map(m => (
                                                <li key={m.medicineId} onClick={() => addMedToCheck(m)}>
                                                    {m.medicineName}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="selected-meds-list">
                                    {selectedMeds.map(med => (
                                        <div key={med.medicineId} className="med-tag">
                                            {med.medicineName}
                                            <span className="remove-tag" onClick={() => removeMedFromCheck(med.medicineId)}>×</span>
                                        </div>
                                    ))}
                                    {selectedMeds.length === 0 && <p className="empty-hint">Chưa chọn thuốc nào</p>}
                                </div>

                                <button 
                                    className="btn-primary full-width" 
                                    onClick={performCheck}
                                    disabled={loading || selectedMeds.length < 2}
                                >
                                    {loading ? 'Đang phân tích...' : '🔍 Kiểm tra Tương tác'}
                                </button>
                            </div>

                            {/* Right: Result */}
                            <div className="checker-result-panel">
                                <h3>2. Kết quả phân tích</h3>
                                {checkResult.length > 0 ? (
                                    <div className="results-list">
                                        <div className="alert-banner error">
                                            Phát hiện {checkResult.length} cặp tương tác!
                                        </div>
                                        {checkResult.map((res, idx) => (
                                            <div key={idx} className={`result-card ${res.severity.toLowerCase()}`}>
                                                <div className="result-header">
                                                    <strong>{res.medicineA} ↔ {res.medicineB}</strong>
                                                    {renderSeverityBadge(res.severity)}
                                                </div>
                                                <p className="result-desc">{res.description}</p>
                                                <div className="result-action">
                                                    <strong>Xử trí:</strong> {res.management}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-result">
                                        <FiCheckCircle size={40} color="#28a745" />
                                        <p>Không phát hiện tương tác nào (hoặc chưa kiểm tra).</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 3: RECYCLE BIN === */}
                {activeTab === 'recycle' && (
                    <div className="recycle-view">
                        <h3>Thùng rác dữ liệu</h3>
                        <p>Danh sách các tương tác đã xóa. Có thể khôi phục lại.</p>
                        {/* Table deleted interactions here */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrugInteractionPage;