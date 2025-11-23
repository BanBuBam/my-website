import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ClinicalNotesPage.css';
import {
    FiSearch, FiUser, FiClock, FiList, FiX,
    FiCheckCircle, FiFileText, FiPlus, FiEdit, FiEdit2, FiPrinter
} from 'react-icons/fi';
import { doctorEncounterAPI, icdDiseaseAPI } from '../../../../services/staff/doctorAPI';

const ClinicalNotesPage = () => {
    const location = useLocation();
    const [encounterId, setEncounterId] = useState('');
    const [encounter, setEncounter] = useState(null);
    const [clinicalNotes, setClinicalNotes] = useState([]);
    const [icdDiseases, setIcdDiseases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [error, setError] = useState(null);
    const [showNotesListModal, setShowNotesListModal] = useState(false);
    const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
    const [showEditNoteModal, setShowEditNoteModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [exportingNoteId, setExportingNoteId] = useState(null);

    // Clinical note form data
    const [noteFormData, setNoteFormData] = useState({
        diagnosis: '',
        icdDiseaseId: '',
        noteType: 'GENERAL',
        notes: ''
    });

    const loadEncounterById = async (id) => {
        if (!id || !id.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setEncounter(null);

            const response = await doctorEncounterAPI.getEncounterStatus(id.trim());

            if (response && response.data) {
                setEncounter(response.data);
            } else {
                setError('Không tìm thấy encounter');
            }
        } catch (err) {
            console.error('Error fetching encounter:', err);
            setError(err.message || 'Không thể tải thông tin encounter');
        } finally {
            setLoading(false);
        }
    };

    // Load ICD diseases on component mount
    useEffect(() => {
        const fetchIcdDiseases = async () => {
            try {
                const response = await icdDiseaseAPI.getICDDiseases();
                if (response && response.data) {
                    setIcdDiseases(response.data);
                }
            } catch (err) {
                console.error('Error loading ICD diseases:', err);
            }
        };
        fetchIcdDiseases();
    }, []);

    // Auto-load encounter if encounterId is passed via navigation state
    useEffect(() => {
        if (location.state?.encounterId) {
            const encounterIdFromState = location.state.encounterId.toString();
            setEncounterId(encounterIdFromState);
            // Auto-trigger search
            loadEncounterById(encounterIdFromState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const handleSearchEncounter = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            alert('Vui lòng nhập Encounter ID');
            return;
        }

        loadEncounterById(encounterId);
    };

    const handleViewClinicalNotes = async () => {
        try {
            setLoadingNotes(true);
            setShowNotesListModal(true);

            const response = await doctorEncounterAPI.getClinicalNotes(encounter.encounterId);

            if (response && response.data) {
                setClinicalNotes(response.data);
            }
        } catch (err) {
            console.error('Error loading clinical notes:', err);
            alert(err.message || 'Không thể tải danh sách clinical notes');
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleCreateNote = () => {
        setNoteFormData({
            diagnosis: '',
            icdDiseaseId: '',
            noteType: 'GENERAL',
            notes: ''
        });
        setShowCreateNoteModal(true);
    };

    const handleNoteFormChange = (e) => {
        const { name, value } = e.target;
        setNoteFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitNote = async (e) => {
        e.preventDefault();

        if (!noteFormData.diagnosis || !noteFormData.notes) {
            alert('Vui lòng điền đầy đủ thông tin chẩn đoán và ghi chú');
            return;
        }

        try {
            setSubmitting(true);

            const submitData = {
                diagnosis: noteFormData.diagnosis,
                icdDiseaseId: noteFormData.icdDiseaseId ? parseInt(noteFormData.icdDiseaseId) : null,
                noteType: noteFormData.noteType,
                notes: noteFormData.notes
            };

            const response = await doctorEncounterAPI.createClinicalNote(encounter.encounterId, submitData);

            if (response && response.data) {
                alert('Tạo clinical note thành công!');
                setShowCreateNoteModal(false);
                setNoteFormData({
                    diagnosis: '',
                    icdDiseaseId: '',
                    noteType: 'GENERAL',
                    notes: ''
                });
                // Refresh notes list if modal is open
                if (showNotesListModal) {
                    const refreshResponse = await doctorEncounterAPI.getClinicalNotes(encounter.encounterId);
                    if (refreshResponse && refreshResponse.data) {
                        setClinicalNotes(refreshResponse.data);
                    }
                }
            }
        } catch (err) {
            console.error('Error creating clinical note:', err);
            alert(err.message || 'Không thể tạo clinical note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setNoteFormData({
            diagnosis: note.diagnosis || '',
            icdDiseaseId: note.icdDiseaseId || '',
            noteType: note.noteType || 'GENERAL',
            notes: note.notes || ''
        });
        setShowEditNoteModal(true);
    };

    const handleUpdateNote = async (e) => {
        e.preventDefault();

        if (!noteFormData.diagnosis || !noteFormData.notes) {
            alert('Vui lòng điền đầy đủ thông tin chẩn đoán và ghi chú');
            return;
        }

        try {
            setSubmitting(true);

            const submitData = {
                diagnosis: noteFormData.diagnosis,
                icdDiseaseId: noteFormData.icdDiseaseId ? parseInt(noteFormData.icdDiseaseId) : null,
                noteType: noteFormData.noteType,
                notes: noteFormData.notes
            };

            const response = await doctorEncounterAPI.updateClinicalNote(editingNote.clinicalNoteId, submitData);

            if (response && response.data) {
                alert('Cập nhật clinical note thành công!');
                setShowEditNoteModal(false);
                setEditingNote(null);
                setNoteFormData({
                    diagnosis: '',
                    icdDiseaseId: '',
                    noteType: 'GENERAL',
                    notes: ''
                });
                // Refresh notes list
                const refreshResponse = await doctorEncounterAPI.getClinicalNotes(encounter.encounterId);
                if (refreshResponse && refreshResponse.data) {
                    setClinicalNotes(refreshResponse.data);
                }
            }
        } catch (err) {
            console.error('Error updating clinical note:', err);
            alert(err.message || 'Không thể cập nhật clinical note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignNote = async (noteId) => {
        if (!window.confirm('Bạn có chắc chắn muốn ký clinical note này? Sau khi ký sẽ không thể chỉnh sửa.')) {
            return;
        }

        try {
            const response = await doctorEncounterAPI.signClinicalNote(noteId);

            if (response && response.data) {
                alert('Ký clinical note thành công!');
                // Refresh notes list
                const refreshResponse = await doctorEncounterAPI.getClinicalNotes(encounter.encounterId);
                if (refreshResponse && refreshResponse.data) {
                    setClinicalNotes(refreshResponse.data);
                }
            }
        } catch (err) {
            console.error('Error signing clinical note:', err);
            alert(err.message || 'Không thể ký clinical note');
        }
    };

    const handlePrintNote = async (clinicalNoteId) => {
        try {
            setExportingNoteId(clinicalNoteId);
            const blob = await doctorEncounterAPI.exportClinicalNotePDF(clinicalNoteId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `clinical-note-${clinicalNoteId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert(err.message || 'Không thể xuất PDF');
        } finally {
            setExportingNoteId(null);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'DRAFT': '#f59e0b',
            'SIGNED': '#10b981',
            'AMENDED': '#3b82f6',
            'CANCELLED': '#ef4444'
        };
        return statusColors[status] || '#6b7280';
    };

    return (
        <div className="clinical-notes-page">
            <div className="page-header">
                <div className="header-content">
                    <FiFileText className="header-icon" />
                    <div>
                        <h1>Clinical Notes</h1>
                        <p>Quản lý ghi chú lâm sàng</p>
                    </div>
                </div>
            </div>

            <div className="search-section">
                <form onSubmit={handleSearchEncounter} className="search-form">
                    <div className="search-input-group">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Nhập Encounter ID..."
                            value={encounterId}
                            onChange={(e) => setEncounterId(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin encounter...</p>
                </div>
            )}

            {encounter && !loading && (
                <div className="encounter-card">
                    <div className="encounter-header">
                        <div className="encounter-title">
                            <FiUser />
                            <h2>Thông tin Encounter</h2>
                        </div>
                        <span
                            className="encounter-status-badge"
                            style={{ backgroundColor: getStatusColor(encounter.status), color: '#fff' }}
                        >
                            {encounter.status}
                        </span>
                    </div>
                    <div className="encounter-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Encounter ID:</span>
                                <span className="info-value">{encounter.encounterId}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Bệnh nhân:</span>
                                <span className="info-value">{encounter.patientName}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Mã BN:</span>
                                <span className="info-value">{encounter.patientCode}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Loại:</span>
                                <span className="info-value">{encounter.encounterType}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Bác sĩ:</span>
                                <span className="info-value">{encounter.doctorName || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock /> Thời gian:
                                </span>
                                <span className="info-value">{formatDateTime(encounter.encounterDatetime)}</span>
                            </div>
                        </div>
                        <div className="encounter-footer">
                            <button className="btn-view-notes" onClick={handleViewClinicalNotes}>
                                <FiList /> Xem Clinical Notes
                            </button>
                            <button className="btn-create-note" onClick={handleCreateNote}>
                                <FiPlus /> Tạo Clinical Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Clinical Notes Modal */}
            {showNotesListModal && (
                <div className="modal-overlay" onClick={() => setShowNotesListModal(false)}>
                    <div className="modal-content notes-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách Clinical Notes</h3>
                            <button className="modal-close" onClick={() => setShowNotesListModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            {loadingNotes ? (
                                <div className="loading-state-small">
                                    <div className="spinner-small"></div>
                                    <p>Đang tải clinical notes...</p>
                                </div>
                            ) : clinicalNotes.length === 0 ? (
                                <div className="empty-state-small">
                                    <FiFileText />
                                    <p>Chưa có clinical note nào</p>
                                </div>
                            ) : (
                                <div className="notes-list">
                                    {clinicalNotes.map((note) => (
                                        <div key={note.clinicalNoteId} className="note-card">
                                            <div className="note-header">
                                                <div className="note-title">
                                                    <FiFileText />
                                                    <strong>Clinical Note #{note.clinicalNoteId}</strong>
                                                    <span
                                                        className="note-status-badge"
                                                        style={{ backgroundColor: getStatusColor(note.status), color: '#fff' }}
                                                    >
                                                        {note.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="note-body">
                                                <div className="note-info-grid">
                                                    <div className="note-info-item">
                                                        <span className="note-label">Chẩn đoán:</span>
                                                        <span className="note-value">{note.diagnosis || '-'}</span>
                                                    </div>
                                                    {note.icdCode && (
                                                        <div className="note-info-item">
                                                            <span className="note-label">Mã ICD:</span>
                                                            <span className="note-value">{note.icdCode} - {note.diseaseName}</span>
                                                        </div>
                                                    )}
                                                    <div className="note-info-item">
                                                        <span className="note-label">Loại ghi chú:</span>
                                                        <span className="note-value">{note.noteType || '-'}</span>
                                                    </div>
                                                    <div className="note-info-item">
                                                        <span className="note-label">Người tạo:</span>
                                                        <span className="note-value">{note.createdByEmployeeName || '-'}</span>
                                                    </div>
                                                    <div className="note-info-item">
                                                        <span className="note-label">Ngày tạo:</span>
                                                        <span className="note-value">{formatDateTime(note.createdAt)}</span>
                                                    </div>
                                                    {note.signedByEmployeeName && (
                                                        <div className="note-info-item">
                                                            <span className="note-label">Người ký:</span>
                                                            <span className="note-value">{note.signedByEmployeeName}</span>
                                                        </div>
                                                    )}
                                                    {note.signedAt && (
                                                        <div className="note-info-item">
                                                            <span className="note-label">Ngày ký:</span>
                                                            <span className="note-value">{formatDateTime(note.signedAt)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {note.notes && (
                                                    <div className="note-content">
                                                        <strong>Ghi chú:</strong>
                                                        <pre>{note.notes}</pre>
                                                    </div>
                                                )}
                                                <div className="note-actions">
                                                    {note.status === 'DRAFT' && (
                                                        <>
                                                            <button
                                                                className="btn-edit-note"
                                                                onClick={() => handleEditNote(note)}
                                                            >
                                                                <FiEdit2 /> Chỉnh sửa
                                                            </button>
                                                            <button
                                                                className="btn-sign-note"
                                                                onClick={() => handleSignNote(note.clinicalNoteId)}
                                                            >
                                                                <FiCheckCircle /> Ký note
                                                            </button>
                                                        </>
                                                    )}
                                                    {note.status === 'SIGNED' && (
                                                        <>
                                                            <span className="note-signed-info">
                                                                <FiCheckCircle /> Đã ký
                                                            </span>
                                                            <button
                                                                className="btn-print-note"
                                                                onClick={() => handlePrintNote(note.clinicalNoteId)}
                                                                disabled={exportingNoteId === note.clinicalNoteId}
                                                            >
                                                                <FiPrinter />
                                                                {exportingNoteId === note.clinicalNoteId ? 'Đang xuất...' : 'In Clinical Note'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Clinical Note Modal */}
            {showCreateNoteModal && (
                <div className="modal-overlay" onClick={() => setShowCreateNoteModal(false)}>
                    <div className="modal-content create-note-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo Clinical Note</h3>
                            <button className="modal-close" onClick={() => setShowCreateNoteModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitNote}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Chẩn đoán <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="diagnosis"
                                            value={noteFormData.diagnosis}
                                            onChange={handleNoteFormChange}
                                            placeholder="Nhập chẩn đoán"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mã bệnh ICD</label>
                                        <select
                                            name="icdDiseaseId"
                                            value={noteFormData.icdDiseaseId}
                                            onChange={handleNoteFormChange}
                                        >
                                            <option value="">-- Chọn mã ICD (tùy chọn) --</option>
                                            {icdDiseases.map((disease) => (
                                                <option key={disease.icdDiseaseId} value={disease.icdDiseaseId}>
                                                    {disease.icdCode} - {disease.diseaseName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Loại ghi chú <span className="required">*</span></label>
                                        <select
                                            name="noteType"
                                            value={noteFormData.noteType}
                                            onChange={handleNoteFormChange}
                                            required
                                        >
                                            <option value="GENERAL">GENERAL</option>
                                            <option value="PROGRESS">PROGRESS</option>
                                            <option value="DISCHARGE">DISCHARGE</option>
                                            <option value="CONSULTATION">CONSULTATION</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Ghi chú lâm sàng <span className="required">*</span></label>
                                        <textarea
                                            name="notes"
                                            value={noteFormData.notes}
                                            onChange={handleNoteFormChange}
                                            placeholder="Nhập ghi chú lâm sàng chi tiết..."
                                            rows="10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowCreateNoteModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo Clinical Note'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Clinical Note Modal */}
            {showEditNoteModal && (
                <div className="modal-overlay" onClick={() => setShowEditNoteModal(false)}>
                    <div className="modal-content create-note-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chỉnh sửa Clinical Note #{editingNote?.clinicalNoteId}</h3>
                            <button className="modal-close" onClick={() => setShowEditNoteModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleUpdateNote}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Chẩn đoán <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="diagnosis"
                                            value={noteFormData.diagnosis}
                                            onChange={handleNoteFormChange}
                                            placeholder="Nhập chẩn đoán"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mã bệnh ICD</label>
                                        <select
                                            name="icdDiseaseId"
                                            value={noteFormData.icdDiseaseId}
                                            onChange={handleNoteFormChange}
                                        >
                                            <option value="">-- Chọn mã ICD (tùy chọn) --</option>
                                            {icdDiseases.map((disease) => (
                                                <option key={disease.icdDiseaseId} value={disease.icdDiseaseId}>
                                                    {disease.icdCode} - {disease.diseaseName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Loại ghi chú <span className="required">*</span></label>
                                        <select
                                            name="noteType"
                                            value={noteFormData.noteType}
                                            onChange={handleNoteFormChange}
                                            required
                                        >
                                            <option value="GENERAL">GENERAL</option>
                                            <option value="PROGRESS">PROGRESS</option>
                                            <option value="DISCHARGE">DISCHARGE</option>
                                            <option value="CONSULTATION">CONSULTATION</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Ghi chú lâm sàng <span className="required">*</span></label>
                                        <textarea
                                            name="notes"
                                            value={noteFormData.notes}
                                            onChange={handleNoteFormChange}
                                            placeholder="Nhập ghi chú lâm sàng chi tiết..."
                                            rows="10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowEditNoteModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Đang cập nhật...' : 'Cập nhật Clinical Note'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicalNotesPage;

