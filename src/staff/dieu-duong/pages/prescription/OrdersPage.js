import React, { useState } from 'react';
import './OrdersPage.css';
import { FiRefreshCw } from 'react-icons/fi'; // Example icon for update button

const mockOrders = [
    { 
        id: 1, 
        timestamp: '15/05/2023 10:30', 
        patientName: 'Nguyễn Văn A', 
        patientRoom: 'P.301-G.2', 
        orderType: 'Thuốc', 
        contentTitle: 'Paracetamol 500mg', 
        contentDetail: '1 viên x 3 lần/ngày', 
        doctor: 'BS. Nguyễn Văn B', 
        status: 'Chờ thực hiện' 
    },
    { 
        id: 2, 
        timestamp: '15/05/2023 10:30', 
        patientName: 'Nguyễn Văn A', 
        patientRoom: 'P.301-G.2', 
        orderType: 'Xét nghiệm', 
        contentTitle: 'Công thức máu', 
        contentDetail: 'Lấy mẫu trước 9h sáng', 
        doctor: 'BS. Nguyễn Văn B', 
        status: 'Chờ thực hiện' 
    },
    { 
        id: 3, 
        timestamp: '15/05/2023 10:30', 
        patientName: 'Nguyễn Văn A', 
        patientRoom: 'P.301-G.2', 
        orderType: 'Theo dõi', 
        contentTitle: 'Theo dõi huyết áp', 
        contentDetail: 'Đo mỗi 4 giờ', 
        doctor: 'BS. Nguyễn Văn B', 
        status: 'Đang thực hiện' 
    },
];

const OrdersPage = () => {
    const [orders, setOrders] = useState(mockOrders);

    // Function to handle status change by cycling through statuses
    const handleUpdateStatus = (orderId, currentStatus) => {
        let nextStatus = currentStatus;
        if (currentStatus === 'Chờ thực hiện') {
            nextStatus = 'Đang thực hiện';
        } else if (currentStatus === 'Đang thực hiện') {
            nextStatus = 'Hoàn thành';
        }
        // If status is 'Hoàn thành', it remains 'Hoàn thành' as the button will be disabled

        setOrders(currentOrders => 
            currentOrders.map(order => 
                order.id === orderId ? { ...order, status: nextStatus } : order
            )
        );
    };

    // Helper to get CSS class from order type/status
    const getBadgeClass = (type) => {
        return type.toLowerCase().replace(/ /g, '-');
    };

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h2>Y lệnh cần thực hiện</h2>
                    <p>Danh sách các y lệnh từ bác sĩ cần điều dưỡng thực hiện</p>
                </div>
            </div>

            <div className="card">
                <h3>Danh sách y lệnh cần thực hiện</h3>
                <div className="orders-list">
                    <div className="list-header">
                        <span>Thời gian</span>
                        <span>Bệnh nhân</span>
                        <span>Loại y lệnh</span>
                        <span>Nội dung</span>
                        <span>Bác sĩ</span>
                        <span>Trạng thái</span>
                        <span>Cập nhật</span>
                    </div>
                    {orders.map(order => (
                        <div key={order.id} className="order-row">
                            <div className="cell-time">{order.timestamp}</div>
                            <div className="cell-patient">
                                <span className="patient-name">{order.patientName}</span>
                                <span className="patient-room">{order.patientRoom}</span>
                            </div>
                            <div>
                                <span className={`order-type-badge type-${getBadgeClass(order.orderType)}`}>
                                    {order.orderType}
                                </span>
                            </div>
                            <div className="cell-content">
                                <span className="content-title">{order.contentTitle}</span>
                                <span className="content-detail">{order.contentDetail}</span>
                            </div>
                            <div className="cell-doctor">{order.doctor}</div>
                            <div>
                                <span className={`status-badge status-${getBadgeClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="cell-action">
                                <button
                                    className="update-status-btn"
                                    onClick={() => handleUpdateStatus(order.id, order.status)}
                                    disabled={order.status === 'Hoàn thành'}
                                >
                                    <FiRefreshCw />
                                    {order.status === 'Chờ thực hiện' && 'Bắt đầu'}
                                    {order.status === 'Đang thực hiện' && 'Hoàn thành'}
                                    {order.status === 'Hoàn thành' && 'Đã xong'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;