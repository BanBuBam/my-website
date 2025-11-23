import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI, nurseMedicationAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiSlash
} from 'react-icons/fi';
import './MedicationInpatientPage.css';

const MedicationInpatientPage = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
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

    // Xử lý thực hiện thuốc
    const handleAdminister = async (medication) => {
        if (!window.confirm(`Xác nhận đã thực hiện thuốc "${medication.medicationName}"?`)) {
            return;
        }

        setActionLoading(medication.administrationId);
        try {
            const administrationData = {
                administeredAt: new Date().toISOString(),
                notes: 'Đã thực hiện'
            };

            const response = await nurseMedicationAPI.administerMedication(
                medication.administrationId,
                administrationData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Đã ghi nhận thực hiện thuốc thành công!');
                await fetchMedications();
            } else {
                alert(response?.message || 'Không thể thực hiện thuốc');
            }
        } catch (err) {
            console.error('Error administering medication:', err);
            alert(err.message || 'Không thể thực hiện thuốc');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý bệnh nhân từ chối
    const handleRefuse = async (medication) => {
        const reason = prompt(`Lý do bệnh nhân từ chối thuốc "${medication.medicationName}":`);
        if (!reason || reason.trim() === '') {
            return;
        }

        setActionLoading(medication.administrationId);
        try {
            const response = await nurseMedicationAPI.refuseMedication(
                medication.administrationId,
                reason
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Đã ghi nhận bệnh nhân từ chối thuốc!');
                await fetchMedications();
            } else {
                alert(response?.message || 'Không thể ghi nhận từ chối thuốc');
            }
        } catch (err) {
            console.error('Error refusing medication:', err);
            alert(err.message || 'Không thể ghi nhận từ chối thuốc');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý bỏ lỡ thuốc
    const handleMiss = async (medication) => {
        const reason = prompt(`Lý do bỏ lỡ thuốc "${medication.medicationName}":`);
        if (!reason || reason.trim() === '') {
            return;
        }

        setActionLoading(medication.administrationId);
        try {
            const response = await nurseMedicationAPI.missMedication(
                medication.administrationId,
                reason
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Đã ghi nhận bỏ lỡ thuốc!');
                await fetchMedications();
            } else {
                alert(response?.message || 'Không thể ghi nhận bỏ lỡ thuốc');
            }
        } catch (err) {
            console.error('Error missing medication:', err);
            alert(err.message || 'Không thể ghi nhận bỏ lỡ thuốc');
        } finally {
            setActionLoading(null);
        }
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
                                onRefuse={handleRefuse}
                                onMiss={handleMiss}
                                actionLoading={actionLoading}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Component thẻ thuốc
const MedicationCard = ({ medication, onAdminister, onRefuse, onMiss, actionLoading }) => {
    
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
                        className="btn-action btn-administer"
                        onClick={() => onAdminister(medication)}
                        disabled={actionLoading === medication.administrationId}
                    >
                        <FiCheckCircle /> Đã thực hiện
                    </button>
                    <button
                        className="btn-action btn-refuse"
                        onClick={() => onRefuse(medication)}
                        disabled={actionLoading === medication.administrationId}
                    >
                        <FiXCircle /> Bệnh nhân từ chối
                    </button>
                    <button
                        className="btn-action btn-miss"
                        onClick={() => onMiss(medication)}
                        disabled={actionLoading === medication.administrationId}
                    >
                        <FiSlash /> Bỏ lỡ
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicationInpatientPage;