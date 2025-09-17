import React, { useState } from 'react';
import './DatLichKham.css';

const DatLichKham = () => {
  // State để quản lý dữ liệu form
  const [formData, setFormData] = useState({
    ten: '',
    email: '',
    tenNguoiKham: '',
    ngayThangNamSinh: '',
    ngayKham: '',
    chuyenKhoa: '',
    soDienThoai: '',
    gioiTinh: '',
    gioKham: '',
    bacSi: '',
    moTaSucKhoe: ''
  });

  // Hàm xử lý thay đổi input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Hàm xử lý submit form
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Đặt lịch khám với dữ liệu:', formData);
    alert('Đặt lịch khám thành công!');
  };

  return (
    <div className="dat-lich-kham-container">
      <div className="dat-lich-kham-content">
        {/* Tiêu đề và phụ đề */}
        <div className="header-section">
          <h1>Đặt Lịch Khám</h1>
          <p>Vui lòng điền đầy đủ thông tin để đặt lịch khám bệnh</p>
        </div>

        {/* Form đặt lịch */}
        <form onSubmit={handleSubmit} className="dat-lich-form">
          <div className="form-columns">
            {/* Cột 1 */}
            <div className="column-1">
              <div className="form-group">
                <label htmlFor="ten">Tên *</label>
                <input
                  type="text"
                  id="ten"
                  name="ten"
                  placeholder="Nhập tên của bạn"
                  value={formData.ten}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenNguoiKham">Tên người khám *</label>
                <input
                  type="text"
                  id="tenNguoiKham"
                  name="tenNguoiKham"
                  placeholder="Nhập tên người khám"
                  value={formData.tenNguoiKham}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngayThangNamSinh">Ngày tháng năm sinh *</label>
                <input
                  type="date"
                  id="ngayThangNamSinh"
                  name="ngayThangNamSinh"
                  value={formData.ngayThangNamSinh}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngayKham">Chọn ngày khám *</label>
                <input
                  type="date"
                  id="ngayKham"
                  name="ngayKham"
                  value={formData.ngayKham}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="chuyenKhoa">Chuyên khoa *</label>
                <select
                  id="chuyenKhoa"
                  name="chuyenKhoa"
                  value={formData.chuyenKhoa}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn chuyên khoa</option>
                  <option value="noi-khoa">Nội khoa</option>
                  <option value="ngoai-khoa">Ngoại khoa</option>
                  <option value="san-phu-khoa">Sản phụ khoa</option>
                  <option value="nhi-khoa">Nhi khoa</option>
                  <option value="mat">Mắt</option>
                  <option value="tai-mui-hong">Tai mũi họng</option>
                  <option value="da-lieu">Da liễu</option>
                  <option value="rang-ham-mat">Răng hàm mặt</option>
                </select>
              </div>
            </div>

            {/* Cột 2 */}
            <div className="column-2">
              <div className="form-group">
                <label htmlFor="soDienThoai">Số điện thoại *</label>
                <input
                  type="tel"
                  id="soDienThoai"
                  name="soDienThoai"
                  placeholder="Nhập số điện thoại"
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gioiTinh">Giới tính *</label>
                <select
                  id="gioiTinh"
                  name="gioiTinh"
                  value={formData.gioiTinh}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                  <option value="khac">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gioKham">Giờ khám *</label>
                <select
                  id="gioKham"
                  name="gioKham"
                  value={formData.gioKham}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giờ khám</option>
                  <option value="08:00">08:00</option>
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bacSi">Bác sĩ</label>
                <select
                  id="bacSi"
                  name="bacSi"
                  value={formData.bacSi}
                  onChange={handleChange}
                >
                  <option value="">Chọn bác sĩ (tùy chọn)</option>
                  <option value="bs-nguyen-van-a">BS. Nguyễn Văn A</option>
                  <option value="bs-tran-thi-b">BS. Trần Thị B</option>
                  <option value="bs-le-van-c">BS. Lê Văn C</option>
                  <option value="bs-pham-thi-d">BS. Phạm Thị D</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mô tả sức khỏe - nằm cả hai cột */}
          <div className="form-group full-width">
            <label htmlFor="moTaSucKhoe">Mô tả sức khỏe</label>
            <textarea
              id="moTaSucKhoe"
              name="moTaSucKhoe"
              placeholder="Mô tả tình trạng sức khỏe hiện tại, triệu chứng..."
              value={formData.moTaSucKhoe}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* Nút đặt lịch */}
          <div className="submit-section">
            <button type="submit" className="dat-lich-btn">
              Đặt Lịch Khám
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatLichKham;
