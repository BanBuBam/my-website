// Tên file: AssignBedModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { nurseBedAPI, nurseAdmissionRequestAPI } from '../../../../services/staff/nurseAPI';
import { FiX, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
// Dùng chung CSS với trang chi tiết
import './RequestDetailPage.css';

const AssignBedModal = ({ request, onClose, onSuccess }) => {
    const [allAvailableBeds, setAllAvailableBeds] = useState([]);
    const [selectHospitalBedId, setSelectHospitalBedId] = useState('');
    
    const [loadingBeds, setLoadingBeds] = useState(true);
    const [loadingAssign, setLoadingAssign] = useState(false);
    
    const [error, setError] = useState(null);
    
    // 1. Tải TẤT CẢ giường trống khi modal mở
    useEffect(() => {
        const fetchAllBeds = async () => {
            setLoadingBeds(true);
            setError(null);
            try {
                const response = await nurseBedAPI.getAllAvailableBeds();
                if (response && response.data) {
                    setAllAvailableBeds(response.data);
                } else {
                    setAllAvailableBeds([]);
                }
            } catch (err) {
                setError(err.message || 'Không thể tải danh sách giường');
            } finally {
                setLoadingBeds(false);
            }
        };
        fetchAllBeds();
    }, []);
    
    // 2. Lọc danh sách giường cho thông minh
    const filteredBeds = useMemo(() => {
        if (allAvailableBeds.length === 0) return [];
        
        //Lọc theo Khoa yêu cầu (quan trọng nhất)
        const bedsInDept = allAvailableBeds.filter(
            bed => bed.departmentId === request.requestedDepartmentId
        );
        
        // Lọc theo Loại giường (nếu có yêu cầu)
        // if (request.bedTypeRequired) {
        //     const matchedType = bedsInDept.filter(
        //         bed => bed.bedType === request.bedTypeRequired
        //     );
        //
        //     // Nếu tìm thấy giường đúng loại, hiển thị.
        //     // Nếu không, cứ hiển thị tất cả giường trong khoa đó (để điều dưỡng tự quyết)
        //     return matchedType.length > 0 ? matchedType : bedsInDept;
        // }
        
        return bedsInDept;
    }, [allAvailableBeds, request.requestedDepartmentId, request.bedTypeRequired]);
    
    // 3. Xử lý submit gán giường
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectHospitalBedId) {
            setError('Vui lòng chọn một giường');
            return;
        }
        setLoadingAssign(true);
        setError(null);
        try {
            // Gọi API gán giường
            await nurseAdmissionRequestAPI.assignBedToRequest(request.admissionRequestId, selectHospitalBedId);
            onSuccess(); // Báo cho trang cha biết đã thành công
        } catch (err) {
            setError(err.message || 'Gán giường thất bại');
        } finally {
            setLoadingAssign(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Gán giường cho: {request.patientName}</h3>
                    <button className="btn-close" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Thông tin tóm tắt */}
                        {/*<div className="info-item">*/}
                        {/*    <label>Khoa:</label>*/}
                        {/*    <span>{request.requestedDepartmentName}</span>*/}
                        {/*</div>*/}
                        <div className="info-item">
                            <label>Loại giường yêu cầu:</label>
                            <span>{request.bedTypeRequired || 'Không chỉ định'}</span>
                        </div>
                        
                        <hr />
                        
                        {/* Form chọn giường */}
                        <div className="form-group full-width">
                            <label>Chọn giường có sẵn (trong khoa):</label>
                            {loadingBeds && (
                                <div className="loading-state-mini"><FiLoader /> Đang tải giường...</div>
                            )}
                            {!loadingBeds && error && (
                                <div className="error-state-mini">{error}</div>
                            )}
                            {!loadingBeds && !error && allAvailableBeds.length === 0 && (
                                <div className="error-state-mini">
                                    <FiAlertCircle /> Không tìm thấy giường trống phù hợp trong khoa này.
                                </div>
                            )}
                            {/*{!loadingBeds && !error && filteredBeds.length > 0 && (*/}
                            {!loadingBeds && !error && (
                                <select
                                    value={selectHospitalBedId}
                                    onChange={(e) => setSelectHospitalBedId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn giường --</option>
                                    {allAvailableBeds.map(bed => (
                                        <option key={bed.hospitalBedId} value={bed.hospitalBedId}>
                                            {bed.bedNumber} (Phòng: {bed.roomNumber} - Loại: {bed.bedType})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        {/* Hiển thị lỗi nếu gán thất bại */}
                        {error && !loadingBeds && (
                            <div className="error-state modal-error">{error}</div>
                        )}
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loadingAssign}>
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loadingBeds || loadingAssign || allAvailableBeds.length === 0}
                        >
                            {loadingAssign ? 'Đang gán...' : <><FiCheck /> Xác nhận</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignBedModal;