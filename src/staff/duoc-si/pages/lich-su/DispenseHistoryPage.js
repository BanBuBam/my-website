import React, { useState, useEffect } from 'react';
import './DispenseHistoryPage.css';
import { pharmacistPrescriptionAPI } from '../../../../services/staff/pharmacistAPI';
import { FiRefreshCw, FiClock, FiPackage } from 'react-icons/fi';

const DispenseHistoryPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [returnFormData, setReturnFormData] = useState({
        quantity: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });
    const [returnHistory, setReturnHistory] = useState([]);
    const [loadingReturnHistory, setLoadingReturnHistory] = useState(false);

    // Load prescriptions on component mount
    useEffect(() => {
        loadPrescriptions();
    }, []);

    // Load dispensed prescriptions from API
    const loadPrescriptions = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            const response = await pharmacistPrescriptionAPI.getDispensedPrescriptions(page, 20);

            if (response && response.data && response.data.content) {
                setPrescriptions(response.data.content);
                setPagination({
                    currentPage: response.data.number,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                    pageSize: response.data.size
                });
            }
        } catch (err) {
            console.error('Error loading prescriptions:', err);
            setError(err.message || 'Không thể tải danh sách đơn thuốc đã cấp phát');
        } finally {
            setLoading(false);
        }
    };

    // Format date from ISO string to Vietnamese format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Format datetime from ISO string to Vietnamese format
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // Load return history for a prescription
    const loadReturnHistory = async (prescriptionId) => {
        try {
            setLoadingReturnHistory(true);
            const response = await pharmacistPrescriptionAPI.getReturnHistory(prescriptionId);

            console.log('Return history response:', response);

            if (response && response.data) {
                setReturnHistory(response.data);
            } else {
                setReturnHistory([]);
            }
        } catch (err) {
            console.error('Error loading return history:', err);
            setReturnHistory([]);
        } finally {
            setLoadingReturnHistory(false);
        }
    };

    // Handler when selecting a prescription to view detail
    const handleViewPrescriptionDetail = (prescription) => {
        console.log('Viewing prescription detail:', prescription);
        console.log('Prescription ID:', prescription.prescriptionId);
        console.log('Prescription Status:', prescription.status);
        console.log('Prescription Items:', prescription.items);
        setSelectedPrescription(prescription);

        // Load return history for this prescription
        loadReturnHistory(prescription.prescriptionId);
    };

    // Handler to open return modal
    const handleOpenReturnModal = (medicine, prescriptionId) => {
        console.log('Opening return modal for medicine:', medicine);
        console.log('prescriptionId from parameter:', prescriptionId);

        // API: POST /api/v1/prescriptions/{prescriptionId}/items/{itemId}/return
        // prescriptionId = from selectedPrescription (the parent prescription)
        // itemId = medicine.medicineId
        const actualPrescriptionId = prescriptionId;
        const itemId = medicine.medicineId;

        console.log('prescriptionId:', actualPrescriptionId);
        console.log('itemId:', itemId);

        if (!actualPrescriptionId) {
            alert('❌ Lỗi: Không tìm thấy ID của đơn thuốc. Vui lòng thử lại.');
            console.error('Missing prescriptionId:', prescriptionId);
            return;
        }

        if (!itemId) {
            alert('❌ Lỗi: Không tìm thấy ID của thuốc. Vui lòng thử lại.');
            console.error('Missing itemId (medicineId) for medicine:', medicine);
            return;
        }

        setSelectedItem({
            ...medicine,
            prescriptionId: actualPrescriptionId,
            itemId: itemId
        });
        setReturnFormData({
            quantity: '',
            reason: ''
        });
        setShowReturnModal(true);
    };

    // Handler to submit return
    const handleSubmitReturn = async (e) => {
        e.preventDefault();

        if (!returnFormData.quantity || returnFormData.quantity <= 0) {
            alert('Vui lòng nhập số lượng trả lại hợp lệ');
            return;
        }

        if (parseInt(returnFormData.quantity) > parseInt(selectedItem.quantity)) {
            alert(`Số lượng trả lại không được vượt quá số lượng đã cấp phát (${selectedItem.quantity})`);
            return;
        }

        if (!returnFormData.reason.trim()) {
            alert('Vui lòng nhập lý do trả thuốc');
            return;
        }

        if (!selectedItem.prescriptionId) {
            alert('Lỗi: Không tìm thấy ID của đơn thuốc. Vui lòng thử lại.');
            console.error('Missing prescriptionId for medicine:', selectedItem);
            return;
        }

        if (!selectedItem.itemId) {
            alert('Lỗi: Không tìm thấy ID của thuốc. Vui lòng thử lại.');
            console.error('Missing itemId for medicine:', selectedItem);
            return;
        }

        try {
            setSubmitting(true);

            console.log('Submitting return:', {
                prescriptionId: selectedItem.prescriptionId,
                itemId: selectedItem.itemId,
                quantity: parseInt(returnFormData.quantity),
                reason: returnFormData.reason
            });

            const response = await pharmacistPrescriptionAPI.returnMedicationItem(
                selectedItem.prescriptionId,
                selectedItem.itemId,
                parseInt(returnFormData.quantity),
                returnFormData.reason
            );

            console.log('Return response:', response);

            // Check for successful response (status can be 'OK', 'success', or HTTP 200)
            if (response && (response.status === 'OK' || response.status === 'success' || response.code === 200)) {
                alert('✅ Trả thuốc thành công!');
                setShowReturnModal(false);
                setReturnFormData({ quantity: '', reason: '' });
                setSelectedItem(null);

                // Refresh return history for current prescription
                if (selectedPrescription) {
                    await loadReturnHistory(selectedPrescription.prescriptionId);
                }

                // Refresh prescription list
                await loadPrescriptions(pagination.currentPage);
            } else {
                const errorMsg = response?.message || 'Có lỗi xảy ra khi trả thuốc. Vui lòng thử lại.';
                alert(`❌ ${errorMsg}`);
            }
        } catch (err) {
            console.error('Error returning medication:', err);

            // Handle different error types
            let errorMessage = 'Không thể trả thuốc';

            if (err.message) {
                if (err.message.includes('401')) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (err.message.includes('403')) {
                    errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
                } else if (err.message.includes('404')) {
                    errorMessage = 'Không tìm thấy đơn thuốc hoặc thuốc này.';
                } else if (err.message.includes('400')) {
                    errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
                } else {
                    errorMessage = err.message;
                }
            }

            alert(`❌ Lỗi: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dispense-history-page">
            {!selectedPrescription && (
                <>
                    <div className="page-header">
                        <h2 className="page-title">
                            <FiPackage style={{ marginRight: '0.5rem' }} />
                            Lịch sử cấp phát
                        </h2>
                        <button
                            className="btn-refresh"
                            onClick={() => loadPrescriptions(pagination.currentPage)}
                            disabled={loading}
                        >
                            <FiRefreshCw className={loading ? 'spinning' : ''} />
                            Làm mới
                        </button>
                    </div>

                    {loading && (
                        <div className="loading-container">
                            <FiClock size={48} color="#007bff" />
                            <p>Đang tải danh sách đơn thuốc đã cấp phát...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="error-container">
                            <p className="error-message">{error}</p>
                            <button onClick={() => loadPrescriptions()}>Thử lại</button>
                        </div>
                    )}

                    {!loading && !error && prescriptions.length === 0 && (
                        <div className="empty-container">
                            <FiPackage size={64} color="#6c757d" />
                            <p>Chưa có đơn thuốc nào được cấp phát</p>
                        </div>
                    )}

                    {!loading && !error && prescriptions.length > 0 && (
                        <>
                            <div className="prescription-stats">
                                <p>
                                    Hiển thị <strong>{prescriptions.length}</strong> đơn thuốc
                                    (Trang {pagination.currentPage + 1}/{pagination.totalPages})
                                </p>
                                <p>
                                    Tổng số: <strong>{pagination.totalElements}</strong> đơn thuốc đã cấp phát
                                </p>
                            </div>

                            <div className="prescription-list">
                                {prescriptions.map((prescription) => (
                                    <div key={prescription.prescriptionId} className="prescription-item">
                                        <div className="prescription-info">
                                            <div className="prescription-code">
                                                Đơn #{prescription.prescriptionId}
                                            </div>
                                            <div className="prescription-meta">
                                                <span>📅 Ngày kê đơn: {formatDate(prescription.prescriptionDate)}</span>
                                                <span>👨‍⚕️ Bác sĩ: {prescription.createdByEmployeeName}</span>
                                                <span>✅ Đã cấp phát: {formatDateTime(prescription.dispensedAt)}</span>
                                                <span>👤 Người cấp phát: {prescription.dispensedByEmployeeName}</span>
                                                <div>
                                                    <span className={`prescription-type ${prescription.prescriptionType?.toLowerCase()}`}>
                                                        {prescription.prescriptionType === 'TU_TUC' ? '💳 Tự túc' : '🏥 BHYT'}
                                                    </span>
                                                    <span className="medicine-count">
                                                        💊 {prescription.items?.length || 0} loại thuốc
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewPrescriptionDetail(prescription)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="btn-page"
                                        onClick={() => loadPrescriptions(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 0 || loading}
                                    >
                                        ← Trang trước
                                    </button>
                                    <span className="page-info">
                                        Trang {pagination.currentPage + 1} / {pagination.totalPages}
                                    </span>
                                    <button
                                        className="btn-page"
                                        onClick={() => loadPrescriptions(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                                    >
                                        Trang sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Prescription Detail View */}
            {selectedPrescription && (
                <div className="prescription-detail">
                    <div className="page-header">
                        <h2 className="page-title">
                            Chi tiết đơn thuốc #{selectedPrescription.prescriptionId}
                            <small style={{fontSize: '0.8em', color: '#666', marginLeft: '10px'}}>
                                (Status: {selectedPrescription.status})
                            </small>
                        </h2>
                        <span className="badge status-dispensed">✅ ĐÃ CẤP PHÁT</span>
                    </div>

                    {/* Prescription Header Info */}
                    <div className="prescription-header-info">
                        <div className="info-row">
                            <p><strong>📅 Ngày kê đơn:</strong> {formatDate(selectedPrescription.prescriptionDate)}</p>
                            <p><strong>👨‍⚕️ Bác sĩ kê đơn:</strong> {selectedPrescription.createdByEmployeeName}</p>
                        </div>
                        <div className="info-row">
                            <p><strong>✍️ Bác sĩ ký:</strong> {selectedPrescription.signedByEmployeeName}</p>
                            <p><strong>🕐 Thời gian ký:</strong> {formatDateTime(selectedPrescription.signedAt)}</p>
                        </div>
                        <div className="info-row">
                            <p><strong>👤 Người cấp phát:</strong> {selectedPrescription.dispensedByEmployeeName}</p>
                            <p><strong>✅ Thời gian cấp phát:</strong> {formatDateTime(selectedPrescription.dispensedAt)}</p>
                        </div>
                        <div className="info-row">
                            <p>
                                <strong>Loại đơn:</strong>
                                <span className={`badge ${selectedPrescription.prescriptionType?.toLowerCase()}`}>
                                    {selectedPrescription.prescriptionType === 'TU_TUC' ? '💳 Tự túc' : '🏥 BHYT'}
                                </span>
                            </p>
                            <p><strong>Trạng thái:</strong> <span className="badge status-dispensed">✅ Đã cấp phát</span></p>
                        </div>
                    </div>

                    {/* Medicines Table */}
                    <h3>💊 Danh sách thuốc đã cấp phát</h3>
                    {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                        <div className="medicine-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã thuốc</th>
                                        <th>Tên thuốc</th>
                                        <th>Liều dùng</th>
                                        <th>Số lượng</th>
                                        <th>Ghi chú</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPrescription.items.map((item, index) => (
                                        <tr key={item.prescriptionItemId || index}>
                                            <td>{index + 1}</td>
                                            <td>{item.medicineId}</td>
                                            <td><strong>{item.medicineName}</strong></td>
                                            <td>{item.dosage || 'N/A'}</td>
                                            <td><strong>{item.quantity}</strong></td>
                                            <td>{item.notes || '-'}</td>
                                            <td>
                                                <button
                                                    className="btn-return"
                                                    onClick={() => handleOpenReturnModal(item, selectedPrescription.prescriptionId)}
                                                >
                                                    🔄 Trả thuốc
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-medicines">
                            <p>⚠️ Đơn thuốc này không có thuốc nào</p>
                        </div>
                    )}

                    {/* Counseling Notes */}
                    {selectedPrescription.counselingNotes && (
                        <div className="counseling-notes">
                            <h3>📝 Ghi chú tư vấn</h3>
                            <p>{selectedPrescription.counselingNotes}</p>
                            <p className="counselor-info">
                                Tư vấn bởi: {selectedPrescription.counseledByEmployeeName} -
                                {formatDateTime(selectedPrescription.counseledAt)}
                            </p>
                        </div>
                    )}

                    {/* Return History Section */}
                    <div className="return-history-section">
                        <h3>🔄 Lịch sử trả thuốc</h3>

                        {loadingReturnHistory ? (
                            <div className="loading-return-history">
                                <p>Đang tải lịch sử trả thuốc...</p>
                            </div>
                        ) : returnHistory && returnHistory.length > 0 ? (
                            <div className="return-history-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên thuốc</th>
                                            <th>Số lượng trả</th>
                                            <th>Lý do</th>
                                            <th>Người trả</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnHistory.map((item, index) => (
                                            <tr key={item.movementId || index}>
                                                <td>{index + 1}</td>
                                                <td><strong>{item.medicineName}</strong></td>
                                                <td><span className="quantity-returned">{item.quantity}</span></td>
                                                <td>{item.reason}</td>
                                                <td>{item.returnedByEmployeeName}</td>
                                                <td>{formatDateTime(item.returnedAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-return-history">
                                <p>✅ Chưa có thuốc nào được trả lại</p>
                            </div>
                        )}
                    </div>

                    <div className="detail-actions">
                        <button
                            className="btn-back"
                            onClick={() => setSelectedPrescription(null)}
                        >
                            ← Quay lại danh sách
                        </button>
                    </div>
                </div>
            )}

            {/* Return Medication Modal */}
            {showReturnModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔄 Trả thuốc</h3>
                            <button className="modal-close" onClick={() => setShowReturnModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="return-info-alert">
                                <strong>⚠️ Lưu ý:</strong>
                                Thao tác trả thuốc sẽ tạo đơn thuốc thay thế mới và đánh dấu đơn hiện tại là SUPERSEDED.
                            </div>

                            <div className="medicine-info-box">
                                <h4>Thông tin thuốc</h4>
                                <p><strong>Tên thuốc:</strong> {selectedItem.medicineName}</p>
                                <p><strong>Mã thuốc:</strong> {selectedItem.medicineId}</p>
                                <p><strong>Số lượng đã cấp:</strong> {selectedItem.quantity}</p>
                                <p><strong>Liều dùng:</strong> {selectedItem.dosage || 'N/A'}</p>
                            </div>

                            <form onSubmit={handleSubmitReturn}>
                                <div className="form-group">
                                    <label htmlFor="return-quantity">
                                        Số lượng trả lại <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="return-quantity"
                                        min="1"
                                        max={selectedItem.quantity}
                                        value={returnFormData.quantity}
                                        onChange={(e) => setReturnFormData({
                                            ...returnFormData,
                                            quantity: e.target.value
                                        })}
                                        placeholder="Nhập số lượng"
                                        required
                                        disabled={submitting}
                                    />
                                    <span className="form-hint">
                                        Tối đa: {selectedItem.quantity}
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="return-reason">
                                        Lý do trả thuốc <span className="required">*</span>
                                    </label>
                                    <textarea
                                        id="return-reason"
                                        value={returnFormData.reason}
                                        onChange={(e) => setReturnFormData({
                                            ...returnFormData,
                                            reason: e.target.value
                                        })}
                                        placeholder="Nhập lý do trả thuốc (ví dụ: Bệnh nhân dị ứng, thuốc hết hạn, sai liều lượng...)"
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="submit"
                                        className="btn-submit-return"
                                        disabled={submitting}
                                    >
                                        {submitting ? '⏳ Đang xử lý...' : '🔄 Xác nhận trả thuốc'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setShowReturnModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DispenseHistoryPage;

