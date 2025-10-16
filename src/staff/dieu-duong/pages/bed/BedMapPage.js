import React, { useState, useEffect, useMemo } from 'react';
import './BedMapPage.css';
import { FiGrid, FiX, FiPlus, FiArrowLeft } from 'react-icons/fi';

// --- Mock Data ---
const mockBeds = [
    { 
        id: 1, name: 'Giường 1', room: 'Phòng 301', status: 'Trống' 
    },
    { 
        id: 2, name: 'Giường 2', room: 'Phòng 301', status: 'Có bệnh nhân', 
        patient: { 
            id: 'BN-123', name: 'Nguyễn Văn A', age: 56, gender: 'Nam', 
            diagnosis: 'Viêm phổi', admissionDate: '12/06/2025',
            orders: [
                { id: 1, medicine: 'Paracetamol 500mg', dosage: '1 viên x 3 lần/ngày', doctor: 'BS. Nguyễn Văn A', timestamp: '10:30 15/06/2023' }
            ]
        } 
    },
    { 
        id: 3, name: 'Giường 3', room: 'Phòng 301', status: 'Trống' 
    },
    { 
        id: 4, name: 'Giường 4', room: 'Phòng 302', status: 'Đang dọn dẹp' 
    },
    { 
        id: 5, name: 'Giường 5', room: 'Phòng 302', status: 'Có bệnh nhân', 
        patient: {
            id: 'BN-456', name: 'Trần Thị B', age: 62, gender: 'Nữ',
            diagnosis: 'Suy tim', admissionDate: '11/06/2025',
            orders: [
                { id: 2, medicine: 'Furosemide 40mg', dosage: '1 viên x 2 lần/ngày', doctor: 'BS. Trần Minh Hoàng', timestamp: '09:00 15/06/2023' }
            ]
        }
    },
];

