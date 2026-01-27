// pages/AccountContracts.jsx
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
    Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AccountContracts() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/accounts`)
            .then(res => res.json())
            .then(data => {
                const found = data.find(a => a.account_id === id);
                setAccount(found);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <Typography>Loading contracts...</Typography>;
    }

    if (!account) {
        return <Typography>Account not found</Typography>;
    }

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{ mb: 3 }}
            >
                Back to Accounts
            </Button>

            <Typography variant="h4" gutterBottom>
                {account.name} – Contracts
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Contract ID</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Quoted Cost</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {account.contracts?.map((c) => (
                            <TableRow
                                key={c.contract_id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() =>
                                    navigate(`/accounts/${id}/contracts/${c.contract_id}`)
                                }
                            >
                                <TableCell>{c.contract_id}</TableCell>
                                <TableCell>{c.start_date}</TableCell>
                                <TableCell>${Number(c.quoted_cost).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/accounts/${id}/contracts/${c.contract_id}`);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) || (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No contracts found
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}