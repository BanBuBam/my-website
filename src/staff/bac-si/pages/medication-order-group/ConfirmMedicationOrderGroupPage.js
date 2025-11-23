import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationOrderAPI } from '../../../../services/staff/doctorAPI';
import {
    FiCheckCircle,
    FiPackage,
    FiAlertCircle,
    FiArrowLeft,
    FiUser,
    FiCalendar,
    FiFileText,
    FiClock,
    FiTruck
} from 'react-icons/fi';
import './ConfirmMedicationOrderGroupPage.css';

const ConfirmMedicationOrderGroupPage = () => {
    const navigate = useNavigate();
    const [groupId, setGroupId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [confirmedGroup, setConfirmedGroup] = useState(null);

    const handleConfirm = async (e) => {
        e.preventDefault();
        
        if (!groupId || groupId.trim() === '') {
            setError('Vui lòng nhập mã nhóm y lệnh');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const response = await medicationOrderAPI.confirmMedicationOrderGroup(groupId);
            
            if (response && response.data) {
                setConfirmedGroup(response.data);
                setSuccess(true);
                setGroupId(''); // Reset input
            }
        } catch (err) {
            console.error('Error confirming medication order group:', err);
            setError(err.message || 'Không thể xác nhận nhóm y lệnh');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setGroupId('');
        setError(null);
        setSuccess(false);
        setConfirmedGroup(null);
    };

    const handleBack = () => {
        navigate('/staff/bac-si/dashboard');
    };

    const formatDateTime = (dateString) => {
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

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'VERIFIED': 'status-verified',
            'PREPARED': 'status-prepared',
            'DISPENSED': 'status-dispensed',
            'REJECTED': 'status-rejected',
            'HELD': 'status-held',
            'DISCONTINUED': 'status-discontinued',
            'ACTIVE': 'status-active',
            'COMPLETED': 'status-completed',
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

    return (
        <div className="confirm-medication-order-group-page">
            {/* Page Header */}
            <div className="page-header">
                <button className="btn-back-header" onClick={handleBack}>
                    <FiArrowLeft />
                    <span>Quay lại</span>
                </button>
                <div className="header-title">
                    <FiCheckCircle className="page-icon" />
                    <div>
                        <h1>Xác nhận nhóm y lệnh</h1>
                        <p>Nhập mã nhóm y lệnh để xác nhận</p>
                    </div>
                </div>
            </div>

            {/* Input Form */}
            <div className="input-section">
                <form onSubmit={handleConfirm}>
                    <div className="form-group">
                        <label htmlFor="groupId">
                            <FiPackage />
                            <span>Mã nhóm y lệnh</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="groupId"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                                placeholder="Nhập mã nhóm y lệnh..."
                                disabled={loading}
                            />
                            <button 
                                type="submit" 
                                className="btn-confirm"
                                disabled={loading || !groupId}
                            >
                                {loading ? (
                                    <>
                                        <FiClock className="spinning" />
                                        <span>Đang xác nhận...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle />
                                        <span>Xác nhận</span>
                                    </>
                                )}
                            </button>
                            {(success || error) && (
                                <button 
                                    type="button" 
                                    className="btn-reset"
                                    onClick={handleReset}
                                >
                                    Nhập mã khác
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="success-message">
                        <FiCheckCircle />
                        <span>Xác nhận nhóm y lệnh thành công!</span>
                    </div>
                )}
            </div>

            {/* Confirmed Group Details */}
            {confirmedGroup && (
                <div className="confirmed-group-details">
                    <h2>
                        <FiPackage />
                        <span>Thông tin nhóm y lệnh đã xác nhận</span>
                    </h2>

                    {/* Patient Information */}
                    <div className="info-section">
                        <h3><FiUser /> Thông tin bệnh nhân</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Tên bệnh nhân:</label>
                                <span>{confirmedGroup.patientName}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã bệnh nhân:</label>
                                <span>{confirmedGroup.patientId}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã lượt khám:</label>
                                <span>{confirmedGroup.encounterId}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã lượt nội trú:</label>
                                <span>{confirmedGroup.inpatientStayId || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="info-section">
                        <h3><FiFileText /> Thông tin y lệnh</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Mã nhóm y lệnh:</label>
                                <span className="highlight">#{confirmedGroup.medicationOrderGroupId}</span>
                            </div>
                            <div className="info-item">
                                <label>Ngày y lệnh:</label>
                                <span>{formatDateTime(confirmedGroup.orderDate)}</span>
                            </div>
                            <div className="info-item">
                                <label>Bác sĩ chỉ định:</label>
                                <span>{confirmedGroup.orderedByDoctorName}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian chỉ định:</label>
                                <span>{formatDateTime(confirmedGroup.orderedAt)}</span>
                            </div>
                            <div className="info-item">
                                <label>Trạng thái:</label>
                                <span className={`status-badge ${getStatusBadgeClass(confirmedGroup.status)}`}>
                                    {confirmedGroup.status}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>Độ ưu tiên:</label>
                                <span className={`priority-badge ${getPriorityBadgeClass(confirmedGroup.priority)}`}>
                                    {confirmedGroup.priority}
                                </span>
                            </div>
                        </div>
                        {confirmedGroup.orderNotes && (
                            <div className="notes-box">
                                <label>Ghi chú y lệnh:</label>
                                <p>{confirmedGroup.orderNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Verification Information */}
                    {confirmedGroup.verifiedByPharmacistId && (
                        <div className="info-section">
                            <h3><FiCheckCircle /> Thông tin xác minh</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Dược sĩ xác minh:</label>
                                    <span>{confirmedGroup.verifiedByPharmacistName}</span>
                                </div>
                                <div className="info-item">
                                    <label>Thời gian xác minh:</label>
                                    <span>{formatDateTime(confirmedGroup.verifiedAt)}</span>
                                </div>
                            </div>
                            {confirmedGroup.verificationNotes && (
                                <div className="notes-box">
                                    <label>Ghi chú xác minh:</label>
                                    <p>{confirmedGroup.verificationNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Medications List */}
                    {confirmedGroup.medications && confirmedGroup.medications.length > 0 && (
                        <div className="info-section">
                            <h3>
                                <FiPackage />
                                <span>Danh sách thuốc ({confirmedGroup.medicationCount})</span>
                            </h3>
                            <div className="medications-table-container">
                                <table className="medications-table">
                                    <thead>
                                        <tr>
                                            <th>Tên thuốc</th>
                                            <th>Liều lượng</th>
                                            <th>Đường dùng</th>
                                            <th>Tần suất</th>
                                            <th>Số lượng</th>
                                            <th>Trạng thái</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {confirmedGroup.medications.map((medication, index) => (
                                            <tr key={medication.medicationOrderId || index}>
                                                <td>
                                                    <strong>{medication.medicineName}</strong>
                                                    {medication.specialInstructions && (
                                                        <div className="special-instructions">
                                                            {medication.specialInstructions}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{medication.dosage}</td>
                                                <td>{medication.routeDisplay || medication.route}</td>
                                                <td>{medication.frequency}</td>
                                                <td>{medication.quantityOrdered}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusBadgeClass(medication.status)}`}>
                                                        {medication.statusDisplay || medication.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>{formatCurrency(medication.finalPrice || medication.totalPrice)}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConfirmMedicationOrderGroupPage;

