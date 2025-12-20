import React, { useState } from 'react';
import './ContactPage.css';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to send contact form
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: <FiPhone />,
      title: 'Hotline',
      content: '024 8345 555',
      description: 'Hỗ trợ 24/7',
      color: '#3b82f6'
    },
    {
      icon: <FiPhone />,
      title: 'Cấp cứu',
      content: '024 1138 884',
      description: 'Luôn sẵn sàng',
      color: '#ef4444'
    },
    {
      icon: <FiMail />,
      title: 'Email',
      content: 'contact@trinitycare.vn',
      description: 'Phản hồi trong 24h',
      color: '#22c55e'
    },
    {
      icon: <FiMapPin />,
      title: 'Địa chỉ',
      content: 'Số 12, Xuân Thủy, Cầu Giấy, Hà Nội',
      description: 'Đến thăm chúng tôi',
      color: '#a855f7'
    }
  ];

  const workingHours = [
    { day: 'Thứ 2 - Thứ 6', time: '07:00 - 20:00' },
    { day: 'Thứ 7', time: '07:00 - 17:00' },
    { day: 'Chủ nhật', time: '08:00 - 16:00' },
    { day: 'Cấp cứu', time: '24/7' }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Liên hệ với chúng tôi</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className="info-icon" style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                {info.icon}
              </div>
              <h3>{info.title}</h3>
              <p className="info-content">{info.content}</p>
              <p className="info-description">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-main-section">
        <div className="contact-container">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <h2>Gửi tin nhắn cho chúng tôi</h2>
            <p className="form-subtitle">Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất</p>

            {submitted ? (
              <div className="success-message">
                <FiCheckCircle />
                <h3>Gửi thành công!</h3>
                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Họ và tên <span className="required">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại <span className="required">*</span></label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Chủ đề <span className="required">*</span></label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập chủ đề"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Nội dung <span className="required">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Nhập nội dung tin nhắn"
                  />
                </div>

                <button type="submit" className="btn-submit">
                  <FiSend />
                  Gửi tin nhắn
                </button>
              </form>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="contact-sidebar">
            {/* Working Hours */}
            <div className="sidebar-card">
              <div className="card-header">
                <FiClock />
                <h3>Giờ làm việc</h3>
              </div>
              <div className="working-hours">
                {workingHours.map((schedule, index) => (
                  <div key={index} className="hour-item">
                    <span className="day">{schedule.day}</span>
                    <span className="time">{schedule.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="sidebar-card">
              <div className="card-header">
                <FiPhone />
                <h3>Liên hệ nhanh</h3>
              </div>
              <div className="quick-contact">
                <a href="tel:0248345555" className="contact-btn hotline">
                  <FiPhone />
                  <div>
                    <span>Hotline</span>
                    <strong>024 8345 555</strong>
                  </div>
                </a>
                <a href="tel:0241138884" className="contact-btn emergency">
                  <FiPhone />
                  <div>
                    <span>Cấp cứu</span>
                    <strong>024 1138 884</strong>
                  </div>
                </a>
                <a href="mailto:contact@trinitycare.vn" className="contact-btn email">
                  <FiMail />
                  <div>
                    <span>Email</span>
                    <strong>contact@trinitycare.vn</strong>
                  </div>
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="sidebar-card">
              <div className="card-header">
                <FiMapPin />
                <h3>Vị trí</h3>
              </div>
              <div className="location-info">
                <p><strong>Bệnh viện TrinityCare</strong></p>
                <p>Số 12, Xuân Thủy, Cầu Giấy, Hà Nội</p>
                <a 
                  href="https://maps.app.goo.gl/z2z6JehvZz5AMSVX6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-map"
                >
                  <FiMapPin />
                  Xem bản đồ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <iframe
            title="Hospital Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.2922776572923!2d105.78255094238109!3d20.98091793971979!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1ad71%3A0xa2f9b16036648187!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IGNow61uaCB2aeG7hW4gdGjDtG5n!5e0!3m2!1svi!2s!4v1765473328155!5m2!1svi!2s"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

