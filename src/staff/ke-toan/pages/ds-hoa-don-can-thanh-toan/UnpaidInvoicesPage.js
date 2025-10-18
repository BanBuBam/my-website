import React from 'react';
import './UnpaidInvoicesPage.css';
import {useNavigate} from "react-router-dom";

const UnpaidInvoicesPage = () => {
    const navigate = useNavigate();
    const invoices = [
        { id: 'HD001', date: '05/09/2025', creator: 'Nguyễn Văn A' },
        { id: 'HD002', date: '06/09/2025', creator: 'Trần Thị B' },
        { id: 'HD003', date: '07/09/2025', creator: 'Lê Văn C' },
    ];

    return (
        <div className="unpaid-invoices">
            <h2>Danh sách Hóa đơn Chưa Thanh toán</h2>
            <div className="invoice-list">
                {invoices.map((invoice) => (
                    <div key={invoice.id} className="invoice-card">
                        <div className="invoice-info">
                            <h4>{invoice.id}</h4>
                            <p>Ngày tạo: {invoice.date}</p>
                            <p>Người tạo: {invoice.creator}</p>
                        </div>
                        <button
                            className="detail-btn"
                            onClick={() => navigate("/staff/tai-chinh/chitiet-tt")}
                        >Xem chi tiết</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UnpaidInvoicesPage;
