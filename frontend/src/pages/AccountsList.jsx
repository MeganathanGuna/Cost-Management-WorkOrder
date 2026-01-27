import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

export default function AccountsList({ searchValue = "" }) {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/accounts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setAccounts(data || []);
        setFilteredAccounts(data || []);
      })
      .catch((err) => {
        console.error("Accounts fetch error:", err);
        setAccounts([]);
        setFilteredAccounts([]);
      });
  }, []);

  useEffect(() => {
    const term = (searchValue || "").trim().toLowerCase();
    if (!term) {
      setFilteredAccounts([...accounts]);
      return;
    }

    const filtered = accounts.filter((acc) =>
      String(acc.name || "").toLowerCase().includes(term)
    );
    setFilteredAccounts(filtered);
  }, [searchValue, accounts]);

  // Sum quoted costs from all contracts
  const totalQuoted = accounts.reduce((sum, acc) => {
    return sum + (acc.contracts || []).reduce(
      (subSum, c) => subSum + Number(c.quoted_cost || 0),
      0
    );
  }, 0);

  const totalAccounts = accounts.length;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        AWS Cost Dashboard - Accounts Overview
      </Typography>

      {/* Two cards with professional hover effects */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Total Accounts Card */}
        <Grid item xs={12} sm={6}>
          <Card
            elevation={4}
            sx={{
              height: "100%",
              bgcolor: "#e3f2fd",
              transition: "all 0.25s ease-in-out",
              "&:hover": {
                transform: "translateY(-6px) scale(1.025)",
                boxShadow: "0 16px 40px rgba(25, 118, 210, 0.20)",
                border: "1px solid #64b5f6",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 3, px: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Accounts
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.dark"
                sx={{ mt: 1 }}
              >
                {totalAccounts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Quoted Cost Card */}
        <Grid item xs={12} sm={6}>
          <Card
            elevation={4}
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
            <CardContent sx={{ textAlign: "center", py: 3, px: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Quoted Cost
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="success.dark"
                sx={{ mt: 1 }}
              >
                ${totalQuoted.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        All Accounts
        {searchValue.trim() && (
          <Typography component="span" color="text.secondary" sx={{ ml: 2 }}>
            (showing {filteredAccounts.length} matches)
          </Typography>
        )}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell><strong>Account Name</strong></TableCell>
              <TableCell><strong>Quoted Cost</strong></TableCell>
              <TableCell><strong>Contracts</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchValue.trim()
                      ? `No accounts found matching "${searchValue.trim()}"`
                      : "No accounts available"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((acc) => (
                <TableRow
                  key={acc.account_id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/accounts/${acc.account_id}`)}
                >
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>
                    ${(acc.contracts || []).reduce(
                      (sum, c) => sum + Number(c.quoted_cost || 0),
                      0
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell>{acc.contracts?.length || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}