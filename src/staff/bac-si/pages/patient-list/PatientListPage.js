import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiSearch, FiAlertCircle, FiChevronLeft, FiChevronRight, FiUserPlus, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { patientListAPI } from '../../../../services/staff/doctorAPI';
import './PatientListPage.css';

const PatientListPage = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Fetch patients data
    const fetchPatients = useCallback(async (name = '', page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await patientListAPI.searchPatients({
                name: name.trim(),
                page,
                size: pageSize
            });

            if (response && response.data) {
                setPatients(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
                setCurrentPage(response.data.number || 0);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError(err.message || 'Không thể tải danh sách bệnh nhân');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    // Initial load
    useEffect(() => {
        fetchPatients('', 0);
    }, [fetchPatients]);

    // Handle search with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchName(value);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            setCurrentPage(0);
            fetchPatients(value, 0);
        }, 500);

        setSearchTimeout(timeout);
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            fetchPatients(searchName, newPage);
        }
    };

    // Format date to DD/MM/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format gender
    const formatGender = (gender) => {
        if (!gender) return 'N/A';
        return gender.toLowerCase() === 'male' ? 'Nam' : gender.toLowerCase() === 'female' ? 'Nữ' : gender;
    };

    return (
        <div className="patient-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiUsers className="header-icon" />
                    <div>
                        <h1>Danh sách bệnh nhân</h1>
                        <p>Quản lý và tra cứu thông tin bệnh nhân</p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-input-group">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm kiếm theo tên bệnh nhân..."
                        value={searchName}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="search-info">
                    {totalElements > 0 && (
                        <span>Tìm thấy {totalElements} bệnh nhân</span>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <FiUsers className="loading-icon" />
                    <p>Đang tải danh sách bệnh nhân...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="error-state">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Patient List Table */}
            {!loading && !error && patients.length > 0 && (
                <div className="table-section">
                    <div className="table-container">
                        <table className="patient-table">
                            <thead>
                                <tr>
                                    <th>Mã BN</th>
                                    <th>Họ và tên</th>
                                    <th>Ngày sinh</th>
                                    <th>Tuổi</th>
                                    <th>Giới tính</th>
                                    <th>Số điện thoại</th>
                                    <th>Email</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.patientId}>
                                        <td>
                                            <span className="patient-code">{patient.patientCode || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span className="patient-name">{patient.fullName || 'N/A'}</span>
                                        </td>
                                        <td>{formatDate(patient.dateOfBirth)}</td>
                                        <td>{patient.age || 'N/A'}</td>
                                        <td>{formatGender(patient.gender)}</td>
                                        <td>{patient.phoneNumber || 'N/A'}</td>
                                        <td>{patient.email || 'N/A'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-action btn-admit" title="Nhập viện">
                                                    <FiUserPlus />
                                                    <span>Nhập viện</span>
                                                </button>
                                                <button className="btn-action btn-complete" title="Hoàn thành khám">
                                                    <FiCheckCircle />
                                                    <span>Hoàn thành khám</span>
                                                </button>
                                                <button className="btn-action btn-prescription" title="Tạo đơn thuốc">
                                                    <FiFileText />
                                                    <span>Tạo đơn thuốc</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                <FiChevronLeft />
                                <span>Trước</span>
                            </button>
                            <div className="pagination-info">
                                <span>Trang {currentPage + 1} / {totalPages}</span>
                            </div>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                <span>Sau</span>
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && patients.length === 0 && (
                <div className="no-data">
                    <FiUsers />
                    <p>Không tìm thấy bệnh nhân nào</p>
                    {searchName && (
                        <p className="no-data-hint">Thử tìm kiếm với từ khóa khác</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientListPage;

