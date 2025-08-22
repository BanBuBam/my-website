import React from 'react';

const StaffLoginPage = () => {
  return (
    <div>
      <h1>Đăng nhập cho Nhân viên Bệnh viện</h1>
      {/* Form đăng nhập cho nhân viên */}
      <form>
        <div>
          <label>Mã nhân viên:</label>
          <input type="text" />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input type="password" />
        </div>
        <button type="submit">Đăng Nhập</button>
      </form>
    </div>
  );
};

export default StaffLoginPage;