import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import "./UnbilledVisitsListPage.css";

const UnbilledVisitsListPage = () => {
    const [filterDate, setFilterDate] = useState("");

    // Mock dữ liệu
    const visits = [
        {
            id: "LK001",
            patientName: "Nguyễn Văn A",
            department: "Khoa Nội",
            visitDate: "2025-09-30",
            symptom: "Sốt cao, đau đầu",
        },
        {
            id: "LK002",
            patientName: "Trần Thị B",
            department: "Khoa Nhi",
            visitDate: "2025-09-29",
            symptom: "Ho khan, mệt mỏi",
        },
        {
            id: "LK003",
            patientName: "Lê Văn C",
            department: "Khoa Da liễu",
            visitDate: "2025-09-30",
            symptom: "Dị ứng nổi mẩn đỏ",
        },
    ];

    // Lọc theo ngày
    const filteredVisits = filterDate
        ? visits.filter((v) => v.visitDate === filterDate)
        : visits;

    return (
        <div className="unbilled-visits-page">
            <h2>Danh sách lượt khám chưa có hóa đơn</h2>

            {/* Bộ lọc ngày */}
            <div className="filter-section">
                <label>Lọc theo ngày khám: </label>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>

            {/* Danh sách */}
            <div className="visit-list">
                {filteredVisits.length === 0 ? (
                    <p>Không có lượt khám nào phù hợp.</p>
                ) : (
                    filteredVisits.map((visit) => (
                        <div key={visit.id} className="visit-card">
                            <div className="visit-info">
                                <h3 className="patient-name">{visit.patientName}</h3>
                                <p>Phòng khám: {visit.department}</p>
                                <p>Ngày khám: {visit.visitDate}</p>
                                <p>Triệu chứng: {visit.symptom}</p>
                            </div>
                            <div className="visit-action">
                                <button
                                    className="detail-button"
                                    onClick={() =>
                                        window.location.href = `/visit-detail/${visit.id}`
                                    }
                                >
                                    <FiEye /> Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UnbilledVisitsListPage;
