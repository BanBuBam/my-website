import React, { useState } from 'react';
import './DatLichKhamPage.css'; // File CSS chúng ta sẽ tạo ở bước sau

const DatLichKhamPage = () => {
  // State để quản lý việc check vào ô "Đăng ký cho người thân"
  const [isForRelative, setIsForRelative] = useState(false);

  // State để lưu trữ toàn bộ dữ liệu của form
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    hoTenNguoiKham: '',
    soDienThoaiNguoiKham: '',
    namSinh: '',
    gioiTinh: '',
    ngayKham: '',
    gioKham: '',
    chuyenKhoa: '',
    bacSi: '',
    moTa: '',
  });

  // Hàm xử lý khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setIsForRelative(checked);
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Hàm xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dữ liệu form:', formData);
    if (isForRelative) {
      console.log('Đây là lịch khám đặt cho người thân.');
    }
    // Logic gọi API để gửi dữ liệu đi sẽ ở đây
    alert('Yêu cầu đặt lịch đã được gửi đi!');
  };

  return (
    <div className="booking-page-container">
      <div className="booking-form-wrapper">
        <div className="booking-header">
          <h1>Đặt lịch khám</h1>
          <p>
            Cảm ơn Quý Khách hàng đã quan tâm đến dịch vụ chăm sóc sức khỏe của chúng tôi. Vui lòng gửi thông tin chi tiết để chúng tôi có thể sắp xếp cuộc hẹn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-grid">
            {/* --- THÔNG TIN NGƯỜI LIÊN HỆ --- */}
            <div className="form-group">
              <label htmlFor="hoTen" className="required">Họ tên</label>
              <input type="text" id="hoTen" name="hoTen" value={formData.hoTen} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="soDienThoai" className="required">Số điện thoại</label>
              <input type="tel" id="soDienThoai" name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group checkbox-group">
              <input type="checkbox" id="isForRelative" checked={isForRelative} onChange={handleChange} />
              <label htmlFor="isForRelative">Đăng ký cho người thân</label>
            </div>

            {/* --- THÔNG TIN NGƯỜI KHÁM (CHỈ HIỂN THỊ KHI CHECKBOX ĐƯỢC CHỌN) --- */}
            {isForRelative && (
              <>
                <div className="form-group">
                  <label htmlFor="hoTenNguoiKham" className="required">Họ tên người khám</label>
                  <input type="text" id="hoTenNguoiKham" name="hoTenNguoiKham" value={formData.hoTenNguoiKham} onChange={handleChange} required={isForRelative} />
                </div>
                <div className="form-group">
                  <label htmlFor="soDienThoaiNguoiKham" className="required">Số điện thoại người khám</label>
                  <input type="tel" id="soDienThoaiNguoiKham" name="soDienThoaiNguoiKham" value={formData.soDienThoaiNguoiKham} onChange={handleChange} required={isForRelative} />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="namSinh" className="required">Năm sinh</label>
              <input type="number" id="namSinh" name="namSinh" value={formData.namSinh} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="gioiTinh" className="required">Giới tính</label>
              <select id="gioiTinh" name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} required>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Khac">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="ngayKham" className="required">Chọn ngày khám</label>
              <input type="date" id="ngayKham" name="ngayKham" value={formData.ngayKham} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="gioKham" className="required">Chọn giờ khám</label>
              <select id="gioKham" name="gioKham" value={formData.gioKham} onChange={handleChange} required>
                <option value="">Chọn giờ</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="chuyenKhoa" className="required">Chuyên khoa</label>
              <select id="chuyenKhoa" name="chuyenKhoa" value={formData.chuyenKhoa} onChange={handleChange} required>
                <option value="">Chọn chuyên khoa</option>
                <option value="Tim mach">Tim mạch</option>
                <option value="Tai mui hong">Tai mũi họng</option>
                <option value="Da lieu">Da liễu</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="bacSi">Bác sĩ</label>
              <select id="bacSi" name="bacSi" value={formData.bacSi} onChange={handleChange}>
                <option value="">Chọn bác sĩ (tùy chọn)</option>
                <option value="BS Nguyen Van A">BS Nguyễn Văn A</option>
                <option value="BS Tran Thi B">BS Trần Thị B</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label htmlFor="moTa">Mô tả tình trạng sức khoẻ</label>
              <textarea id="moTa" name="moTa" rows="4" value={formData.moTa} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">Đặt lịch khám</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatLichKhamPage;