import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chemo Appointments
          </Typography>
          {user?.role && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              Role: {user.role}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Appointment List (coming next...)
        </Typography>
        <Typography>
          If you can see this page after login, auth and routing are working ✅
        </Typography>
      </Box>
    </Box>
  );
}
