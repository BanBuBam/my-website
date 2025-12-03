import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financeInvoiceAPI, financeTransactionAPI } from '../../../../services/staff/financeAPI';
import { FiArrowLeft, FiRefreshCw, FiDollarSign, FiAlertCircle, FiFileText, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import './RefundListPage.css';

const RefundListPage = () => {
    const { encounterId } = useParams();
    const navigate = useNavigate();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceId, setInvoiceId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    
    