// --- Sub-component for the Detail Modal ---
const BedInfoModal = ({ isOpen, onClose, bedData, onUpdate }) => {
    const [modalView, setModalView] = useState('details'); // 'details' or 'add-order'
    const [newOrder, setNewOrder] = useState({ medicine: '', dosage: '', doctor: '' });

    useEffect(() => {
        if (isOpen) {
            setModalView('details'); // Reset to detail view every time the modal opens
            setNewOrder({ medicine: '', dosage: '', doctor: '' }); // Reset the new order form
        }
    }, [isOpen]);

    const handleNewOrderChange = (e) => {
        const { name, value } = e.target;
        setNewOrder(prev => ({...prev, [name]: value}));
    };

    const handleSaveNewOrder = () => {
        if (!newOrder.medicine || !newOrder.dosage || !newOrder.doctor) {
            alert('Vui lòng điền đủ thông tin y lệnh.');
            return;
        }
        const orderToAdd = {
            id: Date.now(),
            ...newOrder,
            timestamp: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };
        
        const updatedBedData = {
            ...bedData,
            patient: {
                ...bedData.patient,
                orders: [...bedData.patient.orders, orderToAdd]
            }
        };

        onUpdate(updatedBedData);
        setModalView('details');
    };

    if (!isOpen || !bedData) return null;
    const { patient } = bedData;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {modalView === 'details' ? (
                    <>
                        <div className="modal-header">
                            <h3>Thông tin giường</h3>
                            <button onClick={onClose} className="close-btn"><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="info-card">
                                <h4>Thông tin bệnh nhân</h4>
                                <div className="patient-details-grid">
                                    <span><strong>Mã BN:</strong> {patient.id}</span>
                                    <span><strong>Họ tên:</strong> {patient.name}</span>
                                    <span><strong>Tuổi:</strong> {patient.age}</span>
                                    <span><strong>Giới tính:</strong> {patient.gender}</span>
                                    <span><strong>Chẩn đoán:</strong> {patient.diagnosis}</span>
                                    <span><strong>Ngày nhập viện:</strong> {patient.admissionDate}</span>
                                </div>
                            </div>
                            <div className="info-card">
                                <h4>Y lệnh hiện tại:</h4>
                                <div className="orders-list">
                                    <ul>
                                        {patient.orders.map(order => (
                                            <li key={order.id}>
                                                <span className="order-medicine">{order.medicine}</span>
                                                <span className="order-dosage">Liều dùng: {order.dosage}</span>
                                                <span className="order-meta">BS. {order.doctor} - {order.timestamp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={() => setModalView('add-order')}><FiPlus /> Thêm y lệnh</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-header">
                            <h3>Thêm y lệnh mới</h3>
                            <button onClick={() => setModalView('details')} className="back-button"><FiArrowLeft /> Quay lại</button>
                        </div>
                        <div className="modal-body">
                            <div className="add-order-form">
                                <div className="form-group">
                                    <label>Tên thuốc/Dịch vụ</label>
                                    <input type="text" name="medicine" value={newOrder.medicine} onChange={handleNewOrderChange} placeholder="VD: Paracetamol 500mg" />
                                </div>
                                <div className="form-group">
                                    <label>Liều dùng/Cách dùng</label>
                                    <input type="text" name="dosage" value={newOrder.dosage} onChange={handleNewOrderChange} placeholder="VD: 1 viên x 3 lần/ngày" />
                                </div>
                                <div className="form-group">
                                    <label>Bác sĩ chỉ định</label>
                                    <input type="text" name="doctor" value={newOrder.doctor} onChange={handleNewOrderChange} placeholder="Nhập tên bác sĩ" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalView('details')}>Hủy</button>
                            <button className="btn-primary" onClick={handleSaveNewOrder}>Lưu y lệnh</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---
const BedMapPage = () => {
    const [beds, setBeds] = useState(mockBeds);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);

    const bedsByRoom = useMemo(() => {
        return beds.reduce((acc, bed) => {
            if (!acc[bed.room]) {
                acc[bed.room] = [];
            }
            acc[bed.room].push(bed);
            return acc;
        }, {});
    }, [beds]);

    const handleOpenModal = (bed) => {
        if (bed.status === 'Có bệnh nhân') {
            setSelectedBed(bed);
            setIsModalOpen(true);
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBed(null);
    };

    const handleUpdateBedData = (updatedBed) => {
        setBeds(beds.map(b => b.id === updatedBed.id ? updatedBed : b));
        setSelectedBed(updatedBed); // Update the selected bed data to show new order immediately
    };

    const getStatusClass = (status) => {
        if (status === 'Trống') return 'status-empty';
        if (status === 'Có bệnh nhân') return 'status-occupied';
        if (status === 'Đang dọn dẹp') return 'status-cleaning';
        return '';
    };

    return (
        <div className="bed-map-page">
            <div className="page-header">
                <div>
                    <h2>Sơ đồ giường bệnh</h2>
                    <p>Tổng quan tình trạng giường bệnh tại các khoa</p>
                </div>
            </div>
            <div className="card">
                <div className="bed-map-header">
                    <h3>Sơ đồ giường bệnh - Khoa Nội tổng hợp</h3>
                    <div className="legend">
                        <div className="legend-item"><span className="dot empty"></span>Trống</div>
                        <div className="legend-item"><span className="dot occupied"></span>Có bệnh nhân</div>
                        <div className="legend-item"><span className="dot cleaning"></span>Đang dọn dẹp</div>
                    </div>
                </div>
                <div className="rooms-container">
                    {Object.entries(bedsByRoom).map(([room, bedsInRoom]) => (
                        <div key={room} className="room-section">
                            <h4>{room}</h4>
                            <div className="beds-grid">
                                {bedsInRoom.map(bed => (
                                    <div 
                                        key={bed.id} 
                                        className={`bed-card ${getStatusClass(bed.status)}`}
                                        onClick={() => handleOpenModal(bed)}
                                    >
                                        <div className="bed-card-header">
                                            <FiGrid className="bed-icon" />
                                            <span className="bed-name">{bed.name}</span>
                                        </div>
                                        <div className="bed-card-body">
                                            {bed.status === 'Có bệnh nhân' ? (
                                                <>
                                                    <span className="patient-name">{bed.patient.name}</span>
                                                    <span className="patient-id">{bed.patient.id}</span>
                                                </>
                                            ) : (
                                                <span className="bed-status-text">{bed.status}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <BedInfoModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                bedData={selectedBed}
                onUpdate={handleUpdateBedData}
            />
        </div>
    );
};

export default BedMapPage;