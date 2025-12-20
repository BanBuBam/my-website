import React, { useState, useEffect } from 'react';
import { pharmacistEmployeeAPI } from '../../../../services/staff/pharmacistAPI';
import { FiX, FiUser, FiSearch, FiPackage } from 'react-icons/fi';
import './DispensingModal.css';

const DispensingModal = ({ isOpen, onClose, onConfirm, group, loading }) => {
    const [nurses, setNurses] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState('');
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [nursesLoading, setNursesLoading] = useState(false);
    const [nursesError, setNursesError] = useState(null);

    // Tải danh sách điều dưỡng
    const fetchNurses = async () => {
        setNursesLoading(true);
        setNursesError(null);
        try {
            const response = await pharmacistEmployeeAPI.getNurses();
            if (response && response.data && response.data.content) {
                setNurses(response.data.content);
            } else {
                setNurses([]);
            }
        } catch (err) {
            setNursesError(err.message || 'Không thể tải danh sách điều dưỡng');
            setNurses([]);
        } finally {
            setNursesLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNurses();
            setSelectedNurse('');
            setNotes('');
            setSearchTerm('');
        }
    }, [isOpen]);

    // Lọc danh sách điều dưỡng theo từ khóa tìm kiếm
    const filteredNurses = nurses.filter(nurse =>
        nurse.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nurse.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nurse.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirm = () => {
        if (!selectedNurse) {
            alert('Vui lòng chọn điều dưỡng nhận thuốc');
            return;
        }

        const selectedNurseData = nurses.find(nurse => nurse.employeeId.toString() === selectedNurse);
        onConfirm(selectedNurse, notes, selectedNurseData);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dispensing-modal-overlay">
            <div className="dispensing-modal">
                <div className="modal-header">
                    <h3>
                        <FiPackage />
                        Dispensing Nhóm Y lệnh #{group?.medicationOrderGroupId}
                    </h3>
                    <button 
                        className="btn-close" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Thông tin nhóm y lệnh */}
                    <div className="group-info">
                        <h4>Thông tin nhóm y lệnh</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Bệnh nhân:</label>
                                <span>{group?.patientName}</span>
                            </div>
                            <div className="info-item">
                                <label>Số lượng thuốc:</label>
                                <span>{group?.medicationCount} loại</span>
                            </div>
                            <div className="info-item">
                                <label>Bác sĩ chỉ định:</label>
                                <span>{group?.orderedByDoctorName}</span>
                            </div>
                            <div className="info-item">
                                <label>Trạng thái:</label>
                                <span className="status-badge">{group?.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chọn điều dưỡng */}
                    <div className="nurse-selection">
                        <h4>Chọn điều dưỡng nhận thuốc</h4>
                        
                        {/* Tìm kiếm */}
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm điều dưỡng theo tên, mã nhân viên hoặc khoa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Danh sách điều dưỡng */}
                        <div className="nurses-list">
                            {nursesLoading ? (
                                <div className="loading-nurses">
                                    <p>Đang tải danh sách điều dưỡng...</p>
                                </div>
                            ) : nursesError ? (
                                <div className="error-nurses">
                                    <p>{nursesError}</p>
                                    <button onClick={fetchNurses} className="btn-retry">
                                        Thử lại
                                    </button>
                                </div>
                            ) : filteredNurses.length === 0 ? (
                                <div className="no-nurses">
                                    <p>Không tìm thấy điều dưỡng nào</p>
                                </div>
                            ) : (
                                <div className="nurses-grid">
                                    {filteredNurses.map(nurse => (
                                        <div
                                            key={nurse.employeeId}
                                            className={`nurse-card ${selectedNurse === nurse.employeeId.toString() ? 'selected' : ''}`}
                                            onClick={() => !loading && setSelectedNurse(nurse.employeeId.toString())}
                                        >
                                            <div className="nurse-info">
                                                <div className="nurse-name">
                                                    <FiUser />
                                                    <span>{nurse.fullName}</span>
                                                </div>
                                                <div className="nurse-details">
                                                    <span className="employee-code">Mã: {nurse.employeeCode}</span>
                                                    <span className="department">{nurse.departmentName}</span>
                                                    <span className="job-title">{nurse.jobTitle}</span>
                                                </div>
                                            </div>
                                            <div className="selection-indicator">
                                                {selectedNurse === nurse.employeeId.toString() && (
                                                    <div className="selected-check">✓</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="notes-section">
                        <label htmlFor="dispensing-notes">Ghi chú dispensing (tùy chọn)</label>
                        <textarea
                            id="dispensing-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Nhập ghi chú về quá trình dispensing..."
                            rows={3}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn-cancel" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button 
                        className="btn-confirm" 
                        onClick={handleConfirm}
                        disabled={loading || !selectedNurse}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận Dispensing'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DispensingModal;