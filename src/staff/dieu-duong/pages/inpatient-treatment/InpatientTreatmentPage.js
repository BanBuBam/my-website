import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI, nurseDepartmentAPI } from '../../../../services/staff/nurseAPI';
import { FiSearch, FiAlertCircle , FiUser, FiCalendar, FiActivity } from 'react-icons/fi';
import './InpatientTreatmentPage.css';

const InpatientTreatmentPage = () => {
    const [stays, setStays] = useState([]);
    const [filteredStays, setFilteredStays] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const navigate = useNavigate();

    // Fetch danh sách departments
    const fetchDepartments = async () => {
        try {
            setLoadingDepartments(true);
            const response = await nurseDepartmentAPI.getDepartments();
            if (response && response.data) {
                setDepartments(response.data.content);
            }
        } catch (err) {
            console.error('Error loading departments:', err);
        } finally {
            setLoadingDepartments(false);
        }
    };

    // Fetch danh sách điều trị nội trú
    const fetchStays = async (departmentId = '') => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (departmentId) {
                // Fetch by department
                response = await nurseInpatientStayAPI.getStaysByDepartment(departmentId);
            } else {
                // Fetch all active stays
                response = await nurseInpatientStayAPI.getActiveStays();
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
        fetchDepartments();
        fetchStays();
    }, []);

    // Handle department filter change
    const handleDepartmentChange = (e) => {
        const departmentId = e.target.value;
        setSelectedDepartmentId(departmentId);
        setSearchTerm(''); // Reset search when changing department
        fetchStays(departmentId);
    };
    
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
                stay.roomNumber?.toLowerCase().includes(term)
            );
            setFilteredStays(filtered);
        }
    }, [searchTerm, stays]);
    
    const handleViewDetail = (inpatientStayId) => {
        navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${inpatientStayId}`);
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    return (
        <div className="inpatient-treatment-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiSearch className="header-icon" />
                    <div>
                        <h1>Quản lý Điều trị Nội trú</h1>
                        <p>Danh sách bệnh nhân đang điều trị nội trú</p>
                    </div>
                </div>
            </div>
            
            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-controls">
                    <div className="department-filter">
                        <select
                            value={selectedDepartmentId}
                            onChange={handleDepartmentChange}
                            disabled={loadingDepartments}
                            className="department-select"
                        >
                            <option value="">
                                {loadingDepartments ? 'Đang tải...' : 'Tất cả khoa'}
                            </option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm theo tên bệnh nhân, mã BN, số giường, số phòng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
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
                        <label><FiSearch /> Giường:</label>
                        <span>{stay.bedDisplay || `${stay.bedNumber} - ${stay.roomNumber}`}</span>
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
                </div>
                
                <div className="diagnosis-section">
                    <label>Chẩn đoán:</label>
                    <p>{stay.admissionDiagnosis || '-'}</p>
                </div>
                
                <div className="doctor-info">
                    <label>Bác sĩ điều trị:</label>
                    <span>{stay.attendingDoctorName || 'Loading...'}</span>
                    {stay.attendingDoctorSpecialization && (
                        <span className="specialization"> - {stay.attendingDoctorSpecialization}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InpatientTreatmentPage;

