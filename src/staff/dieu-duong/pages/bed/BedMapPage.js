import React, { useState, useEffect, useMemo } from 'react';
import './BedMapPage.css';
import {FiGrid, FiX, FiPlus, FiArrowLeft, FiLoader} from 'react-icons/fi';
import { nurseBedAPI } from '../../../../services/staff/nurseAPI';
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
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false);
    
    // 1. Tải danh sách khoa khi component được render
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await nurseBedAPI.getDepartments('', 0, 30);
                if (response && (response.status === 'OK' || response.code === 200)) {
                    // Response mới có cấu trúc: data.content (paginated)
                    const deptData = response.data?.content || response.data || [];
                    setDepartments(deptData);
                    // Tự động chọn khoa đầu tiên
                    if (deptData.length > 0) {
                        setSelectedDepartment(deptData[0].id);
                    }
                }
            } catch (err) {
                setError('Không thể tải danh sách khoa');
            }
        };
        fetchDepartments();
    }, []);
    
    // 2. Tải danh sách giường khi `selectedDepartment` thay đổi
    useEffect(() => {
        if (!selectedDepartment) return;
        
        const fetchBeds = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await nurseBedAPI.getBedsByDepartment(selectedDepartment);
                if (response && response.data) {
                    setBeds(response.data);
                } else {
                    setBeds([]);
                }
            } catch (err) {
                setError('Không thể tải danh sách giường');
                setBeds([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBeds();
    }, [selectedDepartment]);
    
    // 3. Nhóm giường theo phòng (sử dụng roomNumber từ API)
    const bedsByRoom = useMemo(() => {
        return beds.reduce((acc, bed) => {
            const room = bed.roomNumber || 'Phòng không xác định';
            if (!acc[room]) {
                acc[room] = [];
            }
            acc[room].push(bed);
            return acc;
        }, {});
    }, [beds]);
    
    // 4. Xử lý mở/đóng Modal
    const handleOpenModal = async (bed) => {
        if (bed.occupied) {
            setSelectedBed(bed);
            setIsModalOpen(true);
            setLoadingModal(true);
            
            try {
                // LƯU Ý: Cần một API thật để lấy chi tiết bệnh nhân + y lệnh
                // Dùng API giả định getBedDetails
                const response = await nurseBedAPI.getBedDetails(bed.hospitalBedId);
                setModalData(response.data); // Dữ liệu từ API chi tiết
            } catch (err) {
                // Xử lý lỗi
            } finally {
                setLoadingModal(false);
            }
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBed(null);
        setModalData(null);
    };
    
    // 5. Hàm xác định CSS class dựa trên dữ liệu API
    const getStatusClass = (bed) => {
        if (bed.occupied) return 'status-occupied';
        if (bed.inMaintenance) return 'status-cleaning';
        if (bed.available) return 'status-empty';
        return ''; // Mặc định
    };
    
    // 6. Hàm xác định nội dung text cho thẻ giường
    const renderBedBody = (bed) => {
        if (bed.occupied) {
            return (
                <>
                    <span className="patient-name">{bed.currentPatientName || '...'}</span>
                    <span className="patient-id">Mã BN: {bed.currentPatientId}</span>
                </>
            );
        }
        if (bed.inMaintenance) {
            return <span className="bed-status-text">Đang dọn dẹp</span>;
        }
        if (bed.available) {
            return <span className="bed-status-text">Trống</span>;
        }
        return <span className="bed-status-text">{bed.statusDescription}</span>;
    };
    
    return (
        <div className="bed-map-page">
            <div className="page-header">
                <div>
                    <h2>Sơ đồ giường bệnh</h2>
                    <p>Tổng quan tình trạng giường bệnh tại các khoa</p>
                </div>
            </div>
            
            {/* Bộ lọc khoa */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="filter-section">
                    <label htmlFor="dept-select" style={{ fontWeight: 500, marginRight: '1rem' }}>
                        Chọn khoa:
                    </label>
                    <select
                        id="dept-select"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.departmentName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="card">
                <div className="bed-map-header">
                    <h3>Sơ đồ giường bệnh - {departments.find(d => d.id === selectedDepartment)?.departmentName}</h3>
                    <div className="legend">
                        <div className="legend-item"><span className="dot empty"></span>Trống</div>
                        <div className="legend-item"><span className="dot occupied"></span>Có bệnh nhân</div>
                        <div className="legend-item"><span className="dot cleaning"></span>Đang dọn dẹp</div>
                    </div>
                </div>
                
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> Đang tải...
                    </div>
                )}
                {error && <div style={{ color: 'red', padding: '2rem' }}>{error}</div>}
                
                {!loading && !error && (
                    <div className="rooms-container">
                        {Object.keys(bedsByRoom).length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                Không tìm thấy giường nào cho khoa này.
                            </div>
                        )}
                        {Object.entries(bedsByRoom).map(([room, bedsInRoom]) => (
                            <div key={room} className="room-section">
                                <h4>Phòng {room}</h4>
                                <div className="beds-grid">
                                    {bedsInRoom.map(bed => (
                                        <div
                                            key={bed.hospitalBedId}
                                            className={`bed-card ${getStatusClass(bed)}`}
                                            onClick={() => handleOpenModal(bed)}
                                        >
                                            <div className="bed-card-header">
                                                <FiGrid className="bed-icon" />
                                                <span className="bed-name">{bed.bedNumber}</span>
                                            </div>
                                            <div className="bed-card-body">
                                                {renderBedBody(bed)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Modal - Cần API chi tiết giường/bệnh nhân */}
            <BedInfoModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                // Dữ liệu cho modal nên đến từ một API chi tiết
                bedData={loadingModal ? null : modalData}
                // onUpdate={...} // Xử lý khi y lệnh được cập nhật
            />
        </div>
    );
};

export default BedMapPage;