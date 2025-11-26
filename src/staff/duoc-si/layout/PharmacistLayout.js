import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './PharmacistLayout.css';
import {
    FiHome,
    FiPackage,
    FiFileText,
    FiBarChart2,
    FiShoppingCart,
    FiTruck,
    FiSearch,
    FiAlertCircle,
    FiDollarSign,
    FiUsers,
    FiCheckCircle,
    FiBriefcase,
    FiList,
    FiArchive,
    FiClipboard
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const PharmacistLayout = () => {
    return (
        <div className="pharmacist-layout">
            <aside className="pharmacist-sidebar">
                <div className="sidebar-header">
                    <h1>Dược sĩ</h1>
                </div>
                <nav className="sidebar-nav">
                    {/* Tổng quan */}
                    <div className="nav-category">
                        <div className="category-header">Tổng quan</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/dashboard">
                                    <FiHome />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/thuoc">
                                    <FiList />
                                    <span>Danh sách thuốc</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Cấp phát thuốc */}
                    <div className="nav-category">
                        <div className="category-header">Cấp phát thuốc</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/cap-phat">
                                    <FiList />
                                    <span>Đơn thuốc chờ cấp phát</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/prescriptions">
                                    <FiFileText />
                                    <span>Quản lý đơn thuốc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/lich-su-cap-phat">
                                    <FiCheckCircle />
                                    <span>Lịch sử cấp phát</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/danh-sach-y-lenh-theo-nhom">
                                    <FiClipboard />
                                    <span>Danh sách y lệnh theo nhóm</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Quản lý kho */}
                    <div className="nav-category">
                        <div className="category-header">Quản lý kho</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/ton-kho">
                                    <FiPackage />
                                    <span>Tồn kho</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/inventory">
                                    <FiArchive />
                                    <span>Danh mục thuốc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/tuong-tac-thuoc">
                                    <FiArchive />
                                    <span>Tương tác thuốc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/tu-thuoc">
                                    <FiArchive />
                                    <span>Quản lý Tủ thuốc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/vat-tu-y-te">
                                    <FiBriefcase />
                                    <span>Quản lý Vật tư & Tiện ích</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/ton-kho-tu-thuoc">
                                    <FiPackage />
                                    <span>Tồn kho Tủ thuốc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/tra-cuu-ton-kho">
                                    <FiSearch />
                                    <span>Tra cứu hàng tồn kho</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/bien-dong-kho">
                                    <FiBarChart2 />
                                    <span>Biến động kho</span>
                                </NavLink>
                            </li>
                            
                            <li>
                                <NavLink to="/staff/duoc-si/han-su-dung">
                                    <FiAlertCircle />
                                    <span>Hạn sử dụng</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/canh-bao-ton-kho">
                                    <FiAlertCircle />
                                    <span>Cảnh báo tồn kho</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Nhập xuất kho */}
                    <div className="nav-category">
                        <div className="category-header">Nhập xuất kho</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/nhap-kho">
                                    <FiTruck />
                                    <span>Nhập kho</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/phieu-nhap-kho">
                                    <FiFileText />
                                    <span>Phiếu nhập kho</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/xuat-kho">
                                    <FiShoppingCart />
                                    <span>Xuất kho</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/phieu-xuat-kho">
                                    <FiFileText />
                                    <span>Phiếu xuất kho</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Nhà cung cấp */}
                    <div className="nav-category">
                        <div className="category-header">Nhà cung cấp</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/ncc">
                                    <FiUsers />
                                    <span>Danh sách nhà cung cấp</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/tao-ncc">
                                    <FiUsers />
                                    <span>Thêm nhà cung cấp</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/phieu-thanh-toan">
                                    <FiDollarSign />
                                    <span>Thanh toán nhập kho</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Báo cáo */}
                    <div className="nav-category">
                        <div className="category-header">Báo cáo</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/duoc-si/reports">
                                    <FiBarChart2 />
                                    <span>Báo cáo tổng hợp</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/bao-cao-ton-kho">
                                    <FiBarChart2 />
                                    <span>Báo cáo tồn kho</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/duoc-si/bao-cao-nhap-xuat">
                                    <FiBarChart2 />
                                    <span>Báo cáo nhập xuất</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>
            <main className="pharmacist-content">
                <div className="content-header">
                    <StaffAvatarDropdown />
                </div>
                <div className="content-body">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default PharmacistLayout;
