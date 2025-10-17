import React, { useState } from 'react';
import './AdmissionPage.css'; // File CSS chúng ta sẽ tạo ở bước sau

const AdmissionPage = () => {
    // State cho form nhập viện
    const [admissionData, setAdmissionData] = useState({
        patientId: '', patientName: '', dob: '', diagnosis: '', bed: '', admissionDate: ''
    });

    // State cho form xuất viện
    const [dischargeData, setDischargeData] = useState({
        patientId: '', patientName: '', currentBed: '', dischargeDate: '', reason: '', summary: ''
    });

    const handleAdmissionChange = (e) => {
        setAdmissionData({ ...admissionData, [e.target.name]: e.target.value });
    };

    const handleDischargeChange = (e) => {
        setDischargeData({ ...dischargeData, [e.target.name]: e.target.value });
    };

    const handleAdmissionSubmit = (e) => {
        e.preventDefault();
        console.log("Admission Data:", admissionData);
        alert('Đã thêm thông tin nhập viện!');
    };

    const handleDischargeSubmit = (e) => {
        e.preventDefault();
        console.log("Discharge Data:", dischargeData);
        alert('Đã xử lý xuất viện!');
    };

    return (
        <div className="admission-discharge-page">
            <div className="page-header">
                <div>
                    <h2>Nhập / Xuất viện</h2>
                    <p>Thực hiện các thủ tục hành chính cho bệnh nhân nội trú</p>
                </div>
            </div>

            <div className="forms-container">
                {/* --- Cột Nhập viện --- */}
                <div className="form-card">
                    <h3>Thông tin nhập viện</h3>
                    <form onSubmit={handleAdmissionSubmit}>
                        <div className="form-group"><label>Mã bệnh nhân</label><input type="text" name="patientId" onChange={handleAdmissionChange} /></div>
                        <div className="form-group"><label>Họ tên bệnh nhân</label><input type="text" name="patientName" onChange={handleAdmissionChange} /></div>
                        <div className="form-group"><label>Ngày sinh</label><input type="date" name="dob" onChange={handleAdmissionChange} /></div>
                        <div className="form-group"><label>Chẩn đoán</label><input type="text" name="diagnosis" onChange={handleAdmissionChange} /></div>
                        <div className="form-group"><label>Chọn giường</label><input type="text" name="bed" onChange={handleAdmissionChange} /></div>
                        <div className="form-group"><label>Ngày nhập viện</label><input type="date" name="admissionDate" onChange={handleAdmissionChange} /></div>
                        <button type="submit" className="btn btn-primary">Thêm thông tin</button>
                    </form>
                </div>

                {/* --- Cột Xuất viện --- */}
                <div className="form-card">
                    <h3>Thông tin xuất viện</h3>
                    <form onSubmit={handleDischargeSubmit}>
                        <div className="form-group"><label>Mã bệnh nhân</label><input type="text" name="patientId" onChange={handleDischargeChange} /></div>
                        <div className="form-group"><label>Họ tên bệnh nhân</label><input type="text" name="patientName" onChange={handleDischargeChange} /></div>
                        <div className="form-group"><label>Giường hiện tại</label><input type="text" name="currentBed" onChange={handleDischargeChange} /></div>
                        <div className="form-group"><label>Ngày xuất viện</label><input type="date" name="dischargeDate" onChange={handleDischargeChange} /></div>
                        <div className="form-group"><label>Lý do xuất viện</label><input type="text" name="reason" onChange={handleDischargeChange} /></div>
                        <div className="form-group"><label>Tóm tắt điều trị</label><textarea name="summary" rows="3" onChange={handleDischargeChange}></textarea></div>
                        <button type="submit" className="btn btn-success">Xuất viện</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdmissionPage;