import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import {
    FiPackage,
    FiAlertCircle,
    FiEye,
    FiUser,
    FiCalendar,
    FiClock,
    FiFileText
} from 'react-icons/fi';
import './MedicationOrderGroupsListPage.css';

const MedicationOrderGroupsListPage = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingGroups();
    }, []);

    const fetchPendingGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await medicationOrderGroupAPI.getPendingVerificationGroups();
            if (response && response.data) {
                setGroups(response.data);
            }
        } catch (err) {
            console.error('Error loading medication order groups:', err);
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh');
        } finally {
            setLoading(false);
        }
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

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'VERIFIED': 'status-verified',
            'PREPARED': 'status-prepared',
            'DISPENSED': 'status-dispensed',
            'REJECTED': 'status-rejected',
            'HELD': 'status-held',
            'DISCONTINUED': 'status-discontinued',
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

    const handleViewDetail = (groupId) => {
        navigate(`/staff/duoc-si/danh-sach-y-lenh-theo-nhom/${groupId}`);
    };

    if (loading) {
        return (
            <div className="medication-order-groups-list-page">
                <div className="page-header">
                    <div className="header-content">
                        <div className="title-section">
                            <FiPackage className="page-icon" />
                            <div>
                                <h1>Danh sách y lệnh theo nhóm</h1>
                                <p>Quản lý và xác minh các nhóm y lệnh đang chờ phê duyệt</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="loading-state">
                    <p>Đang tải danh sách nhóm y lệnh...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="medication-order-groups-list-page">
                <div className="page-header">
                    <div className="header-content">
                        <div className="title-section">
                            <FiPackage className="page-icon" />
                            <div>
                                <h1>Danh sách y lệnh theo nhóm</h1>
                                <p>Quản lý và xác minh các nhóm y lệnh đang chờ phê duyệt</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={fetchPendingGroups} className="btn-retry">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="medication-order-groups-list-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="title-section">
                        <FiPackage className="page-icon" />
                        <div>
                            <h1>Danh sách y lệnh theo nhóm</h1>
                            <p>Quản lý và xác minh các nhóm y lệnh đang chờ phê duyệt</p>
                        </div>
                    </div>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="empty-state">
                    <FiAlertCircle />
                    <p>Không có nhóm y lệnh nào đang chờ xác minh</p>
                </div>
            ) : (
                <div className="groups-grid">
                    {groups.map((group) => (
                        <div key={group.medicationOrderGroupId} className="group-card">
                            <div className="card-header">
                                <div className="group-id">
                                    <FiPackage />
                                    <span>Nhóm y lệnh #{group.medicationOrderGroupId}</span>
                                </div>
                                <div className="badges">
                                    <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                                        {group.status}
                                    </span>
                                    <span className={`priority-badge ${getPriorityBadgeClass(group.priority)}`}>
                                        {group.priority}
                                    </span>
                                    {group.isStat && (
                                        <span className="stat-badge">STAT</span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <FiUser className="info-icon" />
                                    <div className="info-content">
                                        <label>Bệnh nhân:</label>
                                        <span>{group.patientName} (ID: {group.patientId})</span>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <FiCalendar className="info-icon" />
                                    <div className="info-content">
                                        <label>Ngày y lệnh:</label>
                                        <span>{formatDateTime(group.orderDate)}</span>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <FiUser className="info-icon" />
                                    <div className="info-content">
                                        <label>Bác sĩ chỉ định:</label>
                                        <span>{group.orderedByDoctorName}</span>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <FiPackage className="info-icon" />
                                    <div className="info-content">
                                        <label>Số lượng thuốc:</label>
                                        <span>{group.medicationCount} thuốc</span>
                                    </div>
                                </div>

                                {group.orderNotes && (
                                    <div className="info-row notes">
                                        <FiFileText className="info-icon" />
                                        <div className="info-content">
                                            <label>Ghi chú:</label>
                                            <span>{group.orderNotes}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button
                                    className="btn-view-detail"
                                    onClick={() => handleViewDetail(group.medicationOrderGroupId)}
                                >
                                    <FiEye />
                                    <span>Xem chi tiết</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicationOrderGroupsListPage;

