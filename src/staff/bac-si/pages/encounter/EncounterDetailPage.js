import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorEncounterAPI } from '../../../../services/staff/doctorAPI';
import {
    FiArrowLeft, FiRefreshCw, FiAlertCircle, FiUser, FiCalendar,
    FiClock, FiMapPin, FiFileText, FiClipboard, FiHeart, FiEdit,
    FiCamera, FiPlusCircle
} from 'react-icons/fi';
import './EncounterDetailPage.css';

const EncounterDetailPage = () => {
    const { encounterId } = useParams();
    const navigate = useNavigate();
    const [encounter, setEncounter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEncounterDetail();
    }, [encounterId]);

    const fetchEncounterDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorEncounterAPI.getEncounterDetail(encounterId);
            if (response && response.data) {
                setEncounter(response.data);
            }
        } catch (err) {
            console.error('Error loading encounter detail:', err);
            setError(err.message || 'Không thể tải chi tiết encounter');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'SCHEDULED': { label: 'Đã lên lịch', className: 'status-scheduled' },
            'CHECKED_IN': { label: 'Đã check-in', className: 'status-checked-in' },
            'IN_PROGRESS': { label: 'Đang khám', className: 'status-in-progress' },
            'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
        };
        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    const getEncounterTypeDisplay = (type) => {
        const typeMap = {
            'OUTPATIENT': 'Ngoại trú',
            'INPATIENT': 'Nội trú',
            'EMERGENCY': 'Cấp cứu',
        };
        return typeMap[type] || type;
    };

    const handleCreateAdmissionRequest = () => {
        navigate(`/staff/bac-si/tao-yeu-cau-nhap-vien/${encounterId}`);
    };

    const handleAddVitalSign = () => {
        navigate('/staff/bac-si/encounter-vital', { state: { encounterId } });
    };

    const handleAddClinicalNote = () => {
        navigate('/staff/bac-si/clinical-notes', { state: { encounterId } });
    };

    const handleAddLabTestOrder = () => {
        navigate('/staff/bac-si/lab-test-order', { state: { encounterId } });
    };

    const handleAddImagingOrder = () => {
        navigate('/staff/bac-si/imaging-order', { state: { encounterId } });
    };

    const handleAddPrescription = () => {
        navigate('/staff/bac-si/prescription', { state: { encounterId } });
    };

    if (loading) {
        return (
            <div className="encounter-detail-page">
                <div className="loading-state">
                    <FiRefreshCw className="spinning" />
                    <p>Đang tải chi tiết encounter...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="encounter-detail-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!encounter) {
        return (
            <div className="encounter-detail-page">
                <div className="empty-state">
                    <FiAlertCircle />
                    <p>Không tìm thấy encounter</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="encounter-detail-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiFileText className="header-icon" />
                    <div>
                        <h1>Chi tiết Encounter #{encounterId}</h1>
                        <p>Thông tin chi tiết về encounter</p>
                    </div>
                </div>
                <button onClick={handleCreateAdmissionRequest} className="btn-admission">
                    <FiClipboard /> Tạo yêu cầu nhập viện
                </button>
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Basic Information */}
                <div className="detail-section">
                    <h3><FiUser /> Thông tin cơ bản</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Encounter ID</label>
                            <span>#{encounter.encounterId}</span>
                        </div>
                        <div className="detail-item">
                            <label>Trạng thái</label>
                            {getStatusBadge(encounter.status)}
                        </div>
                        <div className="detail-item">
                            <label>Bệnh nhân</label>
                            <span>{encounter.patientName}</span>
                        </div>
                        <div className="detail-item">
                            <label>Mã bệnh nhân</label>
                            <span>{encounter.patientCode}</span>
                        </div>
                        <div className="detail-item">
                            <label>Loại encounter</label>
                            <span>{getEncounterTypeDisplay(encounter.encounterType)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Loại khám</label>
                            <span>{encounter.visitType || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Khoa</label>
                            <span>{encounter.departmentName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Vị trí</label>
                            <span>{encounter.location || 'N/A'}</span>
                        </div>
                        {encounter.bookingId && (
                            <div className="detail-item">
                                <label>Booking ID</label>
                                <span>#{encounter.bookingId}</span>
                            </div>
                        )}
                        {encounter.disposition && (
                            <div className="detail-item">
                                <label>Disposition</label>
                                <span>{encounter.disposition}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Time Information */}
                <div className="detail-section">
                    <h3><FiClock /> Thông tin thời gian</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Thời gian bắt đầu</label>
                            <span>{formatDateTime(encounter.startDatetime)}</span>
                        </div>
                        {encounter.endDatetime && (
                            <div className="detail-item">
                                <label>Thời gian kết thúc</label>
                                <span>{formatDateTime(encounter.endDatetime)}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <label>Ngày tạo</label>
                            <span>{formatDateTime(encounter.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Cập nhật lần cuối</label>
                            <span>{formatDateTime(encounter.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Creator Information */}
                <div className="detail-section">
                    <h3><FiUser /> Thông tin người tạo</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Tạo bởi</label>
                            <span>{encounter.createdByEmployeeName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <label>ID nhân viên</label>
                            <span>{encounter.createdByEmployeeId || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Status Description */}
                {encounter.statusDescription && (
                    <div className="detail-section">
                        <h3><FiFileText /> Mô tả trạng thái</h3>
                        <p className="description-text">{encounter.statusDescription}</p>
                    </div>
                )}

                {/* Possible Actions */}
                {encounter.nextPossibleActions && encounter.nextPossibleActions.length > 0 && (
                    <div className="detail-section">
                        <h3><FiClipboard /> Hành động có thể thực hiện</h3>
                        <div className="action-tags">
                            {encounter.nextPossibleActions.map((action, index) => (
                                <span key={index} className="action-tag">{action}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="detail-section">
                    <h3><FiClipboard /> Thao tác</h3>
                    <div className="action-buttons">
                        <button className="btn-action btn-vital" onClick={handleAddVitalSign}>
                            <FiHeart />
                            <span>Thêm Vital Sign</span>
                        </button>
                        <button className="btn-action btn-note" onClick={handleAddClinicalNote}>
                            <FiEdit />
                            <span>Thêm Clinical Note</span>
                        </button>
                        <button className="btn-action btn-lab" onClick={handleAddLabTestOrder}>
                            <FiFileText />
                            <span>Thêm Lab Test Order</span>
                        </button>
                        <button className="btn-action btn-imaging" onClick={handleAddImagingOrder}>
                            <FiCamera />
                            <span>Thêm Imaging Order</span>
                        </button>
                        <button className="btn-action btn-prescription" onClick={handleAddPrescription}>
                            <FiPlusCircle />
                            <span>Thêm Prescription</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncounterDetailPage;

