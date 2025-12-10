import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";

import Layout from "../components/Layout.jsx";

import {
  getAppointments,
  updateStatus,
  rescheduleAppointment,
} from "../api/appointments";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReschedule, setOpenReschedule] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newDate, setNewDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isDoctor = user.role === "DOCTOR";
  const isStaff = user.role === "STAFF";

  // Fetch appointments
  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // DOCTOR -> only see their own appointments
  // STAFF / others -> see all
  const visibleAppointments =
    isDoctor && user.doctor
      ? appointments.filter((a) => a.doctor?._id === user.doctor._id)
      : appointments;

  // Status color mapping
  const statusColors = {
    PENDING: "warning",
    CONFIRMED: "success",
    REJECTED: "error",
    CANCELLED: "error",
    RESCHEDULED: "info",
  };

  const handleStatusChange = async (id, status) => {
    // Extra safety: STAFF cannot cancel from UI
    if (!isDoctor && status === "CANCELLED") return;

    await updateStatus(id, status);
    loadAppointments();
  };

  const openRescheduleDialog = (id) => {
    setSelectedId(id);
    setOpenReschedule(true);
  };

  const handleRescheduleSubmit = async () => {
    await rescheduleAppointment(selectedId, newDate);
    setOpenReschedule(false);
    setNewDate("");
    loadAppointments();
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Layout>
      <Typography variant="h5" gutterBottom>
        Appointment List
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: "#f3f4f6" }}>
            <TableRow>
              <TableCell><b>Patient</b></TableCell>
              <TableCell><b>Doctor</b></TableCell>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleAppointments.map((a) => (
              <TableRow key={a._id}>
                <TableCell>{a.patient?.fullName}</TableCell>
                <TableCell>{a.doctor?.name}</TableCell>

                <TableCell>
                  {new Date(a.appointmentDate).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Chip
                    label={a.status}
                    color={statusColors[a.status]}
                    variant="filled"
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* Both DOCTOR and STAFF can Confirm/Reject when PENDING */}
                    {a.status === "PENDING" && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          onClick={() =>
                            handleStatusChange(a._id, "CONFIRMED")
                          }
                        >
                          Confirm
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() =>
                            handleStatusChange(a._id, "REJECTED")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Both can Reschedule */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openRescheduleDialog(a._id)}
                    >
                      Reschedule
                    </Button>

                    {/* Only DOCTOR sees Cancel button */}
                    {isDoctor && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleStatusChange(a._id, "CANCELLED")
                        }
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reschedule Dialog */}
      <Dialog open={openReschedule} onClose={() => setOpenReschedule(false)}>
        <DialogTitle>Reschedule Appointment</DialogTitle>

        <DialogContent>
          <TextField
            label="New Date & Time"
            type="datetime-local"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenReschedule(false)}>Close</Button>
          <Button onClick={handleRescheduleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
