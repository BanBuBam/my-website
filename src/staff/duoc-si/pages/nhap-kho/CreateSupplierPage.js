import React, { useState } from 'react';
import './CreateSupplierPage.css';

const CreateSupplierPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        taxCode: '',
        address: '',
        accountNumber: '',
        representative: '',
        representativeAccount: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        alert('Lưu nhà cung cấp thành công!\n' + JSON.stringify(formData, null, 2));
    };

    return (
        <div className="create-supplier-page">
            <h2>Tạo mới Nhà cung cấp</h2>
            <div className="form-group">
                <label>Tên nhà cung cấp:</label>
                <input name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Mã số thuế:</label>
                <input name="taxCode" value={formData.taxCode} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Địa chỉ:</label>
                <input name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Số tài khoản:</label>
                <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Tên chủ đại diện:</label>
                <input name="representative" value={formData.representative} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Số tài khoản đại diện:</label>
                <input name="representativeAccount" value={formData.representativeAccount} onChange={handleChange} />
            </div>

            <div className="sign-section">
                <p>Hà Nội, ngày 05 tháng 09, 2025</p>
                <p><strong>Người nộp tiền</strong></p>
                <p>(Ký, ghi rõ họ tên)</p>
            </div>

            <button className="btn-save" onClick={handleSave}>Lưu</button>
        </div>
    );
};

export default CreateSupplierPage;
