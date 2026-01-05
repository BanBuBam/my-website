import React, { useState } from 'react';
import { FiX, FiSearch, FiUser } from 'react-icons/fi';
import './PatientSearchModal.css';

const PatientSearchModal = ({ isOpen, onClose, onSelectPatient, searchAPI }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError('Vui lòng nhập tên bệnh nhân');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Searching patient with name:', searchTerm);
            
            // Call API: /api/v1/patient/admin/search?name={searchTerm}
            const response = await searchAPI(searchTerm.trim());
            
            console.log('📊 Search response:', response);

            if (response && response.data) {
                const patients = Array.isArray(response.data) ? response.data : 
                               response.data.content ? response.data.content : [];
                setSearchResults(patients);
                
                if (patients.length === 0) {
                    setError('Không tìm thấy bệnh nhân nào');
                }
            } else {
                setSearchResults([]);
                setError('Không tìm thấy bệnh nhân nào');
            }
        } catch (err) {
            console.error('❌ Error searching patient:', err);
            setError('Lỗi khi tìm kiếm: ' + err.message);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = (patient) => {
        console.log('✅ Selected patient:', patient);
        onSelectPatient(patient);
        handleClose();
    };

    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        setError(null);
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="patient-search-modal-overlay" onClick={handleClose}>
            <div className="patient-search-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="patient-search-modal-header">
                    <div className="patient-search-modal-title">
                        <FiSearch />
                        <h3>Tìm kiếm Bệnh nhân</h3>
                    </div>
                    <button className="patient-search-modal-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {/* Search Input */}
                <div className="patient-search-modal-body">
                    <div className="patient-search-input-group">
                        <input
                            type="text"
                            className="patient-search-input"
                            placeholder="Nhập tên bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                        />
                        <button 
                            className="patient-search-btn"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="patient-search-error">
                            {error}
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="patient-search-results">
                            {searchResults.map((patient) => (
                                <div 
                                    key={patient.id || patient.patientId}
                                    className="patient-search-result-item"
                                >
                                    <div className="patient-info">
                                        <div className="patient-name">
                                            <FiUser />
                                            {patient.fullName || patient.name}
                                        </div>
                                        <div className="patient-details">
                                            <span>Mã: {patient.patientCode || patient.id}</span>
                                            <span>•</span>
                                            <span>Tuổi: {patient.age || 'N/A'}</span>
                                            <span>•</span>
                                            <span>Giới tính: {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                                        </div>
                                        <div className="patient-contact">
                                            SĐT: {patient.phoneNumber || patient.phone || 'N/A'}
                                        </div>
                                    </div>
                                    <button 
                                        className="patient-select-btn"
                                        onClick={() => handleSelectPatient(patient)}
                                    >
                                        Chọn
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientSearchModal;

