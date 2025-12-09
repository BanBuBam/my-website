import React, { useState, useEffect } from 'react';
import { doctorFollowUpAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import './ViewFollowUpsModal.css';

const ViewFollowUpsModal = ({ isOpen, onClose, encounterId }) => {
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && encounterId) {
            fetchFollowUps();
        }
    }, [isOpen, encounterId]);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const response = await doctorFollowUpAPI.getFollowUpsByEncounter(encounterId);
            if (response && response.data) {
                setFollowUps(response.data);
            }
        } catch (err) {
            console.error('Error loading follow-ups:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content view-follow-ups-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><FiCalendar /> Danh sách lịch tái khám</h3>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : followUps.length === 0 ? (
                        <div className="empty"><FiAlertCircle /> Chưa có lịch tái khám</div>
                    ) : (
                        <div className="follow-ups-list">
                            {followUps.map((item) => (
                                <div key={item.reExaminationAppointmentId} className="follow-up-item">
                                    <div className="item-header">
                                        <span className="date">{formatDate(item.reExaminationDate)}</span>
                                        <span className={`status status-${item.status?.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="item-body">
                                        <p><strong>Lý do:</strong> {item.reason}</p>
                                        <p><strong>Bác sĩ:</strong> {item.doctorName}</p>
                                        {item.notes && <p><strong>Ghi chú:</strong> {item.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewFollowUpsModal;
