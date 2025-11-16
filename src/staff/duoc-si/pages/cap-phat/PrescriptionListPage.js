import React, { useState, useEffect } from 'react';
import './PrescriptionListPage.css';
import { pharmacistPrescriptionAPI } from '../../../../services/staff/pharmacistAPI';
import { FiRefreshCw } from 'react-icons/fi';

const PrescriptionListPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [dispensing, setDispensing] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });

    // Load prescriptions on component mount
    useEffect(() => {
        loadPrescriptions();
    }, []);

    // Load signed prescriptions from API
    const loadPrescriptions = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            const response = await pharmacistPrescriptionAPI.getSignedPrescriptions(page, 20);

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
            setError(err.message || 'Không thể tải danh sách đơn thuốc');
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

    // Handler when selecting a prescription to view detail
    const handleViewPrescriptionDetail = (prescription) => {
        setSelectedPrescription(prescription);
    };

    // Handler to dispense prescription
    const handleDispensePrescription = async () => {
        if (!selectedPrescription || !selectedPrescription.prescriptionId) {
            alert('Lỗi: Không tìm thấy thông tin đơn thuốc');
            return;
        }

        // Confirm before dispensing
        const confirmMessage = `Bạn có chắc chắn muốn cấp phát đơn thuốc #${selectedPrescription.prescriptionId}?\n\n` +
            `Bác sĩ: ${selectedPrescription.createdByEmployeeName || 'N/A'}\n` +
            `Ngày kê đơn: ${formatDate(selectedPrescription.prescriptionDate)}\n` +
            `Số loại thuốc: ${selectedPrescription.items?.length || 0}`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setDispensing(true);

            console.log('Dispensing prescription:', selectedPrescription.prescriptionId);

            const response = await pharmacistPrescriptionAPI.dispensePrescription(
                selectedPrescription.prescriptionId
            );

            console.log('Dispense response:', response);

            // Check for successful response
            if (response && (response.status === 'success' || response.status === 'OK')) {
                alert('✅ Cấp phát thuốc thành công!\n\nĐơn thuốc đã được chuyển sang trạng thái DISPENSED.');

                // Refresh the prescription list
                await loadPrescriptions(pagination.currentPage);

                // Go back to list view
                setSelectedPrescription(null);
            } else {
                alert('Có lỗi xảy ra khi cấp phát thuốc. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error dispensing prescription:', err);

            // Handle different error types
            let errorMessage = 'Không thể cấp phát thuốc';

            if (err.message) {
                if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
                    errorMessage = 'Bạn không có quyền cấp phát đơn thuốc này.';
                } else if (err.message.includes('404') || err.message.includes('Not Found')) {
                    errorMessage = 'Không tìm thấy đơn thuốc này.';
                } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
                    errorMessage = 'Đơn thuốc không hợp lệ hoặc không thể cấp phát.';
                } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
                    errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
                } else {
                    errorMessage = err.message;
                }
            }

            alert(`❌ Lỗi: ${errorMessage}`);
        } finally {
            setDispensing(false);
        }
    };

    return (
        <div className="prescription-page">
            {!selectedPrescription && (
                <>
                    <div className="page-header">
                        <h2 className="page-title">Danh sách đơn thuốc đã ký</h2>
                        <button
                            className="btn-refresh"
                            onClick={() => loadPrescriptions(pagination.currentPage)}
                            disabled={loading}
                        >
                            <FiRefreshCw /> Làm mới
                        </button>
                    </div>

                    {loading && (
                        <div className="loading-container">
                            <p>Đang tải danh sách đơn thuốc...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-container">
                            <p className="error-message">❌ {error}</p>
                            <button onClick={() => loadPrescriptions()}>Thử lại</button>
                        </div>
                    )}

                    {!loading && !error && prescriptions.length === 0 && (
                        <div className="empty-container">
                            <p>Không có đơn thuốc đã ký nào</p>
                        </div>
                    )}

                    {!loading && !error && prescriptions.length > 0 && (
                        <>
                            <div className="prescription-stats">
                                <p>Tổng số: <strong>{pagination.totalElements}</strong> đơn thuốc</p>
                                <p>Trang {pagination.currentPage + 1} / {pagination.totalPages}</p>
                            </div>

                            <div className="prescription-list">
                                {prescriptions.map((pres) => (
                                    <div key={pres.prescriptionId} className="prescription-item">
                                        <div className="prescription-info">
                                            <div className="prescription-code">
                                                Đơn #{pres.prescriptionId}
                                            </div>
                                            <div className="prescription-meta">
                                                <span>📅 Ngày cấp: {formatDate(pres.prescriptionDate)}</span>
                                                <span>👨‍⚕️ Bác sĩ: {pres.createdByEmployeeName}</span>
                                                <span>✍️ Đã ký: {formatDateTime(pres.signedAt)}</span>
                                                {pres.prescriptionType && (
                                                    <span className={`prescription-type ${pres.prescriptionType.toLowerCase()}`}>
                                                        {pres.prescriptionType === 'TU_TUC' ? '💊 Tự túc' :
                                                         pres.prescriptionType === 'BHYT' ? '🏥 BHYT' :
                                                         pres.prescriptionType}
                                                    </span>
                                                )}
                                                {pres.items && pres.items.length > 0 && (
                                                    <span className="medicine-count">
                                                        📦 {pres.items.length} loại thuốc
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewPrescriptionDetail(pres)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => loadPrescriptions(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 0 || loading}
                                        className="btn-page"
                                    >
                                        ← Trang trước
                                    </button>
                                    <span className="page-info">
                                        Trang {pagination.currentPage + 1} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => loadPrescriptions(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                                        className="btn-page"
                                    >
                                        Trang sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {selectedPrescription && (
                <div className="prescription-detail">
                    <h2 className="page-title">Chi tiết đơn thuốc #{selectedPrescription.prescriptionId}</h2>

                    <div className="prescription-header-info">
                        <div className="info-row">
                            <p><strong>Ngày kê đơn:</strong> {formatDate(selectedPrescription.prescriptionDate)}</p>
                            <p><strong>Bác sĩ kê đơn:</strong> {selectedPrescription.createdByEmployeeName}</p>
                        </div>
                        <div className="info-row">
                            <p><strong>Đã ký bởi:</strong> {selectedPrescription.signedByEmployeeName}</p>
                            <p><strong>Thời gian ký:</strong> {formatDateTime(selectedPrescription.signedAt)}</p>
                        </div>
                        <div className="info-row">
                            <p><strong>Loại đơn:</strong>
                                <span className={`badge ${selectedPrescription.prescriptionType?.toLowerCase()}`}>
                                    {selectedPrescription.prescriptionType === 'TU_TUC' ? 'Tự túc' :
                                     selectedPrescription.prescriptionType === 'BHYT' ? 'BHYT' :
                                     selectedPrescription.prescriptionType || 'N/A'}
                                </span>
                            </p>
                            <p><strong>Trạng thái:</strong>
                                <span className={`badge status-${selectedPrescription.status?.toLowerCase()}`}>
                                    {selectedPrescription.status === 'SIGNED' ? 'Đã ký' :
                                     selectedPrescription.status === 'DISPENSED' ? 'Đã cấp phát' :
                                     selectedPrescription.status || 'N/A'}
                                </span>
                            </p>
                        </div>
                        {selectedPrescription.diagnosisCode && (
                            <div className="info-row">
                                <p><strong>Mã chẩn đoán:</strong> {selectedPrescription.diagnosisCode}</p>
                            </div>
                        )}
                    </div>

                    {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                        <div className="medicine-table">
                            <h3>Bảng thuốc điều trị ({selectedPrescription.items.length} loại)</h3>
                            <table>
                                <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã thuốc</th>
                                    <th>Tên thuốc</th>
                                    <th>Liều dùng</th>
                                    <th>Số lượng</th>
                                    <th>Ghi chú</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedPrescription.items.map((item, index) => (
                                    <tr key={item.prescriptionItemId}>
                                        <td>{index + 1}</td>
                                        <td>{item.medicineId}</td>
                                        <td>{item.medicineName}</td>
                                        <td>{item.dosage || 'N/A'}</td>
                                        <td><strong>{item.quantity}</strong></td>
                                        <td>{item.notes || '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-medicines">
                            <p>⚠️ Đơn thuốc này chưa có thuốc nào</p>
                        </div>
                    )}

                    {selectedPrescription.counselingNotes && (
                        <div className="counseling-notes">
                            <h3>Ghi chú tư vấn</h3>
                            <p>{selectedPrescription.counselingNotes}</p>
                            {selectedPrescription.counseledByEmployeeName && (
                                <p className="counselor-info">
                                    <strong>Tư vấn bởi:</strong> {selectedPrescription.counseledByEmployeeName}
                                    {selectedPrescription.counseledAt && ` - ${formatDateTime(selectedPrescription.counseledAt)}`}
                                </p>
                            )}
                        </div>
                    )}


                    {selectedPrescription.dispensedAt && (
                        <div className="dispensed-info">
                            <h3>Thông tin cấp phát</h3>
                            <p><strong>Đã cấp phát bởi:</strong> {selectedPrescription.dispensedByEmployeeName || 'N/A'}</p>
                            <p><strong>Thời gian cấp phát:</strong> {formatDateTime(selectedPrescription.dispensedAt)}</p>
                        </div>
                    )}

                    <div className="signature">
                        <p>{new Date().toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                        <p><strong>Chữ ký bác sĩ: {selectedPrescription.signedByEmployeeName}</strong></p>
                    </div>

                    <div className="detail-actions">
                        {selectedPrescription.status === 'SIGNED' && (
                            <button
                                className="btn-issue"
                                onClick={handleDispensePrescription}
                                disabled={dispensing}
                            >
                                {dispensing ? '⏳ Đang xử lý...' : '✅ Cấp phát thuốc'}
                            </button>
                        )}
                        <button
                            className="btn-back"
                            onClick={() => setSelectedPrescription(null)}
                            disabled={dispensing}
                        >
                            ← Quay lại danh sách
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PrescriptionListPage;
