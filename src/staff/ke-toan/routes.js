import {Route, Routes} from "react-router-dom";
import React from "react";
import FinanceLayout from "./layout/FinanceLayout";
import FinanceDashboardPage from "./pages/dashboard/FinanceDashboardPage";
import UnpaidInvoicesPage from "./pages/ds-hoa-don-can-thanh-toan/UnpaidInvoicesPage";
import UnpaidInvoiceDetailPage from "./pages/ds-hoa-don-can-thanh-toan/UnpaidInvoiceDetailPage";
import UnbilledVisitsListPage from "./pages/tao-moi-hoa-don-cho-luot-kham/UnbilledVisitsListPage";
import VisitDetailPage from "./pages/tao-moi-hoa-don-cho-luot-kham/VisitDetailPage";
import CreateInvoicePage from "./pages/tao-moi-hoa-don-cho-luot-kham/CreateInvoicePage";
import InvoiceListPage from "./pages/danh-sach-hoa-don/InvoiceListPage";
import InvoiceDetailPage from "./pages/danh-sach-hoa-don/InvoiceDetailPage";
import PaymentReceiptPage from "./pages/danh-sach-hoa-don/PaymentReceiptPage";
import RefundPage from "./pages/tam-ung-hoan-vien-phi/RefundPage";
import FinancialReportPage from "./pages/bao-cao-tai-chinh/FinancialReportPage";
import RevenueExpensePage from "./pages/quan-ly-thu-chi/RevenueExpensePage";
import OutpatientPaymentListPage from "./pages/thanh-toan-ngoai-tru/OutpatientPaymentListPage";
import EncounterDetailPage from "./pages/thanh-toan-ngoai-tru/EncounterDetailPage";
import TransactionListPage from "./pages/thanh-toan-ngoai-tru/TransactionListPage";
import InpatientPaymentListPage from "./pages/thanh-toan-noi-tru/InpatientPaymentListPage";
import InpatientPaymentDetailPage from "./pages/thanh-toan-noi-tru/InpatientPaymentDetailPage";
import InvoiceManagementListPage from "./pages/quan-ly-hoa-don/InvoiceListPage";
import InvoiceManagementDetailPage from "./pages/quan-ly-hoa-don/InvoiceDetailPage";
import OutpatientRefundListPage from "./pages/thanh-toan-ngoai-tru/OutpatientRefundListPage";

const FinanceRoutes= () => {
    return (
        <Routes>
            <Route element={<FinanceLayout />}>
                {/* Default route for /staff/duoc-si */}
                <Route index element={<FinanceDashboardPage />} />
                <Route path="dashboard" element={<FinanceDashboardPage />} />
                <Route path="chua-tt" element={<UnpaidInvoicesPage/>} />
                <Route path="chitiet-tt" element={<UnpaidInvoiceDetailPage/>} />
                <Route path="ds-luot-kham" element={<UnbilledVisitsListPage/>} />
                <Route path="chi-tiet-luot-kham" element={<VisitDetailPage/>} />
                <Route path="tao-hoa-don" element={<CreateInvoicePage/>} />
                {/* New routes */}
                <Route path="ds-hoa-don" element={<InvoiceListPage/>} />
                <Route path="chi-tiet-hoa-don" element={<InvoiceDetailPage/>} />
                <Route path="phieu-thanh-toan" element={<PaymentReceiptPage/>} />
                <Route path="tam-ung-hoan-vien-phi" element={<RefundPage/>} />
                <Route path="bao-cao" element={<FinancialReportPage/>} />
                <Route path="thu-chi" element={<RevenueExpensePage/>} />
                {/* Outpatient Payment Routes */}
                <Route path="thanh-toan-ngoai-tru" element={<OutpatientPaymentListPage/>} />
                <Route path="thanh-toan-ngoai-tru/:encounterId" element={<EncounterDetailPage/>} />
                <Route path="thanh-toan-ngoai-tru/:encounterId/giao-dich" element={<TransactionListPage/>} />
                <Route path="thanh-toan-ngoai-tru/:encounterId/hoan-tien" element={<OutpatientRefundListPage/>} />
                {/* Inpatient Payment Routes */}
                <Route path="thanh-toan-noi-tru" element={<InpatientPaymentListPage/>} />
                <Route path="thanh-toan-noi-tru/:inpatientStayId" element={<InpatientPaymentDetailPage/>} />
                {/* Invoice Management Routes */}
                <Route path="quan-ly-hoa-don" element={<InvoiceManagementListPage/>} />
                <Route path="quan-ly-hoa-don/:invoiceId" element={<InvoiceManagementDetailPage/>} />
            </Route>
        </Routes>
    );
}
export default FinanceRoutes;
