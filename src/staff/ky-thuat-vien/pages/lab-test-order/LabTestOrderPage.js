import React from 'react';
import './LabTestOrderPage.css';
import { FiClipboard, FiAlertCircle } from 'react-icons/fi';

const LabTestOrderPage = () => {
    return (
        <div className="lab-test-order-page">
            <div className="page-header">
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Lab Test Order</h1>
                        <p>Quản lý yêu cầu xét nghiệm</p>
                    </div>
                </div>
            </div>

            <div className="page-content">
                <div className="placeholder-card">
                    <FiAlertCircle className="placeholder-icon" />
                    <h3>Tính năng đang phát triển</h3>
                    <p>Trang quản lý Lab Test Order sẽ được hoàn thiện sớm</p>
                </div>
            </div>
        </div>
    );
};

export default LabTestOrderPage;

