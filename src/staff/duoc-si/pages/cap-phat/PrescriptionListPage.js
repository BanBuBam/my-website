import React, { useState } from 'react';
import './PrescriptionListPage.css';

const PrescriptionListPage = () => {
    // Mock danh sách đơn thuốc
    const [prescriptions] = useState([
        {
            id: 'HD001',
            date: '30/09/2025',
            patientName: 'Nguyễn Văn A',
            patient: {
                name: 'Nguyễn Văn A',
                dob: '12/03/1995',
                address: 'Số 12, Đường Trần Hưng Đạo, Hà Nội',
                cccd: '0123456789',
                bhyt: 'BHYT123456789',
                weight: '65kg',
                gender: 'Nam',
                phone: '0987654321'
            },
            diagnosis: [
                { code: 'CD001', name: 'Viêm họng cấp', result: 'Cần theo dõi thêm' },
                { code: 'CD002', name: 'Sốt nhẹ', result: 'Điều trị tại nhà' },
            ],
            note: 'Bệnh nhân cần uống thuốc đúng giờ, theo dõi nhiệt độ hàng ngày.',
            treatmentType: 'Nội trú',
            medicines: [
                { code: 'M001', active: 'Paracetamol', name: 'Paracetamol 500mg', unit: 'Viên', qty: 10, usage: 'Uống 2 viên/ngày sau ăn' },
                { code: 'M002', active: 'Amoxicillin', name: 'Amoxicillin 500mg', unit: 'Viên', qty: 14, usage: 'Uống 2 viên/ngày sau ăn' },
            ],
            doctorAdvice: 'Bệnh nhân nên uống nhiều nước và nghỉ ngơi.'
        },
        {
            id: 'HD002',
            date: '01/10/2025',
            patientName: 'Trần Thị B',
            patient: {
                name: 'Trần Thị B',
                dob: '20/11/2002',
                address: 'Phường Bách Khoa, Hai Bà Trưng, Hà Nội',
                cccd: '0987654321',
                bhyt: 'BHYT987654321',
                weight: '50kg',
                gender: 'Nữ',
                phone: '0912345678'
            },
            diagnosis: [
                { code: 'CD003', name: 'Viêm phế quản', result: 'Cần uống thuốc và tái khám sau 7 ngày' }
            ],
            note: 'Theo dõi triệu chứng khó thở.',
            treatmentType: 'Nội trú',
            medicines: [
                { code: 'M003', active: 'Vitamin C', name: 'Vitamin C 1000mg', unit: 'Viên', qty: 7, usage: 'Uống 1 viên/ngày' }
            ],
            doctorAdvice: 'Tránh gió, giữ ấm cơ thể.'
        }
    ]);

    const [selectedPrescription, setSelectedPrescription] = useState(null);

    return (
        <div className="prescription-page">
            {!selectedPrescription && (
                <>
                    <h2 className="page-title">Danh sách đơn thuốc chờ cấp phát</h2>
                    <div className="prescription-list">
                        {prescriptions.map((pres) => (
                            <div key={pres.id} className="prescription-item">
                                <div className="prescription-info">
                                    <div className="prescription-code">{pres.id}</div>
                                    <div className="prescription-meta">
                                        <span>Ngày cấp: {pres.date}</span>
                                        <span>Bệnh nhân: {pres.patientName}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn-view"
                                    onClick={() => setSelectedPrescription(pres)}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {selectedPrescription && (
                <div className="prescription-detail">
                    <h2 className="page-title">Chi tiết đơn thuốc</h2>

                    <div className="patient-info">
                        <h3>Thông tin bệnh nhân</h3>
                        <p><strong>Họ tên:</strong> {selectedPrescription.patient.name}</p>
                        <p><strong>Ngày sinh:</strong> {selectedPrescription.patient.dob}</p>
                        <p><strong>Địa chỉ:</strong> {selectedPrescription.patient.address}</p>
                        <p><strong>CCCD:</strong> {selectedPrescription.patient.cccd}</p>
                        <p><strong>Số BHYT:</strong> {selectedPrescription.patient.bhyt}</p>
                        <p><strong>Cân nặng:</strong> {selectedPrescription.patient.weight}</p>
                        <p><strong>Giới tính:</strong> {selectedPrescription.patient.gender}</p>
                        <p><strong>SĐT:</strong> {selectedPrescription.patient.phone}</p>
                    </div>

                    <div className="diagnosis-table">
                        <h3>Bảng chẩn đoán</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Chẩn đoán</th>
                                <th>Kết luận</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedPrescription.diagnosis.map((d, index) => (
                                <tr key={index}>
                                    <td>{d.code}</td>
                                    <td>{d.name}</td>
                                    <td>{d.result}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <p><strong>Lưu ý của bác sĩ:</strong> {selectedPrescription.note}</p>
                    <p><strong>Hình thức điều trị:</strong> {selectedPrescription.treatmentType}</p>

                    <div className="medicine-table">
                        <h3>Bảng thuốc điều trị</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>Mã thuốc</th>
                                <th>Hoạt chất</th>
                                <th>Tên thuốc</th>
                                <th>ĐVT</th>
                                <th>SL</th>
                                <th>Cách dùng</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedPrescription.medicines.map((m, index) => (
                                <tr key={index}>
                                    <td>{m.code}</td>
                                    <td>{m.active}</td>
                                    <td>{m.name}</td>
                                    <td>{m.unit}</td>
                                    <td>{m.qty}</td>
                                    <td>{m.usage}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="doctor-advice">
                        <p><strong>Lời dẫn của bác sĩ:</strong> {selectedPrescription.doctorAdvice}</p>
                    </div>

                    <div className="signature">
                        <p>Hà Nội, ngày 05 tháng 07, 2025</p>
                        <p><strong>Chữ ký bác sĩ</strong></p>
                    </div>

                    <div className="footer-note">
                        <p>Lịch tái khám sau ................. nếu có bất thường</p>
                        <p>Mang đơn này khi tái khám</p>
                        <p>Tên bố hoặc mẹ của trẻ đưa khám bệnh</p>
                    </div>

                    <div className="detail-actions">
                        <button className="btn-issue">Cấp phát thuốc</button>
                        <button className="btn-back" onClick={() => setSelectedPrescription(null)}>
                            Quay lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrescriptionListPage;
