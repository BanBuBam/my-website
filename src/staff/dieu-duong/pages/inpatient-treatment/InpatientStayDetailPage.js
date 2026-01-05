import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiUser, FiCalendar,
    FiActivity, FiFileText, FiClipboard, FiPackage
} from 'react-icons/fi';
import './InpatientStayDetailPage.css';

const InpatientStayDetailPage = () => {
    const [stay, setStay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { stayId } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchDetail = async () => {
            if (!stayId) {
                setError('Không tìm thấy ID điều trị');
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            try {
                const response = await nurseInpatientStayAPI.getStayDetail(stayId);
                if (response && response.data) {
                    setStay(response.data);
                } else {
                    setError('Không tìm thấy dữ liệu điều trị');
                }
            } catch (err) {
                setError(err.message || 'Không thể tải chi tiết điều trị');
            } finally {
                setLoading(false);
            }
        };
        
        fetchDetail();
    }, [stayId]);
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const formatDateOnly = (dateString) => {
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
    
    if (loading) {
        return (
            <div className="detail-loading">
                <FiActivity className="spinner" />
                <p>Đang tải chi tiết điều trị...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="detail-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }
    
    if (!stay) {
        return <div className="detail-error">Không có dữ liệu</div>;
    }
    
    return (
        <div className="inpatient-stay-detail-page">
            {/* Header */}
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Chi tiết Điều trị Nội trú #{stay.inpatientStayId}</h1>
                    <p>Mã bệnh nhân: {stay.patientCode || 'Loading...'}</p>
                </div>
            </div>
            
            {/* Status Section */}
            <div className="detail-section status-section">
                <div className="info-item-lg">
                    <label>Bệnh nhân</label>
                    <span className="patient-name">
                        <FiUser /> {stay.patientName || 'Loading...'}
                    </span>
                </div>
                <div className="info-item-lg">
                    <label>Trạng thái</label>
                    <span className={`badge ${getStatusBadgeClass(stay.currentStatus)}`}>
                        {stay.statusDisplay || stay.currentStatus}
                    </span>
                </div>
                <div className="info-item-lg">
                    <label>Thời gian lưu trú</label>
                    <span className="highlight-text">
                        {stay.lengthOfStayDisplay || `${stay.lengthOfStay} ngày`}
                    </span>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    className="btn-action btn-workflow"
                    onClick={() => navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${stayId}/workflow`)}
                >
                    <FiActivity /> Xem Luồng điều trị
                </button>
                <button
                    className="btn-action btn-nursing-notes"
                    onClick={() => navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${stayId}/nursing-notes`)}
                >
                    {/*<FiClipboard /> Xem Nursing Notes*/}
                    <FiActivity /> Xem Ghi chú điều dưỡng
                </button>
                <button className="btn-action btn-medication"
                        onClick={() => navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${stayId}/medications`)}
                >
                    <FiPackage /> Xem Y lệnh
                </button>
                <button className="btn-action btn-safety-assessment"
                        onClick={() => navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${stayId}/safety-assessments`)}
                >
                    {/*<FiPackage /> Xem Medication*/}
                    <FiActivity /> Xem ĐGia Aan toàn BN
                </button>
                {/*<button className="btn-action btn-discharge"*/}
                {/*        onClick={() => navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${stayId}/discharge-planning`)}*/}
                {/*>*/}
                {/*    /!*<FiPackage /> Xem Medication*!/*/}
                {/*    <FiActivity /> Xuất viện*/}
                {/*</button>*/}
            </div>
            
            {/* Detail Columns */}
            <div className="detail-columns">
                {/* Column 1: Thông tin bệnh nhân và nhập viện */}
                <div className="detail-column">
                    <div className="detail-section">
                        <h3><FiUser /> Thông tin bệnh nhân</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Tên bệnh nhân:</label>
                                <span>{stay.patientName || 'Loading...'}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã bệnh nhân:</label>
                                <span>{stay.patientCode || 'Loading...'}</span>
                            </div>
                            <div className="info-item">
                                <label>Giới tính:</label>
                                <span>{stay.patientGender || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Tuổi:</label>
                                <span>{stay.patientAge || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Nhóm máu:</label>
                                <span>{stay.bloodType || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Dị ứng:</label>
                                <span>{stay.allergies || 'Không'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="detail-section">
                        <h3><FiCalendar /> Thông tin nhập viện</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Ngày nhập viện:</label>
                                <span>{formatDateOnly(stay.admissionDate)}</span>
                            </div>
                            <div className="info-item">
                                <label>Ngày xuất viện:</label>
                                <span>{formatDateOnly(stay.dischargeDate)}</span>
                            </div>
                            <div className="info-item">
                                <label>Loại nhập viện:</label>
                                <span>{stay.admissionTypeDisplay || stay.admissionType}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian lưu trú:</label>
                                <span className="highlight">{stay.lengthOfStayDisplay || `${stay.lengthOfStay} ngày`}</span>
                            </div>
                        </div>
                        <div className="info-item-full">
                            <label>Chẩn đoán nhập viện:</label>
                            <p>{stay.admissionDiagnosis || '-'}</p>
                        </div>
                    </div>
                </div>
                
                {/* Column 2: Thông tin giường và bác sĩ */}
                <div className="detail-column">
                    <div className="detail-section">
                        <h3><FiCalendar /> Thông tin giường bệnh</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Số giường:</label>
                                <span>{stay.bedNumber || 'Loading...'}</span>
                            </div>
                            <div className="info-item">
                                <label>Số phòng:</label>
                                <span>{stay.roomNumber || 'Loading...'}</span>
                            </div>
                            <div className="info-item">
                                <label>Loại phòng:</label>
                                <span>{stay.roomType || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Khoa:</label>
                                <span>{stay.departmentName || '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="detail-section">
                        <h3><FiFileText /> Thông tin bác sĩ điều trị</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Bác sĩ điều trị:</label>
                                <span>{stay.attendingDoctorName || 'Loading...'}</span>
                            </div>
                            <div className="info-item">
                                <label>Chuyên khoa:</label>
                                <span>{stay.attendingDoctorSpecialization || '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="detail-section">
                        <h3><FiActivity /> Thông tin hệ thống</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Encounter ID:</label>
                                <span>{stay.encounterId}</span>
                            </div>
                            <div className="info-item">
                                <label>Hospital Bed ID:</label>
                                <span>{stay.hospitalBedId}</span>
                            </div>
                            <div className="info-item">
                                <label>Ngày tạo:</label>
                                <span>{formatDate(stay.createdAt)}</span>
                            </div>
                            <div className="info-item">
                                <label>Cập nhật lần cuối:</label>
                                <span>{formatDate(stay.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InpatientStayDetailPage;

