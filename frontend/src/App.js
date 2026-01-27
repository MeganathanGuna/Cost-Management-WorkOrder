// App.jsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import AccountsList from "./pages/AccountsList";
import AccountContracts from "./pages/AccountContract";
import AccountDashboard from "./pages/AccountDashboard";
import TopBar from "./pages/TopBar";
import { Box } from "@mui/material";

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <>
      <TopBar
        showSearch={isHome}
        searchValue={searchValue}
        onSearch={handleSearch}
      />

      <Box sx={{ p: 3 }}>
        <Routes>
          <Route
            path="/"
            element={<AccountsList searchValue={searchValue} />}
          />
          <Route path="/accounts/:id" element={<AccountContracts />} />
          <Route
            path="/accounts/:id/contracts/:contractId"
            element={<AccountDashboard />}
          />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}