import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Edit, Plus, Key, Trash, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getManagementTable,
  StudentEmployerSupervisor,
} from "@/api/getManagement";
import { useStudentService } from "@/api/crudEmployee";
import { useSupervisorEmployerService } from "@/api/getSupervisorEmployerId";
import { getOTP } from "@/api/getOTP";

const genders = ["Male", "Female", "Other"];

const StudentManagement = () => {
  // const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states (updated)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactNumberGuardian, setContactNumberGuardian] = useState("");
  const [supervisorId, setSupervisorId] = useState<string | undefined>(
    undefined
  );
  const [remarks, setRemarks] = useState("");
  const [employerId, setEmployerId] = useState<string | undefined>(undefined);
  const [checkInTime, setCheckInTime] = useState(""); // HH:MM
  const [checkOutTime, setCheckOutTime] = useState(""); // HH:MM

  // State for API data
  const [managementData, setManagementData] = useState<
    StudentEmployerSupervisor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { createStudent, updateStudent, deleteStudent, getStudentById } =
    useStudentService();

  // Add state for dropdown data
  const [employerOptions, setEmployerOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [supervisorOptions, setSupervisorOptions] = useState<
    { supervisor_id: number; first_name: string; last_name: string }[]
  >([]);
  const { getAllEmployerIDsAndNames, getAllSupervisorIDsAndNames } =
    useSupervisorEmployerService();

  // OTP Dialog state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpResult, setOtpResult] = useState<null | {
    otp?: string;
    otp_code?: string;
    student_id?: string | number;
    expires_at?: string;
    [key: string]: any;
  }>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Edit dialog state
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);

  // Form validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // NEW: Loading states for async actions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [otpLoadingId, setOtpLoadingId] = useState<number | null>(null);

  // Create a ref for the form element
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLoading(true);
    getManagementTable()
      .then((data) => setManagementData(Array.isArray(data) ? data : []))
      .catch(() => setManagementData([]))
      .finally(() => setLoading(false));

    // Fetch employer and supervisor options for dropdowns
    getAllEmployerIDsAndNames()
      .then((opts) => setEmployerOptions(Array.isArray(opts) ? opts : []))
      .catch(() => setEmployerOptions([]));
    getAllSupervisorIDsAndNames()
      .then((opts) => setSupervisorOptions(Array.isArray(opts) ? opts : []))
      .catch(() => setSupervisorOptions([]));
  }, []);

  // const handleViewStudent = (id: number) => {
  //   navigate(`/student/${id}`);
  // };

  const handleAddStudent = () => {
    setIsEditMode(false);
    setEditStudentId(null);
    resetForm();
    setFormErrors({}); // clear errors
    setIsAddDialogOpen(true);
  };

  // UPDATED: Added loading state management
  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true); // mark form as submitted
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setIsSubmitting(true);
    const formatTime = (time: string) => (time ? `${time}:00` : null);
    const payload = {
      first_name: firstName,
      last_name: lastName || null,
      dob: dob ? new Date(dob).toISOString() : null, // keep as string (YYYY-MM-DD)
      gender: gender || null,
      contact_number: contactNumber || null,
      contact_number_guardian: contactNumberGuardian || null,
      supervisor_id: supervisorId ? Number(supervisorId) : null,
      remarks: remarks || null,
      employer_id: employerId ? Number(employerId) : null,
      check_in_time: formatTime(checkInTime), // append :00 if present
      check_out_time: formatTime(checkOutTime), // append :00 if present
      address_line1: "",
      address_line2: "",
      city: "",
      home_long: 0,
      home_lat: 0,
    };
    try {
      if (isEditMode && editStudentId) {
        // Update existing student
        await updateStudent(editStudentId, payload);
      } else {
        // Create new student
        await createStudent(payload);
      }

      // Refresh management table after adding/updating a student
      const data = await getManagementTable();
      setManagementData(Array.isArray(data) ? data : []);
      setIsAddDialogOpen(false);
      setIsEditMode(false);
      setEditStudentId(null);
      resetForm();
    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} student`,
        err
      );
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } student. See console for details.`
      );
    } finally {
      setIsSubmitting(false);
      setIsFormSubmitted(false); // reset after successful submit
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDob("");
    setGender("");
    setContactNumber("");
    setContactNumberGuardian("");
    setSupervisorId(undefined);
    setRemarks("");
    setEmployerId(undefined);
    setCheckInTime("");
    setCheckOutTime("");
    setIsFormSubmitted(false);
  };

  // Filter and sort managementData by search query and student_id
  const filteredSortedManagementData = [...managementData]
    .filter((item) => {
      const fullName =
        `${item.student_first_name} ${item.student_last_name}`.toLowerCase();
      const idStr = String(item.student_id);
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        idStr.includes(searchQuery.trim())
      );
    })
    .sort((a, b) => a.student_id - b.student_id);

  // UPDATED: Added loading state management
  const handleOtpClick = async (studentId: number) => {
    setOtpDialogOpen(true);
    setOtpResult(null);
    setOtpError(null);
    setOtpLoadingId(studentId);
    try {
      const result = await getOTP(studentId);
      setOtpResult(result);
    } catch (err: any) {
      setOtpError(
        err?.response?.data?.message || err?.message || "Failed to generate OTP"
      );
    } finally {
      setOtpLoadingId(null);
    }
  };

  // Open edit dialog and populate form
  const handleEditStudent = async (student: StudentEmployerSupervisor) => {
    try {
      const fullStudentData = await getStudentById(student.student_id);
      setEditStudentId(student.student_id);
      setIsEditMode(true);
      setFormErrors({});

      setFirstName(fullStudentData.first_name || "");
      setLastName(fullStudentData.last_name || "");
      setDob(
        fullStudentData.dob
          ? new Date(fullStudentData.dob).toISOString().split("T")[0]
          : ""
      );
      setGender(fullStudentData.gender || "");
      setContactNumber(fullStudentData.contact_number || "");
      setContactNumberGuardian(fullStudentData.contact_number_guardian || "");
      setSupervisorId(
        fullStudentData.supervisor_id
          ? String(fullStudentData.supervisor_id)
          : undefined
      );
      setRemarks(fullStudentData.remarks || "");
      setEmployerId(
        fullStudentData.employer_id
          ? String(fullStudentData.employer_id)
          : undefined
      );
      setCheckInTime(
        fullStudentData.check_in_time
          ? fullStudentData.check_in_time.substring(0, 5)
          : ""
      );
      setCheckOutTime(
        fullStudentData.check_out_time
          ? fullStudentData.check_out_time.substring(0, 5)
          : ""
      );

      setIsAddDialogOpen(true);
    } catch (error) {
      console.error("Error fetching student data for edit:", error);
      alert("Failed to load student data for editing. Please try again.");
    }
  };

  // Handle closing edit dialog
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditMode(false);
    setEditStudentId(null);
    resetForm();
  };

  // Open delete dialog
  const handleDeleteStudent = (id: number) => {
    setDeleteStudentId(id);
    setIsDeleteDialogOpen(true);
  };

  // UPDATED: Added loading state management
  const handleConfirmDeleteStudent = async () => {
    if (typeof deleteStudentId !== "number" || isNaN(deleteStudentId)) {
      console.error("Invalid student ID for delete:", deleteStudentId);
      return;
    }
    setIsDeleting(deleteStudentId);
    try {
      await deleteStudent(deleteStudentId);
      // Refresh table
      const data = await getManagementTable();
      setManagementData(Array.isArray(data) ? data : []);
      setIsDeleteDialogOpen(false);
      setDeleteStudentId(null);
    } catch (err) {
      console.error("Failed to delete student", err);
      alert("Failed to delete student. See console for details.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Helper to format ISO date string to readable format
  function formatDateTime(iso: string) {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  // Validate form inputs
  function validateForm() {
    const errors: { [key: string]: string } = {};

    // First name required
    if (!firstName.trim()) errors.firstName = "First name is required";

    // DOB: valid date and at least 16 years old
    if (!dob) {
      errors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(dob);
      const now = new Date();
      const age = now.getFullYear() - dobDate.getFullYear();
      const m = now.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dobDate.getDate())) {
        if (age - 1 < 16) errors.dob = "Student must be at least 16 years old";
      } else {
        if (age < 16) errors.dob = "Student must be at least 16 years old";
      }
      if (isNaN(dobDate.getTime())) errors.dob = "Invalid date of birth";
    }
    // Gender required
    if (!gender) errors.gender = "Gender is required";

    // Phone number validation
    function validatePhone(number: string, label: string) {
      // Remove spaces and dashes for validation
      const cleaned = number.replace(/[\s-]/g, "");
      if (!cleaned) return `${label} is required`;

      // Local format: 0XXXXXXXXX (any 10-digit Sri Lankan number)
      if (cleaned.startsWith("0")) {
        if (!/^0\d{9}$/.test(cleaned)) {
          return `${label} must be a valid 10-digit local number (e.g., 0XXXXXXXXX)`;
        }
      }
      // International format: +94XXXXXXXXX (12 digits, including country code)
      else if (cleaned.startsWith("+94")) {
        if (!/^\+94\d{9}$/.test(cleaned)) {
          return `${label} must be a valid international number (+94XXXXXXXXX)`;
        }
      }
      // Invalid format
      else {
        return `${label} must start with a Sri Lankan prefix (0 or +94)`;
      }
      return "";
    }

    const contactNumberError = validatePhone(
      contactNumber.trim(),
      "Contact number"
    );
    if (contactNumberError) errors.contactNumber = contactNumberError;

    const guardianNumberError = validatePhone(
      contactNumberGuardian.trim(),
      "Guardian contact number"
    );
    if (guardianNumberError) errors.contactNumberGuardian = guardianNumberError;

    // Supervisor required
    if (!supervisorId) errors.supervisorId = "Supervisor is required";

    // Employer required
    if (!employerId) errors.employerId = "Employer is required";

    // Check-out time is now required
    if (!checkOutTime) {
      errors.checkOutTime = "Check-out time is required";
    }

    return errors;
  }

  // Helper for DOB input: restrict max date to today, min date to 100 years ago
  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];
  const minDate = new Date(
    today.getFullYear() - 50, // 50 years ago
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <div className="flex flex-1">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  Student Management
                </h2>
              </div>
              <Button
                onClick={handleAddStudent}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>

            {/* Search and Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="pl-10 bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    placeholder="Search students by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchQuery("")}
                      tabIndex={-1}
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-md">
                <p className="text-sm font-medium opacity-90">Total Students</p>
                <p className="text-2xl font-bold mt-1">
                  {managementData.length}
                </p>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <TableHead className="w-16 font-semibold text-gray-700">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      NAME
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      EMPLOYER
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      EMPLOYER CONTACT
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      SUPERVISOR
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      SUPERVISOR CONTACT
                    </TableHead>
                    <TableHead className="w-24 font-semibold text-gray-700">
                      ACTION
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredSortedManagementData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSortedManagementData.map((item) => (
                      <TableRow
                        key={item.student_id}
                        className="hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {item.student_id}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.student_first_name} {item.student_last_name}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.employer_name || "-"}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.employer_contact_number || "-"}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {(item.supervisor_first_name || "-") +
                            " " +
                            (item.supervisor_last_name || "")}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.supervisor_contact_number || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {/* UPDATED: Edit button with disabled state */}
                            <button
                              onClick={() => handleEditStudent(item)}
                              disabled={
                                isDeleting !== null || otpLoadingId !== null
                              }
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit student"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            {/* UPDATED: Delete button with disabled state */}
                            <button
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete student"
                              onClick={() =>
                                handleDeleteStudent(item.student_id)
                              }
                              disabled={
                                isDeleting !== null || otpLoadingId !== null
                              }
                            >
                              {isDeleting === item.student_id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash className="h-5 w-5" />
                              )}
                            </button>
                            {/* UPDATED: OTP Button with loading state */}
                            <button
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Send OTP"
                              onClick={() => handleOtpClick(item.student_id)}
                              disabled={
                                isDeleting !== null || otpLoadingId !== null
                              }
                            >
                              {otpLoadingId === item.student_id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Key className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isEditMode ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              {isEditMode
                ? "Update the student details below"
                : "Fill in the details to add a new student to the system"}
            </p>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmitStudent} className="mt-6">
            <div className="space-y-6">
              {/* Form fields... (unchanged) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Firstname <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 bg-white/80"
                  />
                  {isFormSubmitted && formErrors.firstName && (
                    <span className="text-red-600 text-xs">
                      {formErrors.firstName}
                    </span>
                  )}
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Lastname
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 bg-white/80"
                  />
                </div>
              </div>

              {/* Date of birth and gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-medium text-gray-700"
                  >
                    Date of birth (YYYY-MM-DD){" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-1.5 bg-white/80"
                    min={minDate}
                    max={maxDate}
                  />
                  {formErrors.dob && (
                    <span className="text-red-600 text-xs">
                      {formErrors.dob}
                    </span>
                  )}
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-gray-700"
                  >
                    Gender <span className="text-red-600">*</span>
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="mt-1.5 bg-white/80">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.gender && (
                    <span className="text-red-600 text-xs">
                      {formErrors.gender}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="contactNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Contact Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="mt-1.5 bg-white/80"
                  />
                  {formErrors.contactNumber && (
                    <span className="text-red-600 text-xs">
                      {formErrors.contactNumber}
                    </span>
                  )}
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="contactNumberGuardian"
                    className="text-sm font-medium text-gray-700"
                  >
                    Guardian Contact Number{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="contactNumberGuardian"
                    value={contactNumberGuardian}
                    onChange={(e) => setContactNumberGuardian(e.target.value)}
                    className="mt-1.5 bg-white/80"
                  />
                  {formErrors.contactNumberGuardian && (
                    <span className="text-red-600 text-xs">
                      {formErrors.contactNumberGuardian}
                    </span>
                  )}
                </div>
              </div>

              {/* Employer and supervisor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="employerId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Employer <span className="text-red-600">*</span>
                  </Label>
                  <Select value={employerId} onValueChange={setEmployerId}>
                    <SelectTrigger
                      id="employerId"
                      className="mt-1.5 bg-white/80"
                    >
                      <SelectValue placeholder="Select employer" />
                    </SelectTrigger>
                    <SelectContent>
                      {employerOptions.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.employerId && (
                    <span className="text-red-600 text-xs">
                      {formErrors.employerId}
                    </span>
                  )}
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="supervisorId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Supervisor <span className="text-red-600">*</span>
                  </Label>
                  <Select value={supervisorId} onValueChange={setSupervisorId}>
                    <SelectTrigger
                      id="supervisorId"
                      className="mt-1.5 bg-white/80"
                    >
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisorOptions.map((sup) => (
                        <SelectItem
                          key={sup.supervisor_id}
                          value={String(sup.supervisor_id)}
                        >
                          {sup.first_name} {sup.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.supervisorId && (
                    <span className="text-red-600 text-xs">
                      {formErrors.supervisorId}
                    </span>
                  )}
                </div>
              </div>

              {/* Check-in and check-out times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="checkInTime"
                    className="text-sm font-medium text-gray-700"
                  >
                    Check-in Time
                  </Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="mt-1.5 bg-white/80"
                  />
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                  <Label
                    htmlFor="checkOutTime"
                    className="text-sm font-medium text-gray-700"
                  >
                    Check-out Time <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="mt-1.5 bg-white/80"
                  />
                  {formErrors.checkOutTime && (
                    <span className="text-red-600 text-xs">
                      {formErrors.checkOutTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                <Label
                  htmlFor="remarks"
                  className="text-sm font-medium text-gray-700"
                >
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1.5 bg-white/80 h-40"
                />
              </div>

              {/* UPDATED: Submit button with loading state */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 py-6 text-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : isEditMode ? (
                  "Update Student"
                ) : (
                  "Add Student"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Result Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Key className="h-6 w-6 text-green-600" />
                OTP Details
              </span>
            </DialogTitle>
          </DialogHeader>
          {otpLoadingId !== null ? (
            <div className="text-center py-8">Generating OTP...</div>
          ) : otpError ? (
            <div className="text-red-600 py-4">{otpError}</div>
          ) : otpResult && (otpResult.otp_code || otpResult.otp) ? (
            <div className="py-4 flex justify-center">
              <div className="w-full max-w-xs bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl shadow p-5 flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center">
                  <span className="uppercase text-xs tracking-widest text-green-700 font-semibold mb-1">
                    One Time Password
                  </span>
                  <span className="text-4xl font-mono font-bold text-green-700 tracking-widest bg-green-100 px-6 py-2 rounded-lg shadow-inner">
                    {otpResult.otp_code || otpResult.otp}
                  </span>
                </div>
                <div className="w-full flex flex-col gap-2 mt-2">
                  {otpResult.student_id && (
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span className="font-medium">Student ID:</span>
                      <span>{otpResult.student_id}</span>
                    </div>
                  )}
                  {otpResult.expires_at && (
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span className="font-medium">Expires At:</span>
                      <span>{formatDateTime(otpResult.expires_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : otpResult ? (
            <div className="py-4">
              <div className="text-gray-700 text-sm">
                {JSON.stringify(otpResult)}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 py-4">No OTP data.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this student?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting !== null}
            >
              Cancel
            </Button>
            {/* UPDATED: Delete button with loading state */}
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteStudent}
              disabled={isDeleting !== null}
            >
              {isDeleting !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
