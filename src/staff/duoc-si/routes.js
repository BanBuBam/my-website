import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PharmacistLayout from './layout/PharmacistLayout';
import PharmacistDashboardPage from './pages/dashboard/PharmacistDashboardPage';
import PrescriptionListPage from "./pages/cap-phat/PrescriptionListPage";
import InventoryManagementPage from "./pages/ton-kho/InventoryManagementPage";
import ImportStockPage from "./pages/nhap-kho/ImportStockPage";
import StockReceiptPage from "./pages/nhap-kho/StockReceiptPage";
import PaymentReceiptPage from "./pages/nhap-kho/PaymentReceiptPage";
import SupplierPage from "./pages/nha-cung-cap/SupplierPage";
import CreateSupplierPage from "./pages/nha-cung-cap/CreateSupplierPage";

const PharmacistRoutes = () => {
    return (
        <Routes>
            <Route element={<PharmacistLayout />}>
                {/* Default route for /staff/duoc-si */}
                <Route index element={<PharmacistDashboardPage />} />
                <Route path="dashboard" element={<PharmacistDashboardPage />} />
                <Route path="cap-phat" element={<PrescriptionListPage />} />
                <Route path="ton-kho" element={<InventoryManagementPage />} />
                <Route path="nhap-kho" element={<ImportStockPage />} />
                <Route path="phieu-nhap-kho" element={<StockReceiptPage />} />
                <Route path="phieu-thanh-toan" element={<PaymentReceiptPage />} />
                <Route path="ncc" element={<SupplierPage />} />
                <Route path="tao-ncc" element={<CreateSupplierPage />} />
                <Route path="inventory" element={<div>Trang Quản lý Kho thuốc</div>} />
                <Route path="prescriptions" element={<div>Trang Quản lý Đơn thuốc</div>} />
                <Route path="reports" element={<div>Trang Báo cáo</div>} />
            </Route>
        </Routes>
    );
};

export default PharmacistRoutes;