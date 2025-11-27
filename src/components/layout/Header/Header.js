import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import UserInfo from '../../UserInfo/UserInfo';
import StaffLoginModal from '../../StaffLoginModal/StaffLoginModal';
import './Header.css';
import logo from '../../../assets/images/logo.png';
import phoneIcon from '../../../assets/icons/phone-icon.png';
import earthIcon from '../../../assets/icons/earth-icon.png';
import arrowDown from '../../../assets/icons/arrow-down.png';
import facebookIcon from '../../../assets/icons/facebook.png';
import youtubeIcon from '../../../assets/icons/youtube.png';
import zaloIcon from '../../../assets/icons/zalo.png';
import searchIcon from '../../../assets/icons/search.png';
import arrowDown2 from '../../../assets/icons/arrow-down-2.png';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const checkLoginStatus = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    // Lắng nghe sự thay đổi localStorage
    window.addEventListener('storage', checkLoginStatus);

    // Custom event để cập nhật khi đăng nhập/đăng xuất trong cùng tab
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-container">
          <Link to="/" className="logo">
            <img src={logo} alt="Bệnh viện TrinityCare logo" />
          </Link>
          <div className="header-contact-info">
            <div className="contact-item">
              {/* merged image */}
              <div className="icon-wrapper">
                <img src={phoneIcon} alt="Cấp cứu icon" className="icon-visible" />
                <img src={phoneIcon} alt="" className="icon-hidden" />
              </div>
              <div className="text-wrapper">
                <span>Cấp cứu</span>
                <strong>024 1138 884</strong>
              </div>
            </div>
            <div className="contact-item">
              {/* merged image */}
              <div className="icon-wrapper">
                <img src={phoneIcon} alt="Hotline icon" className="icon-visible" />
                <img src={phoneIcon} alt="" className="icon-hidden" />
              </div>
              <div className="text-wrapper">
                <span>Hotline</span>
                <strong>024 8345 555</strong>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <div className="language-switcher">
              <img src={earthIcon} alt="language icon" />
              <span>Vie</span>
              <img src={arrowDown} alt="arrow down" />
            </div>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <img src={youtubeIcon} alt="Youtube" />
              </a>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer">
                <img src={zaloIcon} alt="Zalo" />
              </a>
            </div>
            <button className="search-icon" type="button">
              <img src={searchIcon} alt="Search" />
            </button>
            <UserInfo />
          </div>
        </div>
        <div className="container header-quick-links">
          <Link to="/dat-lich-kham">Đặt lịch khám</Link>
          <Link to="/tim-bac-si">Tìm bác sĩ</Link>
          <Link to="/goi-kham">Gói khám</Link>
          <Link to="/tra-cuu-ket-qua">Tra cứu kết quả</Link>
          <Link to="/hoi-dap">Hỏi đáp</Link>
          <Link to="/tai-ung-dung">Tải ứng dụng</Link>
          <button
            className="staff-login-link"
            // onClick={() => setShowStaffLoginModal(true)}
            onClick={() => navigate('staff/login')}
          >
            Nhân viên
          </button>
          {!isLoggedIn && (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
      <nav className="main-nav">
        <div className="container">
          <ul>
            <li><Link to="/homepage">Trang chủ</Link></li>
            <li>
              <Link to="/gioi-thieu">
                Giới thiệu <img src={arrowDown2} alt="arrow down" />
              </Link>
            </li>
            <li>
              <Link to="/chuyen-khoa">
                Chuyên khoa <img src={arrowDown2} alt="arrow down" />
              </Link>
            </li>
            <li>
              <Link to="/chuyen-gia">
                Chuyên gia - bác sĩ <img src={arrowDown2} alt="arrow down" />
              </Link>
            </li>
            <li>
              <Link to="/dich-vu">
                Dịch vụ y khoa <img src={arrowDown2} alt="arrow down" />
              </Link>
            </li>
            <li>
              <Link to="/ho-tro">
                Hỗ trợ khách hàng <img src={arrowDown2} alt="arrow down" />
              </Link>
            </li>
            <li>
              <Link to="/tin-tuc">
                Tin tức và sự kiện <img src={arrowDown2} alt="arrow down" />
              </Link>
            </li>
            <li><Link to="/tuyen-dung">Tuyển dụng</Link></li>
            <li><Link to="/lien-he">Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={showStaffLoginModal}
        onClose={() => setShowStaffLoginModal(false)}
      />
    </header>
  );
};

export default Header;