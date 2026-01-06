import React, { useState, useEffect } from 'react';
import './AdminDashboardPage.css';
import {
    FiUsers, FiActivity, FiClock, FiRefreshCw, FiAlertCircle,
    FiCheckCircle, FiTrendingUp, FiBarChart2,
    FiBell, FiPackage, FiCalendar, FiDollarSign, FiHome
} from 'react-icons/fi';
import { adminDashboardAPI } from '../../../../services/staff/adminAPI';

const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Data states
    const [summaryData, setSummaryData] = useState(null);
    const [departmentsData, setDepartmentsData] = useState(null);
    const [alertsData, setAlertsData] = useState(null);
    const [resourcesData, setResourcesData] = useState(null);
    const [activitiesData, setActivitiesData] = useState(null);

    // Filters
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [alertTypeFilter, setAlertTypeFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [resourceTypeFilter, setResourceTypeFilter] = useState('');
    const [activityTypeFilter, setActivityTypeFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 20;

    // Fetch data based on active tab
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            switch (activeTab) {
                case 'summary':
                    const summaryRes = await adminDashboardAPI.getSummary();
                    if (summaryRes?.data) setSummaryData(summaryRes.data);
                    break;
                case 'departments':
                    const deptRes = await adminDashboardAPI.getDepartments(currentPage, pageSize, departmentFilter || null);
                    if (deptRes?.data) setDepartmentsData(deptRes.data);
                    break;
                case 'alerts':
                    const alertsRes = await adminDashboardAPI.getAlerts(currentPage, pageSize, alertTypeFilter || null, severityFilter || null);
                    if (alertsRes?.data) setAlertsData(alertsRes.data);
                    break;
                case 'resources':
                    const resourcesRes = await adminDashboardAPI.getResources(currentPage, pageSize, resourceTypeFilter || null);
                    if (resourcesRes?.data) setResourcesData(resourcesRes.data);
                    break;
                case 'activities':
                    const activitiesRes = await adminDashboardAPI.getActivities(currentPage, pageSize, activityTypeFilter || null);
                    if (activitiesRes?.data) setActivitiesData(activitiesRes.data);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage, departmentFilter, alertTypeFilter, severityFilter, resourceTypeFilter, activityTypeFilter]);

    // Format date time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(0);
    };

    const handleRefresh = () => {
        fetchData();
    };

    const getSeverityColor = (severity) => {
        const severityMap = { 'CRITICAL': 'critical', 'HIGH': 'high', 'MEDIUM': 'medium', 'LOW': 'low' };
        return severityMap[severity] || 'low';
    };

    const getDepartmentStatusColor = (status) => {
        const statusMap = { 'EXCELLENT': 'excellent', 'GOOD': 'good', 'NORMAL': 'normal', 'BUSY': 'busy', 'OVERLOADED': 'overload' };
        return statusMap[status] || 'normal';
    };

    const getDepartmentStatusLabel = (status) => {
        const labelMap = { 'EXCELLENT': 'Xuất sắc', 'GOOD': 'Tốt', 'NORMAL': 'Bình thường', 'BUSY': 'Bận', 'OVERLOADED': 'Quá tải' };
        return labelMap[status] || status;
    };

    const getActivityIcon = (category) => {
        const iconMap = {
            'PATIENT': <FiUsers />, 'ENCOUNTER': <FiActivity />, 'BOOKING': <FiCalendar />, 'PAYMENT': <FiDollarSign />, 'SYSTEM': <FiAlertCircle />
        };
        return iconMap[category] || <FiActivity />;
    };

    return (
        <div className="admin-dashboard">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>📊 Dashboard Quản lý</h2>
                    <p>Tổng quan hoạt động và hiệu suất hệ thống</p>
                </div>
                <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                    <FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs-container">
                <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => handleTabChange('summary')}>
                    <FiHome /> Tổng quan
                </button>
                <button className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => handleTabChange('departments')}>
                    <FiActivity /> Hiệu suất các khoa
                </button>
                <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => handleTabChange('alerts')}>
                    <FiBell /> Cảnh báo hệ thống
                </button>
                <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => handleTabChange('resources')}>
                    <FiPackage /> Tài nguyên
                </button>
                <button className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => handleTabChange('activities')}>
                    <FiClock /> Hoạt động
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {loading && (
                    <div className="loading-overlay">
                        <FiRefreshCw className="spin" size={32} color="#3b82f6" />
                        <p style={{ marginTop: '10px', color: '#6b7280' }}>Đang tải...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <FiAlertCircle /> <p>{error}</p>
                    </div>
                )}

                {/* Summary Tab - Updated Layout */}
                {activeTab === 'summary' && summaryData && (
                    <div className="summary-tab">
                        {/* Section 1: Encounters - Tiêu đề nằm ngoài grid */}
                        <div className="dashboard-section">
                            <h3 className="section-title"><FiCalendar /> Lượt khám hôm nay</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon blue"><FiCalendar /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Đã lên lịch</span>
                                        <span className="stat-value">{summaryData.scheduledEncounters || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green"><FiCheckCircle /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Đã đến</span>
                                        <span className="stat-value">{summaryData.arrivedEncounters || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange"><FiActivity /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Đang khám</span>
                                        <span className="stat-value">{summaryData.inProgressEncounters || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon purple"><FiTrendingUp /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Sẵn sàng xuất viện</span>
                                        <span className="stat-value">{summaryData.readyForDischargeEncounters || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon success"><FiCheckCircle /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Đã xuất viện</span>
                                        <span className="stat-value">{summaryData.dischargedEncounters || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon danger"><FiAlertCircle /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Đã hủy</span>
                                        <span className="stat-value">{summaryData.cancelledEncounters || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Performance - Tiêu đề nằm ngoài grid */}
                        <div className="dashboard-section">
                            <h3 className="section-title"><FiBarChart2 /> Hiệu suất hoạt động</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon blue"><FiClock /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Thời gian chờ TB</span>
                                        <span className="stat-value">{summaryData.averageWaitTimeMinutes || 0} phút</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green"><FiActivity /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Thời gian khám TB</span>
                                        <span className="stat-value">{summaryData.averageExamTimeMinutes || 0} phút</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange"><FiTrendingUp /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Thông lượng BN/giờ</span>
                                        <span className="stat-value">{summaryData.patientThroughputPerHour || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon purple"><FiBarChart2 /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Công suất sử dụng</span>
                                        <span className="stat-value">{summaryData.capacityUtilization || 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Departments Tab */}
                {activeTab === 'departments' && departmentsData && (
                    <div className="departments-tab">
                        <div className="filter-section">
                            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="filter-select">
                                <option value="">Tất cả trạng thái</option>
                                <option value="EXCELLENT">Xuất sắc</option>
                                <option value="GOOD">Tốt</option>
                                <option value="NORMAL">Bình thường</option>
                                <option value="BUSY">Bận</option>
                                <option value="OVERLOADED">Quá tải</option>
                            </select>
                        </div>
                        <div className="departments-list">
                            {departmentsData.content?.map((dept) => (
                                <div key={dept.departmentId} className="department-card">
                                    <div className="dept-header">
                                        <h4>{dept.departmentName}</h4>
                                        <span className={`status-badge ${getDepartmentStatusColor(dept.performanceStatus)}`} 
                                              style={{padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', 
                                              color: getDepartmentStatusColor(dept.performanceStatus) === 'excellent' ? '#059669' : 
                                                     getDepartmentStatusColor(dept.performanceStatus) === 'good' ? '#16a34a' : 
                                                     getDepartmentStatusColor(dept.performanceStatus) === 'normal' ? '#3b82f6' : 
                                                     getDepartmentStatusColor(dept.performanceStatus) === 'busy' ? '#d97706' : '#dc2626',
                                              backgroundColor: '#f3f4f6'}}>
                                            {getDepartmentStatusLabel(dept.performanceStatus)}
                                        </span>
                                    </div>
                                    <div className="dept-stats">
                                        <div className="dept-stat"><span className="label">Đang khám</span><span className="value">{dept.activeEncounters || 0}</span></div>
                                        <div className="dept-stat"><span className="label">Hoàn thành</span><span className="value">{dept.completedEncounters || 0}</span></div>
                                        <div className="dept-stat"><span className="label">Đang chờ</span><span className="value">{dept.waitingPatients || 0}</span></div>
                                        <div className="dept-stat"><span className="label">Tải công việc</span><span className="value">{dept.workloadPercentage || 0}%</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {departmentsData.totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0}>Trước</button>
                                <span>Trang {currentPage + 1} / {departmentsData.totalPages}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(departmentsData.totalPages - 1, prev + 1))} disabled={currentPage >= departmentsData.totalPages - 1}>Sau</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Alerts Tab */}
                {activeTab === 'alerts' && alertsData && (
                    <div className="alerts-tab">
                        <div className="filter-section">
                            <select value={alertTypeFilter} onChange={(e) => setAlertTypeFilter(e.target.value)} className="filter-select">
                                <option value="">Tất cả loại cảnh báo</option>
                                <option value="STUCK_ENCOUNTER">Lượt khám bị kẹt</option>
                                <option value="HIGH_WORKLOAD">Tải công việc cao</option>
                                <option value="LONG_WAIT_TIME">Thời gian chờ dài</option>
                                <option value="LOW_BEDS">Giường bệnh thấp</option>
                                <option value="SYSTEM_ERROR">Lỗi hệ thống</option>
                            </select>
                            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="filter-select">
                                <option value="">Tất cả mức độ</option>
                                <option value="CRITICAL">Nghiêm trọng</option>
                                <option value="HIGH">Cao</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="LOW">Thấp</option>
                            </select>
                        </div>
                        <div className="alerts-list">
                            {alertsData.content?.map((alert, index) => (
                                <div key={index} className={`alert-card ${getSeverityColor(alert.severity)}`}>
                                    <div style={{flex: 1}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                                            <span style={{fontWeight: 'bold', fontSize: '0.8rem', color: '#4b5563'}}>{alert.severity}</span>
                                            <span style={{fontSize: '0.8rem', color: '#9ca3af'}}>{formatDateTime(alert.detectedAt)}</span>
                                        </div>
                                        <h4 style={{margin: '0 0 0.25rem 0', fontSize: '1rem'}}>{alert.alertType}</h4>
                                        <p style={{margin: 0, fontSize: '0.9rem', color: '#4b5563'}}>{alert.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && resourcesData && (
                    <div className="resources-tab">
                        <div className="filter-section">
                            <select value={resourceTypeFilter} onChange={(e) => setResourceTypeFilter(e.target.value)} className="filter-select">
                                <option value="">Tất cả loại tài nguyên</option>
                                <option value="BED">Giường bệnh</option>
                                <option value="DOCTOR">Bác sĩ</option>
                                <option value="NURSE">Điều dưỡng</option>
                                <option value="EQUIPMENT">Thiết bị</option>
                            </select>
                        </div>
                        <div className="resources-list">
                            {resourcesData.content?.map((resource, index) => (
                                <div key={index} className="resource-card">
                                    <h4 style={{margin: '0 0 1rem 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem'}}>{resource.resourceType}</h4>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{color: '#6b7280', fontSize: '0.9rem'}}>Tổng số:</span><strong>{resource.totalCount}</strong></div>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{color: '#6b7280', fontSize: '0.9rem'}}>Đang dùng:</span><strong style={{color: '#3b82f6'}}>{resource.inUseCount}</strong></div>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{color: '#6b7280', fontSize: '0.9rem'}}>Khả dụng:</span><strong style={{color: '#10b981'}}>{resource.availableCount}</strong></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activities Tab */}
                {activeTab === 'activities' && activitiesData && (
                    <div className="activities-tab">
                        <div className="filter-section">
                            <select value={activityTypeFilter} onChange={(e) => setActivityTypeFilter(e.target.value)} className="filter-select">
                                <option value="">Tất cả loại hoạt động</option>
                                <option value="PATIENT_CHECKIN">Bệnh nhân check-in</option>
                                <option value="PATIENT_DISCHARGE">Bệnh nhân xuất viện</option>
                                <option value="BOOKING_CREATED">Tạo đặt lịch</option>
                                <option value="ENCOUNTER_STARTED">Bắt đầu lượt khám</option>
                            </select>
                        </div>
                        <div className="activities-list">
                            {activitiesData.content?.map((activity, index) => (
                                <div key={index} className="activity-card">
                                    <div className="activity-icon">{getActivityIcon(activity.category)}</div>
                                    <div style={{flex: 1}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                                            <h4 style={{margin: 0, fontSize: '0.95rem'}}>{activity.description}</h4>
                                            <span style={{fontSize: '0.8rem', color: '#9ca3af'}}>{formatDateTime(activity.occurredAt)}</span>
                                        </div>
                                        <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                                            {activity.patientName && <div>BN: {activity.patientName}</div>}
                                            {activity.departmentName && <div>Khoa: {activity.departmentName}</div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {activitiesData.totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0}>Trước</button>
                                <span>Trang {currentPage + 1} / {activitiesData.totalPages}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(activitiesData.totalPages - 1, prev + 1))} disabled={currentPage >= activitiesData.totalPages - 1}>Sau</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;