import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseMedicationOrderGroupAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle, FiList,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import './MedicationOrderGroupDetailPage.css';

const MedicationOrderGroupDetailPage = () => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { groupId } = useParams();
    const navigate = useNavigate();

    // Tải chi tiết nhóm y lệnh
    const fetchGroupDetail = async () => {
        if (!groupId) {
            setError('Không tìm thấy ID nhóm y lệnh');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await nurseMedicationOrderGroupAPI.getGroupDetail(groupId);
            if (response && response.data) {
                setGroup(response.data);
            } else {
                setError('Không tìm thấy thông tin nhóm y lệnh');
            }
        } catch (err) {
            setError(err.message || 'Không thể tải thông tin nhóm y lệnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupDetail();
    }, [groupId]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'ORDERED': 'status-ordered',
            'VERIFIED': 'status-verified',
            'READY': 'status-ready',
            'GIVEN': 'status-given',
            'RECEIVED': 'status-received',
            'CANCELLED': 'status-cancelled',
            'DISCONTINUED': 'status-discontinued',
            'DISPENSED': 'status-dispensed',
        };
        return statusMap[status] || 'status-default';
    };

    const getPriorityBadgeClass = (priority) => {
        const priorityMap = {
            'ROUTINE': 'priority-routine',
            'URGENT': 'priority-urgent',
            'STAT': 'priority-stat',
        };
        return priorityMap[priority] || 'priority-default';
    };

    if (loading) {
        return (
            <div className="group-detail-loading">
                <FiActivity className="spinner" />
                <p>Đang tải thông tin nhóm y lệnh...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="group-detail-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="group-detail-error">
                <FiAlertCircle />
                <p>Không tìm thấy thông tin nhóm y lệnh</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="group-detail-page">
            {/* Header */}
            <div className="group-detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Chi tiết Nhóm Y lệnh #{group.medicationOrderGroupId}</h1>
                    <div className="header-badges">
                        <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                            {group.status}
                        </span>
                        {group.priority && (
                            <span className={`priority-badge ${getPriorityBadgeClass(group.priority)}`}>
                                {group.priority}
                                {group.isStat && ' (STAT)'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="group-detail-content">
                {/* Thông tin bệnh nhân */}
                <div className="detail-section">
                    <h2><FiUser /> Thông tin bệnh nhân</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Tên bệnh nhân:</label>
                            <span>{group.patientName}</span>
                        </div>
                        <div className="detail-item">
                            <label>ID bệnh nhân:</label>
                            <span>{group.patientId}</span>
                        </div>
                        <div className="detail-item">
                            <label>Encounter ID:</label>
                            <span>{group.encounterId}</span>
                        </div>
                        <div className="detail-item">
                            <label>Inpatient Stay ID:</label>
                            <span>{group.inpatientStayId || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin y lệnh */}
                <div className="detail-section">
                    <h2><FiPackage /> Thông tin y lệnh</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Bác sĩ chỉ định:</label>
                            <span>{group.orderedByDoctorName || `ID: ${group.orderedByDoctorId}`}</span>
                        </div>
                        <div className="detail-item">
                            <label>Thời gian chỉ định:</label>
                            <span>{formatDateTime(group.orderedAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Ngày y lệnh:</label>
                            <span>{formatDateTime(group.orderDate)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Số lượng thuốc:</label>
                            <span>{group.medicationCount} loại</span>
                        </div>
                    </div>
                    {group.orderNotes && (
                        <div className="notes-section">
                            <label>Ghi chú y lệnh:</label>
                            <p>{group.orderNotes}</p>
                        </div>
                    )}
                </div>

                {/* Thông tin xác minh */}
                {group.verifiedByPharmacistName && (
                    <div className="detail-section">
                        <h2><FiCheckCircle /> Thông tin xác minh</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Dược sĩ xác minh:</label>
                                <span>{group.verifiedByPharmacistName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian xác minh:</label>
                                <span>{formatDateTime(group.verifiedAt)}</span>
                            </div>
                        </div>
                        {group.verificationNotes && (
                            <div className="notes-section">
                                <label>Ghi chú xác minh:</label>
                                <p>{group.verificationNotes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin chuẩn bị */}
                {group.preparedByPharmacistName && (
                    <div className="detail-section">
                        <h2><FiActivity /> Thông tin chuẩn bị</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Dược sĩ chuẩn bị:</label>
                                <span>{group.preparedByPharmacistName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian chuẩn bị:</label>
                                <span>{formatDateTime(group.preparedAt)}</span>
                            </div>
                        </div>
                        {group.preparationNotes && (
                            <div className="notes-section">
                                <label>Ghi chú chuẩn bị:</label>
                                <p>{group.preparationNotes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin dispensing */}
                {group.dispensedByPharmacistName && (
                    <div className="detail-section">
                        <h2><FiPackage /> Thông tin dispensing</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Dược sĩ dispensing:</label>
                                <span>{group.dispensedByPharmacistName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian dispensing:</label>
                                <span>{formatDateTime(group.dispensedAt)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Goods Issue ID:</label>
                                <span>{group.goodsIssueId || '-'}</span>
                            </div>
                        </div>
                        {group.dispensedNotes && (
                            <div className="notes-section">
                                <label>Ghi chú dispensing:</label>
                                <p>{group.dispensedNotes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin nhận thuốc */}
                {group.receivedByNurseName && (
                    <div className="detail-section">
                        <h2><FiUser /> Thông tin nhận thuốc</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Điều dưỡng nhận:</label>
                                <span>{group.receivedByNurseName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian nhận:</label>
                                <span>{formatDateTime(group.receivedAt)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Danh sách thuốc */}
                <div className="detail-section">
                    <h2><FiList /> Danh sách thuốc ({group.medicationCount})</h2>
                    {group.medications && group.medications.length > 0 ? (
                        <div className="medications-list">
                            {group.medications.map((medication, index) => (
                                <div key={medication.medicationOrderId || index} className="medication-card">
                                    <div className="medication-header">
                                        <h4>{medication.medicineName || `Medicine ID: ${medication.medicineId}`}</h4>
                                        <span className="medication-code">Mã: {medication.medicineCode || '-'}</span>
                                    </div>
                                    <div className="medication-details">
                                        <div className="detail-row">
                                            <label>Liều dùng:</label>
                                            <span>{medication.dosage}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Đường dùng:</label>
                                            <span>{medication.routeDisplay || medication.route}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Tần suất:</label>
                                            <span>{medication.frequency}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Thời gian điều trị:</label>
                                            <span>{medication.durationDays} ngày</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Trạng thái:</label>
                                            <span className={`med-status ${getStatusBadgeClass(medication.status)}`}>
                                                {medication.statusDisplay || medication.status}
                                            </span>
                                        </div>
                                        {medication.specialInstructions && (
                                            <div className="detail-row full-width">
                                                <label>Hướng dẫn đặc biệt:</label>
                                                <p>{medication.specialInstructions}</p>
                                            </div>
                                        )}
                                    </div>
                                    {medication.overdue && (
                                        <div className="overdue-warning">
                                            <FiAlertCircle />
                                            <span>Thuốc này đã quá hạn thực hiện</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-medications">
                            <p>Không có thông tin thuốc</p>
                        </div>
                    )}
                </div>

                {/* Thông tin hủy/ngừng */}
                {(group.cancelledByEmployeeName || group.discontinuedByEmployeeName) && (
                    <div className="detail-section">
                        <h2><FiXCircle /> Thông tin hủy/ngừng</h2>
                        {group.cancelledByEmployeeName && (
                            <div className="cancellation-info">
                                <h4>Thông tin hủy</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Người hủy:</label>
                                        <span>{group.cancelledByEmployeeName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Thời gian hủy:</label>
                                        <span>{formatDateTime(group.cancelledAt)}</span>
                                    </div>
                                </div>
                                {group.cancellationReason && (
                                    <div className="notes-section">
                                        <label>Lý do hủy:</label>
                                        <p>{group.cancellationReason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {group.discontinuedByEmployeeName && (
                            <div className="discontinuation-info">
                                <h4>Thông tin ngừng thuốc</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Người ngừng:</label>
                                        <span>{group.discontinuedByEmployeeName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Thời gian ngừng:</label>
                                        <span>{formatDateTime(group.discontinuedAt)}</span>
                                    </div>
                                </div>
                                {group.discontinuationReason && (
                                    <div className="notes-section">
                                        <label>Lý do ngừng:</label>
                                        <p>{group.discontinuationReason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin hệ thống */}
                <div className="detail-section">
                    <h2><FiInfo /> Thông tin hệ thống</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Ngày tạo:</label>
                            <span>{formatDateTime(group.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Cập nhật lần cuối:</label>
                            <span>{formatDateTime(group.updatedAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Người tạo:</label>
                            <span>{group.createdByEmployeeName || `ID: ${group.createdByEmployeeId}`}</span>
                        </div>
                        <div className="detail-item">
                            <label>Người cập nhật:</label>
                            <span>{group.updatedByEmployeeName || `ID: ${group.updatedByEmployeeId}`}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicationOrderGroupDetailPage;