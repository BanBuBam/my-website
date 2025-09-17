import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideBar.css';

import logo from '../../../assets/images/logo.png';
import phoneIcon from '../../../assets/icons/phone-icon.png';
import earthIcon from '../../../assets/icons/earth-icon.png';
import facebookIcon from '../../../assets/icons/facebook.png';
import youtubeIcon from '../../../assets/icons/youtube.png';
import zaloIcon from '../../../assets/icons/zalo.png';
import searchIcon from '../../../assets/icons/search.png';
import arrowDown from '../../../assets/icons/arrow-down.png';

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <div className="sidebar-search">
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input type="text" placeholder="Tìm kiếm" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section quick-actions">
          <ul>
            <li><Link to="/dat-lich-kham">Đặt lịch khám</Link></li>
            <li><Link to="/cap-nhat-thong-tin">Cập nhật thông tin người dùng</Link></li>
            <li><Link to="/hoa-don-benh-nhan">Hóa đơn bệnh nhân</Link></li>
            <li><Link to="/trang-thai-dat-lich">Trạng thái đặt lịch</Link></li>
            <li><Link to="/goi-kham">Gói khám</Link></li>
            <li><Link to="/tra-cuu-ket-qua">Tra cứu kết quả</Link></li>
            <li><Link to="/lich-su-kham">Lịch sử khám chữa bệnh</Link></li>
            <li><Link to="/thanh-toan">Thanh toán</Link></li>
          </ul>
        </div>

        <div className="nav-section main-navigation">
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li className={openMenu === 'gioi-thieu' ? 'open' : ''}>
              <div className="menu-item" onClick={() => toggleMenu('gioi-thieu')}>
                <span>Giới thiệu</span>
                <img src={arrowDown} alt="Expand" className="chevron-icon" />
              </div>
              <ul className="submenu">
                <li><Link to="/gioi-thieu/ve-chung-toi">Về chúng tôi</Link></li>
                <li><Link to="/gioi-thieu/tam-nhin">Tầm nhìn</Link></li>
              </ul>
            </li>
            <li><Link to="/chuyen-khoa">Chuyên khoa</Link></li>
            <li><Link to="/chuyen-gia">Chuyên gia - bác sĩ</Link></li>
            <li><Link to="/dich-vu">Dịch vụ y khoa</Link></li>
            <li><Link to="/ho-tro">Hỗ trợ khách hàng</Link></li>
            <li><Link to="/tin-tuc">Tin tức sự kiện</Link></li>
            <li><Link to="/tuyen-dung">Tuyển dụng</Link></li>
            <li><Link to="/lien-he">Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="contact-info">
          <div className="contact-item">
            <img src={phoneIcon} alt="Phone" />
            <div>
              <span>Cấp cứu</span>
              <strong>84 04 372 766</strong>
            </div>
          </div>
          <div className="contact-item">
            <img src={phoneIcon} alt="Phone" />
            <div>
              <span>Hotline</span>
              <strong>84 04 372 766</strong>
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <div className="social-icons">
            <Link to="#"><img src={facebookIcon} alt="Facebook" /></Link>
            <Link to="#"><img src={youtubeIcon} alt="Youtube" /></Link>
            <Link to="#"><img src={zaloIcon} alt="Zalo" /></Link>
          </div>
          <div className="language-switcher">
            <img src={earthIcon} alt="Language" />
            <span>Vie</span>
            <img src={arrowDown} alt="Select language" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;