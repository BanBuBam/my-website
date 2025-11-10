import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser
} from 'react-icons/fi';
import './MedicationInpatientPage.css';

const MedicationInpatientPage = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { stayId } = useParams();
    const navigate = useNavigate();
    
    // Hàm tải dữ liệu
    const fetchMedications = async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const response = await nurseInpatientStayAPI.getTodayMedications(stayId);
            if (response && response.data) {
                setMedications(response.data);
            } else {
                setMedications([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách thuốc');
        } finally {
            setLoading(false);
        }
    };
    
    // Tải dữ liệu khi component mount
    useEffect(() => {
        fetchMedications();
    }, [stayId]);
    
    // TODO: Xử lý logic khi thực hiện y lệnh
    const handleAdminister = (administrationId) => {
        alert(`(Chưa thực hiện) Xử lý cho thuốc ID: ${administrationId}`);
        // 1. Gọi API để xác nhận đã thực hiện
        // 2. Mở modal để nhập ghi chú (nếu cần)
        // 3. Gọi fetchMedications() để làm mới danh sách
    };
    
    if (loading) {
        return (
            <div className="med-loading">
                <FiActivity className="spinner" />
                <p>Đang tải danh sách thuốc...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="med-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }
    
    return (
        <div className="medication-page">
            {/* Header */}
            <div className="med-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Y lệnh Thuốc (Hôm nay)</h1>
                    <p>Lượt điều trị nội trú #{stayId}</p>
                </div>
            </div>
            
            {/* Danh sách thuốc */}
            <div className="med-list-container">
                {medications.length === 0 ? (
                    <div className="med-no-data">
                        <FiPackage />
                        <p>Không có y lệnh thuốc nào cho hôm nay.</p>
                    </div>
                ) : (
                    <div className="med-list-grid">
                        {medications.map(med => (
                            <MedicationCard
                                key={med.administrationId}
                                medication={med}
                                onAdminister={handleAdminister}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Component thẻ thuốc
const MedicationCard = ({ medication, onAdminister }) => {
    
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        });
    };
    
    const getStatusInfo = (med) => {
        switch (med.administrationStatus) {
            case 'PENDING':
                return {
                    class: med.overdue ? 'status-overdue' : 'status-pending',
                    icon: <FiClock />,
                    text: med.overdue ? 'Quá hạn' : 'Chờ thực hiện'
                };
            case 'COMPLETED':
                return {
                    class: 'status-completed',
                    icon: <FiCheckCircle />,
                    text: 'Đã hoàn thành'
                };
            // Thêm các case khác nếu có (VD: SKIPPED)
            default:
                return {
                    class: 'status-default',
                    icon: <FiInfo />,
                    text: med.statusDisplay || med.administrationStatus
                };
        }
    };
    
    const statusInfo = getStatusInfo(medication);
    
    return (
        <div className={`med-card ${statusInfo.class}`}>
            <div className="med-card-header">
                <div className="med-time">
                    <FiClock />
                    <span>{formatTime(medication.scheduledDatetime)}</span>
                </div>
                <div className={`med-status-badge ${statusInfo.class}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
            </div>
            
            <div className="med-card-body">
                <h3 className="med-name">{medication.medicationName}</h3>
                <div className="med-details">
                    <div className="med-detail-item">
                        <label>Liều dùng:</label>
                        <span>{medication.dosage}</span>
                    </div>
                    <div className="med-detail-item">
                        <label>Đường dùng:</label>
                        <span>{medication.routeOfAdministration}</span>
                    </div>
                    <div className="med-detail-item">
                        <label>Tần suất:</label>
                        <span>{medication.frequency}</span>
                    </div>
                </div>
            </div>
            
            {/* Hiển thị thông tin hoàn thành hoặc nút hành động */}
            {medication.administrationStatus === 'COMPLETED' ? (
                <div className="med-card-footer completed-info">
                    <div className="info-item">
                        <FiUser />
                        <span>Thực hiện bởi: {medication.administeredByNurseName || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <FiCheckCircle />
                        <span>Lúc: {formatTime(medication.actualDatetime)}</span>
                    </div>
                    {medication.administrationNotes && (
                        <div className="info-item notes">
                            <label>Ghi chú:</label>
                            <p>{medication.administrationNotes}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="med-card-footer actions">
                    <button
                        className="btn-action btn-skip"
                        onClick={() => alert('Chức năng Bỏ qua (chưa làm)')}
                    >
                        <FiXCircle /> Bỏ qua
                    </button>
                    <button
                        className="btn-action btn-administer"
                        onClick={() => onAdminister(medication.administrationId)}
                    >
                        <FiCheckCircle /> Thực hiện
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicationInpatientPage;