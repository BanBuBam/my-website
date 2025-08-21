
import React, { useState } from 'react';
import './login/LoginPage.css'; 

const RegisterPage = () => {
  // Sử dụng một state object để quản lý tất cả các trường
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
  });

  // Một hàm xử lý thay đổi cho tất cả các input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Hàm xử lý khi submit form
  const handleSubmit = (event) => {
    event.preventDefault();

    // In dữ liệu đã thu thập ra console
    console.log('Registering with data:', formData);

    // Ở đây bạn có thể thêm logic để kiểm tra dữ liệu
    // và gọi API để tạo tài khoản mới
    alert(`Account created for ${formData.username}!`);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          {/* Mỗi input đều có thuộc tính `name` trùng với key trong state `formData` */}
          <div className="form-group">
            <label htmlFor="username">Enter your Username</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullname">Enter your fullname</label>
            <input 
              type="text" 
              id="fullname"
              name="fullname"
              placeholder="Fullname"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Enter your gender</label>
            <input 
              type="text" 
              id="gender"
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Enter your phone number</label>
            <input 
              type="tel" 
              id="phone"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Enter your email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Enter your address</label>
            <input 
              type="text" 
              id="address"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;