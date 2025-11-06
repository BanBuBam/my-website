import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingDetailPage.css';
import {
    FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar,
    FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiInfo,
    FiUserCheck
} from 'react-icons/fi';
import { receptionistBookingAPI } from '../../../../services/staff/receptionistAPI';

const BookingDetailPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingEncounter, setLoadingEncounter] = useState(false);
    const [error, setError] = useState(null);
    const [encounterError, setEncounterError] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [discharging, setDischarging] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [disposition, setDisposition] = useState('HOME');
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        fetchBookingDetail();
        fetchEncounter();
    }, [bookingId]);

    const fetchBookingDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await receptionistBookingAPI.getBookingDetail(bookingId);

            if (response && response.data) {
                setBooking(response.data);
            }
        } catch (err) {
            console.error('Error fetching booking detail:', err);
            setError(err.message || 'Không thể tải chi tiết booking');
        } finally {
            setLoading(false);
        }
    };

    const fetchEncounter = async () => {
        try {
            setLoadingEncounter(true);
            setEncounterError(null);
            const response = await receptionistBookingAPI.getEncounterByBooking(bookingId);

            if (response && response.data) {
                setEncounter(response.data);
            }
        } catch (err) {
            console.error('Error fetching encounter:', err);
            setEncounterError(err.message || 'Không tìm thấy encounter cho booking này');
            setEncounter(null);
        } finally {
            setLoadingEncounter(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xác nhận booking này?')) {
            return;
        }

        try {
            setConfirming(true);
            const response = await receptionistBookingAPI.confirmBooking(bookingId);

            if (response && response.data) {
                setBooking(response.data);
                alert('Xác nhận booking thành công!');
                // Refresh encounter after confirming
                fetchEncounter();
            }
        } catch (err) {
            console.error('Error confirming booking:', err);
            alert(err.message || 'Không thể xác nhận booking');
        } finally {
            setConfirming(false);
        }
    };

    const handleCheckIn = async () => {
        if (!encounter || !encounter.encounterId) {
            alert('Không tìm thấy encounter để check-in');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn check-in bệnh nhân này?')) {
            return;
        }

        try {
            setCheckingIn(true);
            const response = await receptionistBookingAPI.checkInPatient(encounter.encounterId);

            if (response && response.data) {
                setEncounter(response.data);
                alert('Check-in bệnh nhân thành công!');
                // Refresh booking detail
                fetchBookingDetail();
            }
        } catch (err) {
            console.error('Error checking in patient:', err);
            alert(err.message || 'Không thể check-in bệnh nhân');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleDischarge = async () => {
        if (!encounter || !encounter.encounterId) {
            alert('Không tìm thấy encounter để discharge');
            return;
        }

        try {
            setDischarging(true);
            const response = await receptionistBookingAPI.dischargeEncounter(encounter.encounterId, disposition);

            if (response && response.data) {
                setEncounter(response.data);
                alert('Discharge encounter thành công!');
                setShowDischargeModal(false);
                setDisposition('HOME');
                // Refresh booking detail
                fetchBookingDetail();
            }
        } catch (err) {
            console.error('Error discharging encounter:', err);
            alert(err.message || 'Không thể discharge encounter');
        } finally {
            setDischarging(false);
        }
    };

    const handleCancel = async () => {
        if (!encounter || !encounter.encounterId) {
            alert('Không tìm thấy encounter để cancel');
            return;
        }

        if (!cancelReason.trim()) {
            alert('Vui lòng nhập lý do hủy');
            return;
        }

        try {
            setCancelling(true);
            const response = await receptionistBookingAPI.cancelEncounter(encounter.encounterId, cancelReason);

            if (response && response.data) {
                setEncounter(response.data);
                alert('Cancel encounter thành công!');
                setShowCancelModal(false);
                setCancelReason('');
                // Refresh booking detail
                fetchBookingDetail();
            }
        } catch (err) {
            console.error('Error cancelling encounter:', err);
            alert(err.message || 'Không thể cancel encounter');
        } finally {
            setCancelling(false);
        }
    };

    const handleBack = () => {
        navigate('/staff/le-tan/booking');
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status, statusDescription) => {
        const statusMap = {
            'PENDING': { class: 'badge-pending', icon: <FiClock />, text: statusDescription || 'Chờ xác nhận' },
            'CONFIRMED': { class: 'badge-confirmed', icon: <FiCheckCircle />, text: statusDescription || 'Đã xác nhận' },
            'CANCELLED': { class: 'badge-cancelled', icon: <FiXCircle />, text: statusDescription || 'Đã hủy' },
            'NO_SHOW': { class: 'badge-no-show', icon: <FiAlertCircle />, text: statusDescription || 'Không đến khám' },
            'COMPLETED': { class: 'badge-completed', icon: <FiCheckCircle />, text: statusDescription || 'Hoàn thành' },
        };

        const statusInfo = statusMap[status] || { class: 'badge-default', icon: <FiAlertCircle />, text: statusDescription || status };

        return (
            <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusInfo.text}
            </span>
        );
    };

    const getSourceBadge = (source) => {
        const sourceMap = {
            'ONLINE': 'Đặt lịch Online',
            'WEB': 'Đặt lịch Web',
            'WALK_IN': 'Tại quầy',
            'PHONE': 'Qua điện thoại',
        };
        return sourceMap[source] || source;
    };

    if (loading) {
        return (
            <div className="booking-detail-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải chi tiết booking...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="booking-detail-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error || 'Không tìm thấy thông tin booking'}</p>
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-detail-page">
            {/* Header Actions */}
            <div className="page-header">
                <div>
                    <h2>Chi tiết Booking #{booking.bookingId}</h2>
                    <p>Thông tin chi tiết lịch hẹn khám bệnh</p>
                </div>
                <div className="header-actions">
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại
                    </button>
                    {booking.status === 'PENDING' && (
                        <button 
                            className="btn-confirm" 
                            onClick={handleConfirmBooking}
                            disabled={confirming}
                        >
                            <FiUserCheck /> {confirming ? 'Đang xác nhận...' : 'Xác nhận Booking'}
                        </button>
                    )}
                </div>
            </div>

            {/* Status Card */}
            <div className="status-card">
                <div className="status-info">
                    <span className="status-label">Trạng thái:</span>
                    {getStatusBadge(booking.status, booking.statusDescription)}
                </div>
                <div className="status-info">
                    <span className="status-label">Nguồn đặt lịch:</span>
                    <span className="source-text">{getSourceBadge(booking.bookingSource)}</span>
                </div>
                <div className="status-info">
                    <span className="status-label">Ngày tạo:</span>
                    <span className="date-text">{formatDateTime(booking.createdAt)}</span>
                </div>
                <div className="status-info">
                    <span className="status-label">Cập nhật lần cuối:</span>
                    <span className="date-text">{formatDateTime(booking.updatedAt)}</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="detail-grid">
                {/* Patient Information */}
                <div className="detail-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Thông tin Bệnh nhân</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="info-label">Mã bệnh nhân:</span>
                            <span className="info-value">{booking.patient.patientCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Họ và tên:</span>
                            <span className="info-value strong">{booking.patient.fullName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Số điện thoại:</span>
                            <span className="info-value">
                                <FiPhone /> {booking.patient.phoneNumber}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">
                                <FiMail /> {booking.patient.email || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Doctor Information */}
                <div className="detail-card">
                    <div className="card-header">
                        <FiUserCheck />
                        <h3>Thông tin Bác sĩ</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="info-label">Mã nhân viên:</span>
                            <span className="info-value">{booking.doctor.employeeCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Họ và tên:</span>
                            <span className="info-value strong">{booking.doctor.fullName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Chuyên khoa:</span>
                            <span className="info-value">{booking.doctor.specialization}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Số điện thoại:</span>
                            <span className="info-value">
                                <FiPhone /> {booking.doctor.phoneNumber}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Department Information */}
                <div className="detail-card">
                    <div className="card-header">
                        <FiMapPin />
                        <h3>Thông tin Khoa/Phòng</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="info-label">Tên khoa:</span>
                            <span className="info-value strong">{booking.department.departmentName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Bệnh viện:</span>
                            <span className="info-value">{booking.department.hospitalName}</span>
                        </div>
                    </div>
                </div>

                {/* Appointment Information */}
                <div className="detail-card">
                    <div className="card-header">
                        <FiCalendar />
                        <h3>Thông tin Lịch hẹn</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="info-label">Thời gian hẹn:</span>
                            <span className="info-value strong">
                                <FiClock /> {formatDateTime(booking.scheduledDatetime)}
                            </span>
                        </div>
                        {booking.cancellationReason && (
                            <div className="info-row">
                                <span className="info-label">Lý do hủy:</span>
                                <span className="info-value cancellation-reason">
                                    <FiInfo /> {booking.cancellationReason}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Encounter Information */}
            {loadingEncounter && (
                <div className="encounter-section">
                    <h3>Thông tin Encounter</h3>
                    <div className="loading-state-small">
                        <div className="spinner-small"></div>
                        <p>Đang tải thông tin encounter...</p>
                    </div>
                </div>
            )}

            {!loadingEncounter && encounterError && (
                <div className="encounter-section">
                    <h3>Thông tin Encounter</h3>
                    <div className="info-message">
                        <FiInfo />
                        <p>{encounterError}</p>
                    </div>
                </div>
            )}

            {!loadingEncounter && !encounterError && encounter && (
                <div className="encounter-section">
                    <div className="encounter-header">
                        <h3>Thông tin Encounter</h3>
                        <div className="encounter-actions">
                            {encounter.canCheckIn && booking.status === 'CONFIRMED' && (
                                <button
                                    className="btn-checkin"
                                    onClick={handleCheckIn}
                                    disabled={checkingIn}
                                >
                                    <FiUserCheck /> {checkingIn ? 'Đang check-in...' : 'Check-in bệnh nhân'}
                                </button>
                            )}
                            {encounter.canDischarge && (
                                <button
                                    className="btn-discharge"
                                    onClick={() => setShowDischargeModal(true)}
                                    disabled={discharging}
                                >
                                    <FiCheckCircle /> Discharge
                                </button>
                            )}
                            {encounter.canCancel && (
                                <button
                                    className="btn-cancel-encounter"
                                    onClick={() => setShowCancelModal(true)}
                                    disabled={cancelling}
                                >
                                    <FiXCircle /> Hủy Encounter
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="encounter-grid">
                        {/* Encounter Status Card */}
                        <div className="detail-card">
                            <div className="card-header">
                                <FiInfo />
                                <h3>Trạng thái Encounter</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Encounter ID:</span>
                                    <span className="info-value strong">{encounter.encounterId}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Loại encounter:</span>
                                    <span className="info-value">{encounter.encounterType}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className="info-value">
                                        {getStatusBadge(encounter.status, encounter.statusDescription)}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phiên bản:</span>
                                    <span className="info-value">v{encounter.version}</span>
                                </div>
                            </div>
                        </div>

                        {/* Encounter Timeline */}
                        <div className="detail-card">
                            <div className="card-header">
                                <FiClock />
                                <h3>Thời gian</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Bắt đầu:</span>
                                    <span className="info-value">{formatDateTime(encounter.startDatetime)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Kết thúc:</span>
                                    <span className="info-value">
                                        {encounter.endDatetime ? formatDateTime(encounter.endDatetime) : '-'}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tạo lúc:</span>
                                    <span className="info-value">{formatDateTime(encounter.createdAt)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Cập nhật lúc:</span>
                                    <span className="info-value">{formatDateTime(encounter.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Encounter Details */}
                        <div className="detail-card">
                            <div className="card-header">
                                <FiMapPin />
                                <h3>Chi tiết</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Khoa:</span>
                                    <span className="info-value">{encounter.departmentName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Loại khám:</span>
                                    <span className="info-value">{encounter.visitType || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Vị trí:</span>
                                    <span className="info-value">{encounter.location || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Disposition:</span>
                                    <span className="info-value">{encounter.disposition || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Created By */}
                        <div className="detail-card">
                            <div className="card-header">
                                <FiUserCheck />
                                <h3>Người tạo</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Nhân viên:</span>
                                    <span className="info-value strong">{encounter.createdByEmployeeName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Mã nhân viên:</span>
                                    <span className="info-value">{encounter.createdByEmployeeId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Available */}
                    {encounter.nextPossibleActions && encounter.nextPossibleActions.length > 0 && (
                        <div className="actions-available">
                            <h4>Hành động có thể thực hiện:</h4>
                            <div className="action-badges">
                                {encounter.nextPossibleActions.map((action, index) => (
                                    <span key={index} className="action-badge">{action}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Capabilities */}
                    <div className="capabilities-info">
                        <div className="capability-item">
                            <span className={encounter.canCheckIn ? 'can-do' : 'cannot-do'}>
                                {encounter.canCheckIn ? <FiCheckCircle /> : <FiXCircle />}
                                Có thể Check-in
                            </span>
                        </div>
                        <div className="capability-item">
                            <span className={encounter.canDischarge ? 'can-do' : 'cannot-do'}>
                                {encounter.canDischarge ? <FiCheckCircle /> : <FiXCircle />}
                                Có thể Discharge
                            </span>
                        </div>
                        <div className="capability-item">
                            <span className={encounter.canCancel ? 'can-do' : 'cannot-do'}>
                                {encounter.canCancel ? <FiCheckCircle /> : <FiXCircle />}
                                Có thể Hủy
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Discharge Modal */}
            {showDischargeModal && (
                <div className="modal-overlay" onClick={() => setShowDischargeModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Discharge Encounter</h3>
                            <button className="modal-close" onClick={() => setShowDischargeModal(false)}>
                                <FiXCircle />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="disposition">Disposition: <span className="required">*</span></label>
                                <select
                                    id="disposition"
                                    value={disposition}
                                    onChange={(e) => setDisposition(e.target.value)}
                                    className="form-select"
                                    required
                                >
                                    <option value="HOME">HOME - Về nhà</option>
                                    <option value="TRANSFER">TRANSFER - Chuyển viện</option>
                                    <option value="ADMITTED">ADMITTED - Nhập viện</option>
                                    <option value="LEFT_AMA">LEFT_AMA - Tự ý về</option>
                                    <option value="EXPIRED">EXPIRED - Tử vong</option>
                                    <option value="OTHER">OTHER - Khác</option>
                                </select>
                                <p className="form-help-text">
                                    Chọn hướng xử lý sau khi discharge bệnh nhân
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowDischargeModal(false)}
                                disabled={discharging}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleDischarge}
                                disabled={discharging}
                            >
                                <FiCheckCircle /> {discharging ? 'Đang xử lý...' : 'Xác nhận Discharge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Hủy Encounter</h3>
                            <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                                <FiXCircle />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="cancelReason">Lý do hủy: <span className="required">*</span></label>
                                <textarea
                                    id="cancelReason"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Nhập lý do hủy encounter..."
                                    className="form-textarea"
                                    rows="4"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                            >
                                Đóng
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleCancel}
                                disabled={cancelling || !cancelReason.trim()}
                            >
                                <FiXCircle /> {cancelling ? 'Đang xử lý...' : 'Xác nhận Hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetailPage;

