import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseMedicationOrderAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import './MedicationOrderDetailPage.css';

const MedicationOrderDetailPage = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { orderId } = useParams();
    const navigate = useNavigate();

    // Tải chi tiết y lệnh
    const fetchOrderDetail = async () => {
        if (!orderId) {
            setError('Không tìm thấy ID y lệnh');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await nurseMedicationOrderAPI.getOrderDetail(orderId);
            if (response && response.data) {
                setOrder(response.data);
            } else {
                setError('Không tìm thấy thông tin y lệnh');
            }
        } catch (err) {
            setError(err.message || 'Không thể tải thông tin y lệnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

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
            'ORDERED': 'status-ordered',
            'VERIFIED': 'status-verified',
            'READY': 'status-ready',
            'PENDING': 'status-pending',
            'GIVEN': 'status-given',
            'REFUSED': 'status-refused',
            'MISSED': 'status-missed',
            'HELD': 'status-held',
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
            <div className="order-detail-loading">
                <FiActivity className="spinner" />
                <p>Đang tải thông tin y lệnh...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-error">
                <FiAlertCircle />
                <p>Không tìm thấy thông tin y lệnh</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="order-detail-page">
            {/* Header */}
            <div className="order-detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Chi tiết Y lệnh #{order.medicationOrderId}</h1>
                    <div className="header-badges">
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.statusDisplay || order.status}
                        </span>
                        {order.priority && (
                            <span className={`priority-badge ${getPriorityBadgeClass(order.priority)}`}>
                                {order.priorityDisplay || order.priority}
                                {order.isStat && ' (STAT)'}
                                {order.isPrn && ' (PRN)'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="order-detail-content">
                {/* Thông tin bệnh nhân */}
                <div className="detail-section">
                    <h2><FiUser /> Thông tin bệnh nhân</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Tên bệnh nhân:</label>
                            <span>{order.patientName}</span>
                        </div>
                        <div className="detail-item">
                            <label>Mã bệnh nhân:</label>
                            <span>{order.patientCode}</span>
                        </div>
                        <div className="detail-item">
                            <label>Encounter ID:</label>
                            <span>{order.encounterId}</span>
                        </div>
                        <div className="detail-item">
                            <label>Inpatient Stay ID:</label>
                            <span>{order.inpatientStayId || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin thuốc */}
                <div className="detail-section">
                    <h2><FiPackage /> Thông tin thuốc</h2>
                    <div className="medication-detail">
                        <div className="med-main-info">
                            <h3>{order.medicineName || `Medicine ID: ${order.medicineId}`}</h3>
                            <p className="med-code">Mã thuốc: {order.medicineCode || '-'}</p>
                        </div>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Liều dùng:</label>
                                <span>{order.dosage}</span>
                            </div>
                            <div className="detail-item">
                                <label>Đường dùng:</label>
                                <span>{order.routeDisplay || order.route}</span>
                            </div>
                            <div className="detail-item">
                                <label>Tần suất:</label>
                                <span>{order.frequency}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian điều trị:</label>
                                <span>{order.durationDays} ngày</span>
                            </div>
                            <div className="detail-item">
                                <label>Loại y lệnh:</label>
                                <span>{order.orderType || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Prescription ID:</label>
                                <span>{order.prescriptionId || '-'}</span>
                            </div>
                        </div>
                        {order.specialInstructions && (
                            <div className="special-instructions">
                                <label>Hướng dẫn đặc biệt:</label>
                                <p>{order.specialInstructions}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thông tin y lệnh */}
                <div className="detail-section">
                    <h2><FiInfo /> Thông tin y lệnh</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Bác sĩ chỉ định:</label>
                            <span>{order.orderedByDoctorName || `ID: ${order.orderedByDoctorId}`}</span>
                        </div>
                        <div className="detail-item">
                            <label>Thời gian chỉ định:</label>
                            <span>{formatDateTime(order.orderedAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Thời gian lên lịch:</label>
                            <span>{formatDateTime(order.scheduledDatetime)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Trạng thái hoàn thành:</label>
                            <span className={order.completed ? 'completed-yes' : 'completed-no'}>
                                {order.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <label>Ngừng thuốc:</label>
                            <span className={order.isDiscontinued ? 'discontinued-yes' : 'discontinued-no'}>
                                {order.isDiscontinued ? 'Đã ngừng' : 'Đang tiếp tục'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin thực hiện */}
                {order.administeredDatetime && (
                    <div className="detail-section">
                        <h2><FiCheckCircle /> Thông tin thực hiện</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Điều dưỡng thực hiện:</label>
                                <span>{order.administeredByNurseName || `ID: ${order.administeredByNurseId}`}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian thực hiện:</label>
                                <span>{formatDateTime(order.administeredDatetime)}</span>
                            </div>
                        </div>
                        {order.administrationNotes && (
                            <div className="notes-section">
                                <label>Ghi chú thực hiện:</label>
                                <p>{order.administrationNotes}</p>
                            </div>
                        )}
                        {order.patientResponse && (
                            <div className="notes-section">
                                <label>Phản ứng bệnh nhân:</label>
                                <p>{order.patientResponse}</p>
                            </div>
                        )}
                        {order.adverseReaction && (
                            <div className="notes-section adverse-reaction">
                                <label>Phản ứng bất lợi:</label>
                                <p>{order.adverseReaction}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin dược sĩ */}
                {order.dispensedByPharmacistName && (
                    <div className="detail-section">
                        <h2><FiActivity /> Thông tin dược sĩ</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Dược sĩ phát thuốc:</label>
                                <span>{order.dispensedByPharmacistName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian phát thuốc:</label>
                                <span>{formatDateTime(order.dispensedAt)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Số lượng phát:</label>
                                <span>{order.quantityDispensed || '-'}</span>
                            </div>
                        </div>
                        {order.dispensingNotes && (
                            <div className="notes-section">
                                <label>Ghi chú phát thuốc:</label>
                                <p>{order.dispensingNotes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin ngừng thuốc */}
                {order.isDiscontinued && (
                    <div className="detail-section">
                        <h2><FiXCircle /> Thông tin ngừng thuốc</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Bác sĩ ngừng thuốc:</label>
                                <span>{order.discontinuedByDoctorName || `ID: ${order.discontinuedByDoctorId}`}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian ngừng:</label>
                                <span>{formatDateTime(order.discontinuedAt)}</span>
                            </div>
                        </div>
                        {order.discontinuationReason && (
                            <div className="notes-section">
                                <label>Lý do ngừng thuốc:</label>
                                <p>{order.discontinuationReason}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin thanh toán */}
                {(order.unitPrice || order.totalPrice) && (
                    <div className="detail-section">
                        <h2><FiDollarSign /> Thông tin thanh toán</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Đơn giá:</label>
                                <span>{order.unitPrice ? `${order.unitPrice.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Số lượng đặt:</label>
                                <span>{order.quantityOrdered || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Tổng tiền:</label>
                                <span>{order.totalPrice ? `${order.totalPrice.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Giảm giá:</label>
                                <span>{order.discountAmount ? `${order.discountAmount.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thành tiền:</label>
                                <span className="final-price">
                                    {order.finalPrice ? `${order.finalPrice.toLocaleString('vi-VN')} VNĐ` : '-'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Số tiền tính phí:</label>
                                <span>{order.billableAmount ? `${order.billableAmount.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Thông tin hệ thống */}
                <div className="detail-section">
                    <h2><FiInfo /> Thông tin hệ thống</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Ngày tạo:</label>
                            <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Cập nhật lần cuối:</label>
                            <span>{formatDateTime(order.updatedAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Version:</label>
                            <span>{order.version || '-'}</span>
                        </div>
                        {order.medicineBarcodeScanned && (
                            <div className="detail-item">
                                <label>Barcode thuốc:</label>
                                <span>{order.medicineBarcodeScanned}</span>
                            </div>
                        )}
                        {order.patientWristbandScanned && (
                            <div className="detail-item">
                                <label>Barcode vòng tay:</label>
                                <span>{order.patientWristbandScanned}</span>
                            </div>
                        )}
                        {order.barcodeScanDatetime && (
                            <div className="detail-item">
                                <label>Thời gian scan barcode:</label>
                                <span>{formatDateTime(order.barcodeScanDatetime)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cảnh báo quá hạn */}
                {order.overdue && (
                    <div className="overdue-warning">
                        <FiAlertCircle />
                        <span>Y lệnh này đã quá hạn thực hiện</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationOrderDetailPage;