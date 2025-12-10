import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiSave, FiPlus, FiTrash2, FiSearch, FiAlertCircle } from 'react-icons/fi';
import './DischargeWithPrescriptionModal.css';

const DischargeWithPrescriptionModal = ({ emergencyEncounterId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [formData, setFormData] = useState({
    dischargeDiagnosis: '',
    diagnosisCode: '',
    dischargeSummary: '',
    dischargeInstructions: '',
    followUpDate: '',
    followUpNotes: '',
    warningSigns: '',
    createPrescription: true,
    prescriptionType: 'OUTPATIENT',
    prescriptionItems: [],
    prescriptionNotes: '',
  });

  useEffect(() => {
    fetchAllMedicines();
  }, []);

  const fetchAllMedicines = async () => {
    try {
      const response = await medicineAPI.getAllMedicines();
      if (response && response.data) {
        setAllMedicines(response.data);
        setMedicines(response.data);
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Không thể tải danh sách thuốc');
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setMedicines(allMedicines);
      return;
    }

    const filtered = allMedicines.filter((med) =>
      med.medicineName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      med.sku.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setMedicines(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptionItems: [
        ...prev.prescriptionItems,
        {
          medicineId: '',
          dosage: '',
          quantity: 1,
          notes: '',
        },
      ],
    }));
  };

  const handleRemoveMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dischargeDiagnosis) {
      setError('Vui lòng nhập chẩn đoán xuất viện');
      return;
    }

    if (formData.createPrescription && formData.prescriptionItems.length === 0) {
      setError('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        prescriptionItems: formData.prescriptionItems.map((item) => ({
          ...item,
          medicineId: parseInt(item.medicineId),
          quantity: parseInt(item.quantity),
        })),
      };

      await onSuccess(submitData);
    } catch (err) {
      console.error('Error discharging patient:', err);
      setError(err.message || 'Không thể xuất viện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="discharge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Xuất viện có đơn thuốc</h3>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Thông tin chẩn đoán */}
          <div className="form-section">
            <h4>Thông tin chẩn đoán</h4>
            <div className="form-group">
              <label>
                Chẩn đoán xuất viện <span className="required">*</span>
              </label>
              <input
                type="text"
                name="dischargeDiagnosis"
                value={formData.dischargeDiagnosis}
                onChange={handleChange}
                placeholder="Nhập chẩn đoán"
                required
              />
            </div>

            <div className="form-group">
              <label>Mã chẩn đoán (ICD-10)</label>
              <input
                type="text"
                name="diagnosisCode"
                value={formData.diagnosisCode}
                onChange={handleChange}
                placeholder="Nhập mã ICD-10"
              />
            </div>

            <div className="form-group">
              <label>Tóm tắt xuất viện</label>
              <textarea
                name="dischargeSummary"
                value={formData.dischargeSummary}
                onChange={handleChange}
                placeholder="Nhập tóm tắt"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Hướng dẫn xuất viện</label>
              <textarea
                name="dischargeInstructions"
                value={formData.dischargeInstructions}
                onChange={handleChange}
                placeholder="Nhập hướng dẫn"
                rows="3"
              />
            </div>
          </div>

          {/* Thông tin tái khám */}
          <div className="form-section">
            <h4>Thông tin tái khám</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Ngày tái khám</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Ghi chú tái khám</label>
                <input
                  type="text"
                  name="followUpNotes"
                  value={formData.followUpNotes}
                  onChange={handleChange}
                  placeholder="Nhập ghi chú"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dấu hiệu cảnh báo</label>
              <textarea
                name="warningSigns"
                value={formData.warningSigns}
                onChange={handleChange}
                placeholder="Nhập dấu hiệu cảnh báo cần quay lại"
                rows="2"
              />
            </div>
          </div>

          {/* Đơn thuốc */}
          <div className="form-section">
            <div className="section-header">
              <h4>Đơn thuốc</h4>
              <button type="button" className="btn-add-medicine" onClick={handleAddMedicine}>
                <FiPlus /> Thêm thuốc
              </button>
            </div>

            {/* Search medicines */}
            <div className="medicine-search">
              <input
                type="text"
                placeholder="Tìm kiếm thuốc theo tên hoặc SKU..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  if (e.target.value === '') {
                    setMedicines(allMedicines);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button type="button" className="btn-search" onClick={handleSearch}>
                <FiSearch /> Tìm
              </button>
            </div>
            {medicines.length > 0 && (
              <p className="medicine-count">Tìm thấy {medicines.length} thuốc</p>
            )}

            {/* Prescription items */}
            <div className="prescription-items">
              {formData.prescriptionItems.map((item, index) => (
                <div key={index} className="prescription-item">
                  <div className="item-header">
                    <span>Thuốc #{index + 1}</span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="item-fields">
                    <div className="form-group">
                      <label>Thuốc</label>
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value)}
                        required
                      >
                        <option value="">-- Chọn thuốc --</option>
                        {medicines.map((med) => (
                          <option key={med.medicineId} value={med.medicineId}>
                            {med.medicineName} - {med.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Liều dùng</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        placeholder="VD: 1 viên x 2 lần/ngày"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Số lượng</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Ghi chú</label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleMedicineChange(index, 'notes', e.target.value)}
                        placeholder="Ghi chú về thuốc"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.prescriptionItems.length === 0 && (
                <div className="empty-state">
                  <p>Chưa có thuốc nào. Click "Thêm thuốc" để thêm.</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Ghi chú đơn thuốc</label>
              <textarea
                name="prescriptionNotes"
                value={formData.prescriptionNotes}
                onChange={handleChange}
                placeholder="Nhập ghi chú chung cho đơn thuốc"
                rows="2"
              />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit" onClick={handleSubmit} disabled={loading}>
            <FiSave /> {loading ? 'Đang xử lý...' : 'Xuất viện'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DischargeWithPrescriptionModal;
