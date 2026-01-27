import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FormControl, InputLabel, Select, MenuItem, Card, CardContent, Typography, Button, TextField } from "@mui/material";

export default function AccountDetails() {
  const { id } = useParams();
  const [monthly, setMonthly] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
  const [accountDetail, setAccountDetail] = useState({});
  const [quoteInput, setQuoteInput] = useState("");

  // Fetch account detail
  const fetchAccount = () => {
    fetch(`http://localhost:8000/accounts/${id}`)
      .then(res => res.json())
      .then(data => {
        setAccountDetail(data);
        setQuoteInput(data.quoted_cost);
      });
  };

  useEffect(() => {
    fetchAccount();
    fetch(`http://localhost:8000/accounts/${id}/monthly`)
      .then(res => res.json())
      .then(data => {
        setMonthly(data);
        if (data.length > 0) setSelectedMonth(data[data.length - 1].month);
      });
  }, [id]);

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  const filteredMonthly = selectedMonth
    ? monthly.filter(m => m.month === selectedMonth)
    : monthly;

  const handleQuoteUpdate = () => {
    fetch(`http://localhost:8000/accounts/${id}/quote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoted_cost: parseFloat(quoteInput) })
    }).then(() => fetchAccount());
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Account: {accountDetail.name}
      </Typography>

      {/* Dashboard Cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Card sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="textSecondary">Actual Cost</Typography>
            <Typography variant="h6">${accountDetail.actual_cost?.toFixed(2)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="textSecondary">Quoted Cost</Typography>
            <TextField
              size="small"
              value={quoteInput}
              onChange={e => setQuoteInput(e.target.value)}
              type="number"
            />
            <Button variant="contained" sx={{ marginTop: 1 }} onClick={handleQuoteUpdate}>
              Save
            </Button>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="textSecondary">Variance</Typography>
            <Typography variant="h6" color={accountDetail.variance > 0 ? "red" : "green"}>
              ${accountDetail.variance?.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Month Selector */}
      <FormControl sx={{ minWidth: 120, marginBottom: 20 }}>
        <InputLabel>Month</InputLabel>
        <Select value={selectedMonth} onChange={handleMonthChange}>
          {monthly.map(m => (
            <MenuItem key={m.month} value={m.month}>{m.month}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Chart */}
      <LineChart
        width={800}
        height={350}
        data={filteredMonthly}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="cost" stroke="#1976d2" />
      </LineChart>
    </div>
  );
}
