import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorBedAPI, doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
import { FiArrowLeft, FiMove, FiAlertCircle, FiCheckCircle, FiActivity } from 'react-icons/fi';
import './BedTransferPage.css';

const BedTransferPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    
    // State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [stay, setStay] = useState(null);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [loadingBeds, setLoadingBeds] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        newBedId: '',
        reason: '',
        notes: ''
    });
    
    // Fetch stay detail and available beds
    useEffect(() => {
        fetchStayDetail();
        fetchAvailableBeds();
    }, [inpatientStayId]);
    
    const fetchStayDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorInpatientTreatmentAPI.getInpatientStayDetail(inpatientStayId);
            if (response && response.data) {
                setStay(response.data);
            }
        } catch (err) {
            console.error('Error loading stay detail:', err);
            setError(err.message || 'Không thể tải thông tin điều trị nội trú');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchAvailableBeds = async () => {
        try {
            setLoadingBeds(true);
            const response = await doctorBedAPI.getAllAvailableBeds();
            if (response && response.data) {
                setAvailableBeds(response.data);
            }
        } catch (err) {
            console.error('Error loading available beds:', err);
            setError(err.message || 'Không thể tải danh sách giường trống');
        } finally {
            setLoadingBeds(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.newBedId) {
            alert('Vui lòng chọn giường mới');
            return;
        }
        if (!formData.reason.trim()) {
            alert('Vui lòng nhập lý do chuyển giường');
            return;
        }
        
        if (!window.confirm('Bạn có chắc chắn muốn chuyển giường cho bệnh nhân này?')) {
            return;
        }
        
        try {
            setSubmitting(true);
            
            // Call API to transfer bed
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL || 'http://100.99.181.59:8081/'}api/v1/inpatient/stays/${inpatientStayId}/transfer-bed`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('staffAccessToken')}`
                    },
                    body: JSON.stringify({
                        newBedId: parseInt(formData.newBedId),
                        reason: formData.reason,
                        notes: formData.notes
                    })
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            alert('Chuyển giường thành công!');
            navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}`);
            
        } catch (err) {
            console.error('Error transferring bed:', err);
            alert(err.message || 'Có lỗi xảy ra khi chuyển giường');
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleCancel = () => {
        navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}`);
    };
    
    const getSelectedBedInfo = () => {
        if (!formData.newBedId) return null;
        return availableBeds.find(bed => bed.bedId === parseInt(formData.newBedId));
    };
    
    if (loading) {
        return (
            <div className="bed-transfer-page">
                <div className="loading-state">
                    <FiActivity className="spinner" />
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }
    
    if (error && !stay) {
        return (
            <div className="bed-transfer-page">
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
    
    const selectedBed = getSelectedBedInfo();
    
    return (
        <div className="bed-transfer-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={handleCancel} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiMove className="header-icon" />
                    <div>
                        <h1>Chuyển giường</h1>
                        <p>Tạo yêu cầu chuyển giường cho bệnh nhân</p>
                    </div>
                </div>
            </div>
            
            {/* Current Bed Info */}
            {stay && (
                <div className="current-bed-section">
                    <h2>Thông tin hiện tại</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Bệnh nhân:</label>
                            <span>{stay.patientName} ({stay.patientCode})</span>
                        </div>
                        <div className="info-item">
                            <label>Giường hiện tại:</label>
                            <span className="current-bed">{stay.bedNumber || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Phòng:</label>
                            <span>{stay.roomNumber || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Khoa:</label>
                            <span>{stay.departmentName || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Transfer Form */}
            <div className="transfer-form-section">
                <h2>Thông tin chuyển giường</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newBedId">
                            Chọn giường mới <span className="required">*</span>
                        </label>
                        {loadingBeds ? (
                            <p className="loading-text">Đang tải danh sách giường...</p>
                        ) : (
                            <select
                                id="newBedId"
                                name="newBedId"
                                value={formData.newBedId}
                                onChange={handleInputChange}
                                required
                                className="form-control"
                            >
                                <option value="">-- Chọn giường --</option>
                                {availableBeds.map(bed => (
                                    <option key={bed.bedId} value={bed.bedId}>
                                        {bed.bedNumber} - {bed.roomNumber} - {bed.departmentName} 
                                        ({bed.bedType})
                                    </option>
                                ))}
                            </select>
                        )}
                        {availableBeds.length === 0 && !loadingBeds && (
                            <p className="warning-text">
                                <FiAlertCircle /> Không có giường trống
                            </p>
                        )}
                    </div>
                    
                    {/* Show selected bed info */}
                    {selectedBed && (
                        <div className="selected-bed-info">
                            <FiCheckCircle className="icon-success" />
                            <div>
                                <strong>Giường đã chọn:</strong> {selectedBed.bedNumber}
                                <br />
                                <span>Phòng: {selectedBed.roomNumber} | Khoa: {selectedBed.departmentName}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="reason">
                            Lý do chuyển giường <span className="required">*</span>
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            required
                            rows="4"
                            className="form-control"
                            placeholder="Nhập lý do chuyển giường (ví dụ: Bệnh nhân cần phòng cách ly, chuyển sang ICU...)"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="notes">Ghi chú</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="3"
                            className="form-control"
                            placeholder="Nhập ghi chú bổ sung (không bắt buộc)"
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-cancel"
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={submitting || loadingBeds || availableBeds.length === 0}
                        >
                            <FiMove />
                            {submitting ? 'Đang xử lý...' : 'Xác nhận chuyển'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BedTransferPage;

