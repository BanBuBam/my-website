import React, { useState } from 'react';
import './CapNhatThongTin.css';

const CapNhatThongTin = () => {
  // State để quản lý dữ liệu form
  const [formData, setFormData] = useState({
    ho: '',
    ten: '',
    ngaySinh: '',
    gioiTinh: '',
    cccd: '',
    soDienThoai: '',
    email: '',
    diaChiCuThe: '',
    xa: '',
    tinh: '',
    anhDaiDien: null,
    tenNguoiLienHe: '',
    soDienThoaiLienHe: '',
    nhomMau: '',
    diUng: '',
    ngheNghiep: '',
    tinhTrangHonNhan: ''
  });

  // Hàm xử lý thay đổi input
  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    
    if (type === 'file') {
      setFormData(prevState => ({
        ...prevState,
        [name]: files[0]
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Cập nhật thông tin với dữ liệu:', formData);
    alert('Cập nhật thông tin thành công!');
  };

  return (
    <div className="cap-nhat-thong-tin-container">
      <div className="cap-nhat-thong-tin-content">
        {/* Tiêu đề và phụ đề */}
        <div className="header-section">
          <h1>Thông tin người dùng</h1>
          <p>Cập nhật đầy đủ thông tin người dùng</p>
        </div>

        {/* Form cập nhật thông tin */}
        <form onSubmit={handleSubmit} className="cap-nhat-form">
          <div className="form-columns">
            {/* Cột 1 */}
            <div className="column-1">
              <div className="form-group">
                <label htmlFor="ho">Họ *</label>
                <input
                  type="text"
                  id="ho"
                  name="ho"
                  placeholder="Nhập họ"
                  value={formData.ho}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ten">Tên *</label>
                <input
                  type="text"
                  id="ten"
                  name="ten"
                  placeholder="Nhập tên"
                  value={formData.ten}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngaySinh">Ngày sinh *</label>
                <input
                  type="date"
                  id="ngaySinh"
                  name="ngaySinh"
                  value={formData.ngaySinh}
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
                <label htmlFor="cccd">CCCD *</label>
                <input
                  type="text"
                  id="cccd"
                  name="cccd"
                  placeholder="Nhập số CCCD"
                  value={formData.cccd}
                  onChange={handleChange}
                  required
                />
              </div>

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
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="diaChiCuThe">Địa chỉ cụ thể *</label>
                <textarea
                  id="diaChiCuThe"
                  name="diaChiCuThe"
                  placeholder="Nhập địa chỉ cụ thể (số nhà, đường...)"
                  value={formData.diaChiCuThe}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Cột 2 */}
            <div className="column-2">
              <div className="form-group">
                <label htmlFor="xa">Xã/Phường *</label>
                <input
                  type="text"
                  id="xa"
                  name="xa"
                  placeholder="Nhập xã/phường"
                  value={formData.xa}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tinh">Tỉnh/Thành phố *</label>
                <select
                  id="tinh"
                  name="tinh"
                  value={formData.tinh}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  <option value="ha-noi">Hà Nội</option>
                  <option value="ho-chi-minh">TP. Hồ Chí Minh</option>
                  <option value="da-nang">Đà Nẵng</option>
                  <option value="hai-phong">Hải Phòng</option>
                  <option value="can-tho">Cần Thơ</option>
                  <option value="an-giang">An Giang</option>
                  <option value="ba-ria-vung-tau">Bà Rịa - Vũng Tàu</option>
                  <option value="bac-giang">Bắc Giang</option>
                  <option value="bac-kan">Bắc Kạn</option>
                  <option value="bac-lieu">Bạc Liêu</option>
                  <option value="bac-ninh">Bắc Ninh</option>
                  <option value="ben-tre">Bến Tre</option>
                  <option value="binh-dinh">Bình Định</option>
                  <option value="binh-duong">Bình Dương</option>
                  <option value="binh-phuoc">Bình Phước</option>
                  <option value="binh-thuan">Bình Thuận</option>
                  <option value="ca-mau">Cà Mau</option>
                  <option value="cao-bang">Cao Bằng</option>
                  <option value="dak-lak">Đắk Lắk</option>
                  <option value="dak-nong">Đắk Nông</option>
                  <option value="dien-bien">Điện Biên</option>
                  <option value="dong-nai">Đồng Nai</option>
                  <option value="dong-thap">Đồng Tháp</option>
                  <option value="gia-lai">Gia Lai</option>
                  <option value="ha-giang">Hà Giang</option>
                  <option value="ha-nam">Hà Nam</option>
                  <option value="ha-tinh">Hà Tĩnh</option>
                  <option value="hai-duong">Hải Dương</option>
                  <option value="hau-giang">Hậu Giang</option>
                  <option value="hoa-binh">Hòa Bình</option>
                  <option value="hung-yen">Hưng Yên</option>
                  <option value="khanh-hoa">Khánh Hòa</option>
                  <option value="kien-giang">Kiên Giang</option>
                  <option value="kon-tum">Kon Tum</option>
                  <option value="lai-chau">Lai Châu</option>
                  <option value="lam-dong">Lâm Đồng</option>
                  <option value="lang-son">Lạng Sơn</option>
                  <option value="lao-cai">Lào Cai</option>
                  <option value="long-an">Long An</option>
                  <option value="nam-dinh">Nam Định</option>
                  <option value="nghe-an">Nghệ An</option>
                  <option value="ninh-binh">Ninh Bình</option>
                  <option value="ninh-thuan">Ninh Thuận</option>
                  <option value="phu-tho">Phú Thọ</option>
                  <option value="phu-yen">Phú Yên</option>
                  <option value="quang-binh">Quảng Bình</option>
                  <option value="quang-nam">Quảng Nam</option>
                  <option value="quang-ngai">Quảng Ngãi</option>
                  <option value="quang-ninh">Quảng Ninh</option>
                  <option value="quang-tri">Quảng Trị</option>
                  <option value="soc-trang">Sóc Trăng</option>
                  <option value="son-la">Sơn La</option>
                  <option value="tay-ninh">Tây Ninh</option>
                  <option value="thai-binh">Thái Bình</option>
                  <option value="thai-nguyen">Thái Nguyên</option>
                  <option value="thanh-hoa">Thanh Hóa</option>
                  <option value="thua-thien-hue">Thừa Thiên Huế</option>
                  <option value="tien-giang">Tiền Giang</option>
                  <option value="tra-vinh">Trà Vinh</option>
                  <option value="tuyen-quang">Tuyên Quang</option>
                  <option value="vinh-long">Vĩnh Long</option>
                  <option value="vinh-phuc">Vĩnh Phúc</option>
                  <option value="yen-bai">Yên Bái</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="anhDaiDien">Ảnh đại diện</label>
                <input
                  type="file"
                  id="anhDaiDien"
                  name="anhDaiDien"
                  accept="image/*"
                  onChange={handleChange}
                  className="file-input"
                />
                <div className="file-input-label">
                  {formData.anhDaiDien ? formData.anhDaiDien.name : 'Chọn ảnh đại diện'}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tenNguoiLienHe">Tên người liên hệ</label>
                <input
                  type="text"
                  id="tenNguoiLienHe"
                  name="tenNguoiLienHe"
                  placeholder="Nhập tên người liên hệ"
                  value={formData.tenNguoiLienHe}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="soDienThoaiLienHe">Số điện thoại người liên hệ</label>
                <input
                  type="tel"
                  id="soDienThoaiLienHe"
                  name="soDienThoaiLienHe"
                  placeholder="Nhập số điện thoại người liên hệ"
                  value={formData.soDienThoaiLienHe}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nhomMau">Nhóm máu</label>
                <select
                  id="nhomMau"
                  name="nhomMau"
                  value={formData.nhomMau}
                  onChange={handleChange}
                >
                  <option value="">Chọn nhóm máu</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="diUng">Dị ứng</label>
                <textarea
                  id="diUng"
                  name="diUng"
                  placeholder="Mô tả các loại dị ứng (nếu có)"
                  value={formData.diUng}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngheNghiep">Nghề nghiệp</label>
                <input
                  type="text"
                  id="ngheNghiep"
                  name="ngheNghiep"
                  placeholder="Nhập nghề nghiệp"
                  value={formData.ngheNghiep}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tinhTrangHonNhan">Tình trạng hôn nhân</label>
                <select
                  id="tinhTrangHonNhan"
                  name="tinhTrangHonNhan"
                  value={formData.tinhTrangHonNhan}
                  onChange={handleChange}
                >
                  <option value="">Chọn tình trạng hôn nhân</option>
                  <option value="doc-than">Độc thân</option>
                  <option value="da-ket-hon">Đã kết hôn</option>
                  <option value="ly-hon">Ly hôn</option>
                  <option value="goa">Góa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nút cập nhật */}
          <div className="submit-section">
            <button type="submit" className="cap-nhat-btn">
              Cập nhật thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapNhatThongTin;
