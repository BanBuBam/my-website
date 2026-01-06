import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorInpatientTreatmentAPI, departmentAPI } from '../../../../services/staff/doctorAPI';
import { FiSearch, FiAlertCircle, FiUser, FiCalendar, FiActivity } from 'react-icons/fi';
import './InpatientTreatmentListPage.css';

const InpatientTreatmentListPage = () => {
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'by-doctor', 'by-department'
    const [stays, setStays] = useState([]);
    const [filteredStays, setFilteredStays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // State cho tab by-department
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    const navigate = useNavigate();
    
    // Fetch departments cho tab by-department
    const fetchDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const response = await departmentAPI.getDepartments('', 0, 100);
            if (response && response.data && response.data.content) {
                setDepartments(response.data.content);
                if (response.data.content.length > 0) {
                    setSelectedDepartmentId(response.data.content[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        } finally {
            setLoadingDepartments(false);
        }
    };

    // Fetch danh sách điều trị nội trú
    const fetchStays = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;

            if (activeTab === 'active') {
                response = await doctorInpatientTreatmentAPI.getActiveInpatientStays();
            } else if (activeTab === 'by-doctor') {
                const employeeId = localStorage.getItem('employeeId');
                if (!employeeId) {
                    throw new Error('Không tìm thấy thông tin bác sĩ');
                }
                response = await doctorInpatientTreatmentAPI.getInpatientStaysByDoctor(employeeId);
            } else if (activeTab === 'by-department') {
                if (!selectedDepartmentId) {
                    setStays([]);
                    setFilteredStays([]);
                    setLoading(false);
                    return;
                }
                response = await doctorInpatientTreatmentAPI.getInpatientStaysByDepartment(selectedDepartmentId);
            }

            if (response && response.data) {
                // Sắp xếp giảm dần theo admissionDate
                const sortedData = [...response.data].sort((a, b) => {
                    return new Date(b.admissionDate) - new Date(a.admissionDate);
                });
                setStays(sortedData);
                setFilteredStays(sortedData);
            } else {
                setStays([]);
                setFilteredStays([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách điều trị nội trú');
            setStays([]);
            setFilteredStays([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'by-department' && departments.length === 0) {
            fetchDepartments();
        }
    }, [activeTab]);

    useEffect(() => {
        fetchStays();
    }, [activeTab, selectedDepartmentId]);
    
    // Lọc theo tên bệnh nhân hoặc mã bệnh nhân
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStays(stays);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = stays.filter(stay => 
                stay.patientName?.toLowerCase().includes(term) ||
                stay.patientCode?.toLowerCase().includes(term) ||
                stay.bedNumber?.toLowerCase().includes(term) ||
                stay.roomNumber?.toLowerCase().includes(term) ||
                stay.departmentName?.toLowerCase().includes(term)
            );
            setFilteredStays(filtered);
        }
    }, [searchTerm, stays]);
    
    const handleViewDetail = (inpatientStayId) => {
        navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}`);
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    return (
        <div className="inpatient-treatment-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiActivity className="header-icon" />
                    <div>
                        <h1>Quản lý Điều trị Nội trú</h1>
                        <p>Danh sách bệnh nhân đang điều trị nội trú</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    DS Active
                </button>
                <button
                    className={`tab-button ${activeTab === 'by-doctor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('by-doctor')}
                >
                    DS theo Bác sĩ
                </button>
                <button
                    className={`tab-button ${activeTab === 'by-department' ? 'active' : ''}`}
                    onClick={() => setActiveTab('by-department')}
                >
                    DS theo Khoa
                </button>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo tên bệnh nhân, mã BN, số giường, khoa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'by-department' && (
                    <div className="department-filter">
                        <select
                            value={selectedDepartmentId}
                            onChange={(e) => setSelectedDepartmentId(e.target.value)}
                            disabled={loadingDepartments}
                        >
                            <option value="">-- Chọn khoa --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="filter-stats">
                    <span className="stat-badge">
                        Tổng số: <strong>{filteredStays.length}</strong>
                    </span>
                </div>
            </div>
            
            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <FiActivity className="spinner" />
                    <p>Đang tải danh sách...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={fetchStays} className="btn-retry">Thử lại</button>
                </div>
            ) : filteredStays.length === 0 ? (
                <div className="empty-state">
                    <FiCalendar />
                    <p>Không có bệnh nhân nào đang điều trị nội trú</p>
                </div>
            ) : (
                <div className="stays-grid">
                    {filteredStays.map(stay => (
                        <StayCard 
                            key={stay.inpatientStayId} 
                            stay={stay}
                            onCardClick={() => handleViewDetail(stay.inpatientStayId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Stay Card Component
const StayCard = ({ stay, onCardClick }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'status-active',
            'DISCHARGED': 'status-discharged',
            'TRANSFERRED': 'status-transferred',
        };
        return statusMap[status] || 'status-default';
    };
    
    return (
        <div className="stay-card clickable" onClick={onCardClick}>
            <div className="card-header">
                <div className="card-title">
                    <h3>
                        <FiUser /> {stay.patientName || 'Loading...'}
                    </h3>
                    <span className="patient-code">{stay.patientCode || 'Loading...'}</span>
                </div>
                <span className={`badge ${getStatusBadgeClass(stay.currentStatus)}`}>
                    {stay.statusDisplay || stay.currentStatus}
                </span>
            </div>
            
            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <label>Giường:</label>
                        <span>{stay.bedDisplay || `${stay.bedNumber} - ${stay.roomNumber}`}</span>
                    </div>
                    <div className="info-item">
                        <label>Khoa:</label>
                        <span>{stay.departmentName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label><FiCalendar /> Ngày nhập viện:</label>
                        <span>{formatDate(stay.admissionDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>Thời gian lưu trú:</label>
                        <span className="highlight">{stay.lengthOfStayDisplay || `${stay.lengthOfStay} ngày`}</span>
                    </div>
                    <div className="info-item">
                        <label>Loại nhập viện:</label>
                        <span>{stay.admissionTypeDisplay || stay.admissionType}</span>
                    </div>
                    <div className="info-item">
                        <label>Bác sĩ điều trị:</label>
                        <span>{stay.attendingDoctorName || 'Loading...'}</span>
                    </div>
                </div>
                
                <div className="diagnosis-section">
                    <label>Chẩn đoán:</label>
                    <p>{stay.admissionDiagnosis || '-'}</p>
                </div>
            </div>
        </div>
    );
};

export default InpatientTreatmentListPage;

