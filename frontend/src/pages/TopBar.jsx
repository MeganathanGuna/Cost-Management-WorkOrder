import { AppBar, Toolbar, Typography, TextField, Box } from "@mui/material";

export default function TopBar({ showSearch, searchValue, onSearch }) {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    AWS Cost Dashboard
                </Typography>

                {showSearch && (
                    <TextField
                        size="small"
                        placeholder="Search account..."
                        value={searchValue}
                        onChange={onSearch}
                        sx={{
                            backgroundColor: "white",
                            borderRadius: 1,
                            minWidth: 280
                        }}
                    />
                )}
            </Toolbar>
        </AppBar>
    );
}
