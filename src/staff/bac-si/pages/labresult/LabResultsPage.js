import React, { useState } from 'react';
import './LabResultsPage.css';

// --- NEW: Sub-component for the Modal ---
const ResultModal = ({ isOpen, onClose, orderData }) => {
    if (!isOpen || !orderData) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chi tiết kết quả CLS</h3>
                </div>
                <div className="modal-body">
                    <div className="result-info-grid">
                        <div className="info-item"><span>Bệnh nhân:</span><strong>{orderData.patientName}</strong></div>
                        <div className="info-item"><span>Dịch vụ:</span><strong>{orderData.serviceName}</strong></div>
                        <div className="info-item"><span>Ngày kết quả:</span><strong>{orderData.resultDate}</strong></div>
                        <div className="info-item"><span>Người thực hiện:</span><strong>{orderData.performer}</strong></div>
                    </div>
                    <div className="result-box">
                        <label>Kết quả:</label>
                        <p>{orderData.result}</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="close-btn">Đóng</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const LabResultsPage = () => {
    // UPDATED: Add more fields to mock data for the modal
    const [orders, setOrders] = useState([
        { id: 1, patientId: 'BN001', patientName: 'Nguyễn Văn An', serviceName: 'Xét nghiệm máu tổng quát', orderDate: '25/10/2025', status: 'Hoàn thành', resultDate: '26/10/2025', performer: 'Nguyễn Văn B', result: 'Bình thường' },
        { id: 2, patientId: 'BN001', patientName: 'Nguyễn Văn An', serviceName: 'X-quang ngực', orderDate: '25/10/2025', status: 'Đang chờ', resultDate: null, performer: null, result: null },
        { id: 3, patientId: 'BN002', patientName: 'Trần Thị Bình', serviceName: 'Siêu âm ổ bụng', orderDate: '26/10/2025', status: 'Hoàn thành', resultDate: '26/10/2025', performer: 'Trần Văn C', result: 'Không phát hiện bất thường.' },
    ]);

    // --- NEW: State to manage the modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleOpenModal = (order) => {
        if (order.status === 'Hoàn thành') {
            setSelectedOrder(order);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="lab-results-page">
            <div className="page-header">
                <div>
                    <h2>Kết quả Cận lâm sàng (CLS)</h2>
                    <p>Danh sách các chỉ định và kết quả xét nghiệm đã yêu cầu</p>
                </div>
            </div>

            <div className="card">
                <h3>Danh sách chỉ định đã yêu cầu</h3>
                <div className="results-list">
                    <div className="list-header">
                        <span>Mã BN</span>
                        <span>Tên BN</span>
                        <span>Dịch vụ/Xét nghiệm</span>
                        <span>Ngày chỉ định</span>
                        <span>Trạng thái</span>
                        <span>Hành động</span>
                    </div>
                    {orders.map(order => (
                        <div key={order.id} className="list-row">
                            <span className="patient-id">{order.patientId}</span>
                            <span>{order.patientName}</span>
                            <span className="service-name">{order.serviceName}</span>
                            <span>{order.orderDate}</span>
                            <span>{order.status}</span>
                            <span>
                                <button 
                                    className={`view-btn ${order.status === 'Hoàn thành' ? 'active' : 'disabled'}`}
                                    onClick={() => handleOpenModal(order)} // UPDATED
                                    disabled={order.status !== 'Hoàn thành'}
                                >
                                    Xem
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- NEW: Render the modal component --- */}
            <ResultModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                orderData={selectedOrder}
            />
        </div>
    );
};

export default LabResultsPage;