// pages/AccountDashboard.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AccountDashboard() {
    const { id, contractId } = useParams();
    const navigate = useNavigate();
    const [contractData, setContractData] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [quoteInput, setQuoteInput] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Contract summary
            const contractRes = await fetch(
                `http://localhost:8000/accounts/${id}/contracts/${contractId}`
            );
            if (!contractRes.ok) throw new Error("Contract fetch failed");
            const contractJson = await contractRes.json();
            setContractData(contractJson);
            setQuoteInput(contractJson.monthly?.[0]?.quoted || 0);

            // 2. Account basic info (now includes onboard_date after backend fix)
            const accountsRes = await fetch(`http://localhost:8000/accounts`);
            const accounts = await accountsRes.json();
            const account = accounts.find(a => a.account_id === id);
            if (account) setAccountInfo(account);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuoteUpdate = async () => {
        const quotedValue = parseFloat(quoteInput);
        if (isNaN(quotedValue)) return;

        try {
            await fetch(`http://localhost:8000/accounts/${id}/quote`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quoted_cost: quotedValue }),
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, contractId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!contractData || !accountInfo) {
        return (
            <Typography color="error" align="center">
                Failed to load data
            </Typography>
        );
    }

    const totalVariance = Math.abs(contractData.total_variance || 0);
    const isOverBudget = (contractData.total_variance || 0) > 0;

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Sticky header */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    bgcolor: "background.default",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pt: 0.5,
                    pb: 1.5,
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/accounts/${id}`)}
                    sx={{ mb: 1, ml: 1.5, minHeight: 36, fontSize: "0.95rem" }}
                    size="small"
                >
                    Back to Contracts
                </Button>

                {/* Account name + onboard date */}
                <Box sx={{ textAlign: "center", mb: 1.5 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={700}
                        color="text.primary"
                        sx={{ mb: 0.25, lineHeight: 1.1 }}
                    >
                        {accountInfo.name || "Unknown Account"}
                    </Typography>

                    <Typography
                        variant="subtitle2"
                        color="text.primary"
                        sx={{ fontWeight: 500, fontSize: "1.05rem" }}
                    >
                        Onboard Date: {accountInfo.onboard_date || "Not available"}
                    </Typography>
                </Box>

                {/* Cards */}
                <Grid container spacing={1.5} sx={{ px: 2 }}>
                    {/* Update Quoted Cost */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ height: "100%" }}>
                            <CardContent sx={{ py: 1.5, px: 2 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Update Monthly Quoted Cost
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={quoteInput}
                                        onChange={(e) => setQuoteInput(e.target.value)}
                                        sx={{ flex: 1 }}
                                        InputProps={{
                                            startAdornment: <Box sx={{ color: "text.secondary", mr: 0.5 }}>$</Box>,
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleQuoteUpdate}
                                        disabled={isNaN(parseFloat(quoteInput))}
                                    >
                                        SAVE
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Actual Cost */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                height: "100%",
                                bgcolor: "#f0f7fa",
                                transition: "all 0.25s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-6px) scale(1.025)",
                                    boxShadow: "0 16px 40px rgba(25, 118, 210, 0.20)",
                                    border: "1px solid #64b5f6",
                                },
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", py: 2, px: 2 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Total Actual Cost
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.dark">
                                    ${contractData.total_actual.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Quoted Cost */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                height: "100%",
                                bgcolor: "#e8f5e9",
                                transition: "all 0.25s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-6px) scale(1.025)",
                                    boxShadow: "0 16px 40px rgba(76, 175, 80, 0.20)",
                                    border: "1px solid #81c784",
                                },
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", py: 2, px: 2 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Total Quoted Cost
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.dark">
                                    ${contractData.total_quoted.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Variance */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                height: "100%",
                                bgcolor: isOverBudget ? "#ffebee" : "#e8f5e9",
                                border: isOverBudget ? "1px solid #ef5350" : "1px solid #66bb6a",
                                transition: "all 0.25s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-6px) scale(1.025)",
                                    boxShadow: isOverBudget
                                        ? "0 16px 40px rgba(244, 67, 54, 0.24)"
                                        : "0 16px 40px rgba(76, 175, 80, 0.24)",
                                    borderColor: isOverBudget ? "#e53935" : "#43a047",
                                },
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", py: 2, px: 2 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Total Variance
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={isOverBudget ? "error.main" : "success.main"}
                                >
                                    ${totalVariance.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Table */}
            <Box sx={{ flex: 1, overflow: "hidden", px: 2, pb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 1.5, mb: 1 }}>
                    Monthly Cost Breakdown – {contractData.contract_id}
                </Typography>

                <TableContainer
                    component={Paper}
                    elevation={2}
                    sx={{
                        height: "calc(100% - 40px)",
                        overflow: "auto",
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell width={70}><strong>S.No</strong></TableCell>
                                <TableCell><strong>Month</strong></TableCell>
                                <TableCell><strong>Actual Cost</strong></TableCell>
                                <TableCell><strong>Quoted Cost</strong></TableCell>
                                <TableCell><strong>Variance</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {contractData.monthly.map((row, index) => {
                                const variance = Math.abs(row.actual - row.quoted);
                                const isLoss = row.actual > row.quoted;

                                return (
                                    <TableRow key={row.month} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.month}</TableCell>
                                        <TableCell>${row.actual.toFixed(2)}</TableCell>
                                        <TableCell>${row.quoted.toFixed(2)}</TableCell>
                                        <TableCell
                                            sx={{
                                                color: isLoss ? "error.main" : "success.main",
                                                fontWeight: 600,
                                            }}
                                        >
                                            ${variance.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}