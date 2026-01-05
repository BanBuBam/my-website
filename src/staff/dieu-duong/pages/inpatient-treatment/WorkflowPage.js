import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiActivity, FiCheckCircle,
    FiClock, FiUser, FiTrendingUp, FiPlay, FiX, FiInfo, FiXCircle
} from 'react-icons/fi';
import './WorkflowPage.css';

const WorkflowPage = () => {
    const [workflowSteps, setWorkflowSteps] = useState([]);
    const [workflowProgress, setWorkflowProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initializing, setInitializing] = useState(false);
    const [startingStepId, setStartingStepId] = useState(null);
    const [completingStepId, setCompletingStepId] = useState(null);
    const [skippingStepId, setSkippingStepId] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showSkipDialog, setShowSkipDialog] = useState(false);
    const [skipReason, setSkipReason] = useState('');
    const [skipStepData, setSkipStepData] = useState(null);

    const { stayId } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchWorkflowData();
    }, [stayId]);

    const fetchWorkflowData = async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Gọi cả 2 API song song
            const [stepsResponse, progressResponse] = await Promise.all([
                nurseInpatientStayAPI.getWorkflowSteps(stayId),
                nurseInpatientStayAPI.getWorkflowProgress(stayId)
            ]);

            if (stepsResponse && stepsResponse.data) {
                setWorkflowSteps(stepsResponse.data);
            } else {
                setWorkflowSteps([]);
            }

            if (progressResponse && progressResponse.data) {
                setWorkflowProgress(progressResponse.data);
            } else {
                setWorkflowProgress([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải dữ liệu workflow');
            setWorkflowSteps([]);
            setWorkflowProgress([]);
        } finally {
            setLoading(false);
        }
    };

    // Khởi tạo workflow
    const handleInitializeWorkflow = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn khởi tạo workflow cho lượt điều trị này?')) {
            return;
        }

        setInitializing(true);

        try {
            const response = await nurseInpatientStayAPI.initializeWorkflow(stayId);

            if (response && response.data) {
                alert('Khởi tạo workflow thành công!');
                // Refresh danh sách
                await fetchWorkflowData();
            }
        } catch (err) {
            alert(err.message || 'Không thể khởi tạo workflow');
        } finally {
            setInitializing(false);
        }
    };

    // Xem chi tiết workflow step
    const handleViewStepDetail = async (stepId) => {
        setLoadingDetail(true);
        setShowDetailModal(true);
        setSelectedStep(null);

        try {
            const response = await nurseInpatientStayAPI.getWorkflowStepDetail(stepId);

            if (response && response.data) {
                setSelectedStep(response.data);
            }
        } catch (err) {
            alert(err.message || 'Không thể tải chi tiết workflow step');
            setShowDetailModal(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Bắt đầu workflow step
    const handleStartStep = async (stepId, stepName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn bắt đầu bước "${stepName}"?`)) {
            return;
        }

        setStartingStepId(stepId);

        try {
            const response = await nurseInpatientStayAPI.startWorkflowStep(stepId);

            if (response && response.data) {
                alert('Bắt đầu workflow step thành công!');
                // Refresh danh sách
                await fetchWorkflowData();
            }
        } catch (err) {
            alert(err.message || 'Không thể bắt đầu workflow step');
        } finally {
            setStartingStepId(null);
        }
    };

    // Hoàn thành workflow step
    const handleCompleteStep = async (stepId, stepName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hoàn thành bước "${stepName}"?`)) {
            return;
        }

        setCompletingStepId(stepId);

        try {
            const response = await nurseInpatientStayAPI.completeWorkflowStep(stepId);

            if (response && response.data) {
                alert('Hoàn thành workflow step thành công!');
                // Refresh danh sách
                await fetchWorkflowData();
            }
        } catch (err) {
            alert(err.message || 'Không thể hoàn thành workflow step');
        } finally {
            setCompletingStepId(null);
        }
    };

    // Hiển thị dialog bỏ qua workflow step
    const handleShowSkipDialog = (stepId, stepName) => {
        setSkipStepData({ id: stepId, name: stepName });
        setSkipReason('');
        setShowSkipDialog(true);
    };

    // Bỏ qua workflow step
    const handleSkipStep = async () => {
        // Validation
        if (!skipReason.trim()) {
            alert('Vui lòng nhập lý do bỏ qua');
            return;
        }

        if (skipReason.trim().length < 10) {
            alert('Lý do bỏ qua phải có ít nhất 10 ký tự');
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn bỏ qua bước "${skipStepData.name}"?\n\nLý do: ${skipReason}`)) {
            return;
        }

        setSkippingStepId(skipStepData.id);

        try {
            const response = await nurseInpatientStayAPI.skipWorkflowStep(skipStepData.id, skipReason);

            if (response && response.data) {
                alert('Bỏ qua workflow step thành công!');
                setShowSkipDialog(false);
                setSkipReason('');
                setSkipStepData(null);
                // Refresh danh sách
                await fetchWorkflowData();
            }
        } catch (err) {
            alert(err.message || 'Không thể bỏ qua workflow step');
        } finally {
            setSkippingStepId(null);
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
            'COMPLETED': 'status-completed',
            'IN_PROGRESS': 'status-in-progress',
            'PENDING': 'status-pending',
            'SKIPPED': 'status-skipped',
        };
        return statusMap[status] || 'status-default';
    };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <FiCheckCircle />;
            case 'IN_PROGRESS':
                return <FiActivity />;
            case 'PENDING':
                return <FiClock />;
            default:
                return <FiClock />;
        }
    };
    
    // Tính toán tiến độ
    const calculateProgress = () => {
        if (workflowSteps.length === 0) return 0;
        const completedSteps = workflowSteps.filter(step => step.status === 'COMPLETED').length;
        return Math.round((completedSteps / workflowSteps.length) * 100);
    };
    
    if (loading) {
        return (
            <div className="workflow-loading">
                <FiActivity className="spinner" />
                <p>Đang tải workflow...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="workflow-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }
    
    const progressPercentage = calculateProgress();
    
    return (
        <div className="workflow-page">
            {/* Header */}
            <div className="workflow-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Luồng điều trị - Lượt điều trị #{stayId}</h1>
                    <p>Theo dõi tiến trình điều trị nội trú</p>
                </div>
                {workflowSteps.length === 0 && !loading && (
                    <button
                        className="btn-initialize"
                        onClick={handleInitializeWorkflow}
                        disabled={initializing}
                    >
                        <FiPlay /> {initializing ? 'Đang khởi tạo...' : 'Khởi tạo Workflow'}
                    </button>
                )}
            </div>
            
            {/* Progress Overview */}
            <div className="progress-overview">
                <div className="progress-header">
                    <div className="progress-info">
                        <FiTrendingUp className="progress-icon" />
                        <div>
                            <h3>Tiến độ tổng thể</h3>
                            <p>{workflowSteps.filter(s => s.status === 'COMPLETED').length} / {workflowSteps.length} bước hoàn thành</p>
                        </div>
                    </div>
                    <div className="progress-percentage">
                        <span className="percentage-value">{progressPercentage}%</span>
                    </div>
                </div>
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* Workflow Steps & Progress */}
            <div className="workflow-content">
                {/* Workflow Steps */}
                <div className="workflow-section">
                    <div className="section-header">
                        <h2><FiActivity /> Workflow Steps</h2>
                        <span className="section-count">{workflowSteps.length} bước</span>
                    </div>
                    
                    {workflowSteps.length === 0 ? (
                        <div className="empty-state">
                            <FiActivity />
                            <p>Chưa có workflow steps nào</p>
                        </div>
                    ) : (
                        <div className="steps-timeline">
                            {workflowSteps.map((step, index) => (
                                <div key={step.id} className={`step-item ${step.status.toLowerCase()}`}>
                                    <div className="step-indicator">
                                        <div className="step-number">{index + 1}</div>
                                        <div className="step-line"></div>
                                    </div>
                                    <div className="step-content">
                                        <div className="step-header">
                                            <div className="step-title-group">
                                                <h4>{step.workflowStep}</h4>
                                                <button
                                                    className="btn-view-detail"
                                                    onClick={() => handleViewStepDetail(step.id)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FiInfo />
                                                </button>
                                            </div>
                                            <div className="step-actions">
                                                <span className={`badge ${getStatusBadgeClass(step.status)}`}>
                                                    {getStatusIcon(step.status)}
                                                    {step.status}
                                                </span>

                                                {/* Nút Bắt đầu - chỉ hiển thị khi PENDING */}
                                                {step.status === 'PENDING' && (
                                                    <button
                                                        className="btn-start-step"
                                                        onClick={() => handleStartStep(step.id, step.workflowStep)}
                                                        disabled={startingStepId === step.id}
                                                    >
                                                        <FiPlay /> {startingStepId === step.id ? 'Đang bắt đầu...' : 'Bắt đầu'}
                                                    </button>
                                                )}

                                                {/* Nút Hoàn thành - chỉ hiển thị khi IN_PROGRESS */}
                                                {step.status === 'IN_PROGRESS' && (
                                                    <button
                                                        className="btn-complete-step"
                                                        onClick={() => handleCompleteStep(step.id, step.workflowStep)}
                                                        disabled={completingStepId === step.id}
                                                    >
                                                        <FiCheckCircle /> {completingStepId === step.id ? 'Đang hoàn thành...' : 'Hoàn thành'}
                                                    </button>
                                                )}

                                                {/* Nút Bỏ qua - hiển thị khi PENDING hoặc IN_PROGRESS */}
                                                {(step.status === 'PENDING' || step.status === 'IN_PROGRESS') && (
                                                    <button
                                                        className="btn-skip-step"
                                                        onClick={() => handleShowSkipDialog(step.id, step.workflowStep)}
                                                        disabled={skippingStepId === step.id}
                                                    >
                                                        <FiXCircle /> Bỏ qua
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="step-details">
                                            {step.completedAt && (
                                                <div className="detail-item">
                                                    <FiCheckCircle />
                                                    <span>Hoàn thành: {formatDateTime(step.completedAt)}</span>
                                                </div>
                                            )}
                                            {step.completedByEmployeeId && (
                                                <div className="detail-item">
                                                    <FiUser />
                                                    <span>Người thực hiện: ID {step.completedByEmployeeId}</span>
                                                </div>
                                            )}
                                            <div className="detail-item">
                                                <FiClock />
                                                <span>Tạo lúc: {formatDateTime(step.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Workflow Progress */}
                <div className="workflow-section">
                    <div className="section-header">
                        <h2><FiTrendingUp /> Workflow Progress</h2>
                        <span className="section-count">{workflowProgress.length} mục</span>
                    </div>
                    
                    {workflowProgress.length === 0 ? (
                        <div className="empty-state">
                            <FiTrendingUp />
                            <p>Chưa có workflow progress nào</p>
                        </div>
                    ) : (
                        <div className="progress-list">
                            {workflowProgress.map((progress) => (
                                <div key={progress.id} className="progress-item">
                                    <div className="progress-item-header">
                                        <h4>{progress.workflowStep}</h4>
                                        <span className={`badge ${getStatusBadgeClass(progress.status)}`}>
                                            {getStatusIcon(progress.status)}
                                            {progress.status}
                                        </span>
                                    </div>
                                    <div className="progress-item-details">
                                        {progress.completedAt && (
                                            <div className="detail-item">
                                                <FiCheckCircle />
                                                <span>Hoàn thành: {formatDateTime(progress.completedAt)}</span>
                                            </div>
                                        )}
                                        {progress.completedByEmployeeId && (
                                            <div className="detail-item">
                                                <FiUser />
                                                <span>Người thực hiện: ID {progress.completedByEmployeeId}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <FiClock />
                                            <span>Cập nhật: {formatDateTime(progress.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal chi tiết workflow step */}
            {showDetailModal && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết Workflow Step</h2>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingDetail ? (
                                <div className="modal-loading">
                                    <FiActivity className="spinner" />
                                    <p>Đang tải chi tiết...</p>
                                </div>
                            ) : selectedStep ? (
                                <div className="step-detail-content">
                                    <div className="detail-row">
                                        <label>ID:</label>
                                        <span>{selectedStep.id}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Inpatient Stay ID:</label>
                                        <span>{selectedStep.inpatientStayId}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Workflow Step:</label>
                                        <span className="highlight">{selectedStep.workflowStep}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Trạng thái:</label>
                                        <span className={`badge ${getStatusBadgeClass(selectedStep.status)}`}>
                                            {getStatusIcon(selectedStep.status)}
                                            {selectedStep.status}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Hoàn thành lúc:</label>
                                        <span>{formatDateTime(selectedStep.completedAt)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Người hoàn thành:</label>
                                        <span>{selectedStep.completedByEmployeeId ? `ID: ${selectedStep.completedByEmployeeId}` : '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Ngày tạo:</label>
                                        <span>{formatDateTime(selectedStep.createdAt)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Cập nhật lần cuối:</label>
                                        <span>{formatDateTime(selectedStep.updatedAt)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p>Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* === DIALOG BỎ QUA BỊ THIẾU (THÊM VÀO ĐÂY) === */}
            {showSkipDialog && (
                <div className="modal-overlay" onClick={() => setShowSkipDialog(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Lý do bỏ qua bước?</h2>
                            <button className="btn-close" onClick={() => setShowSkipDialog(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Bạn đang yêu cầu bỏ qua bước: <strong>{skipStepData?.name}</strong></p>
                            
                            {/* Giả sử bạn có class 'form-group' từ CSS khác */}
                            <div className="form-group" style={{ width: '100%' }}>
                                <label>Vui lòng nhập lý do (tối thiểu 10 ký tự):</label>
                                <textarea
                                    value={skipReason}
                                    onChange={(e) => setSkipReason(e.target.value)}
                                    rows="4"
                                    placeholder="Ví dụ: Bệnh nhân đã hoàn thành bước này ở khoa khác..."
                                    style={{ width: '100%', padding: '8px', fontSize: '14px', marginTop: '8px' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                            <button
                                className="btn-secondary" // Giả sử có class này
                                onClick={() => setShowSkipDialog(false)}
                                style={{ background: '#eee', color: '#333' }}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-danger" // Giả sử có class này
                                // 3. NÚT NÀY SẼ GỌI handleSkipStep
                                onClick={handleSkipStep}
                                disabled={skippingStepId === skipStepData?.id || skipReason.trim().length < 10}
                                style={{ background: '#ef4444', color: 'white' }}
                            >
                                {skippingStepId === skipStepData?.id ? 'Đang xử lý...' : 'Xác nhận Bỏ qua'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog nhập lý do bỏ qua */}
            {showSkipDialog && (
                <div className="modal-overlay" onClick={() => setShowSkipDialog(false)}>
                    <div className="modal-content skip-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Bỏ qua Workflow Step</h2>
                            <button className="btn-close" onClick={() => setShowSkipDialog(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="skip-dialog-content">
                                <p className="step-name-display">
                                    <strong>Bước:</strong> {skipStepData?.name}
                                </p>

                                <div className="form-group">
                                    <label htmlFor="skipReason">
                                        Lý do bỏ qua <span className="required">*</span>
                                    </label>
                                    <textarea
                                        id="skipReason"
                                        value={skipReason}
                                        onChange={(e) => setSkipReason(e.target.value)}
                                        placeholder="Nhập lý do bỏ qua (tối thiểu 10 ký tự)..."
                                        rows="4"
                                        className={skipReason.trim().length > 0 && skipReason.trim().length < 10 ? 'error' : ''}
                                    />
                                    {skipReason.trim().length > 0 && skipReason.trim().length < 10 && (
                                        <span className="error-message">
                                            Lý do phải có ít nhất 10 ký tự (hiện tại: {skipReason.trim().length})
                                        </span>
                                    )}
                                </div>

                                <div className="dialog-actions">
                                    <button
                                        className="btn-cancel"
                                        onClick={() => setShowSkipDialog(false)}
                                        disabled={skippingStepId}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="btn-confirm-skip"
                                        onClick={handleSkipStep}
                                        disabled={skippingStepId || !skipReason.trim() || skipReason.trim().length < 10}
                                    >
                                        <FiXCircle /> {skippingStepId ? 'Đang bỏ qua...' : 'Xác nhận bỏ qua'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowPage;

