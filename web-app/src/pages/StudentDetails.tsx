import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getTraineeProfile,
  TraineeProfileResponse,
  StudentInfo,
  Mood,
} from "../api/getEmployeeSummary";

const StudentDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<TraineeProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Prepare attendance data for table
  const attendanceData =
    (profile?.recent_attendance ?? [])
      .map((a) => {
        const checkInDate = a.actual_check_in
          ? new Date(a.actual_check_in)
          : null;
        const checkOutDate =
          a.actual_check_out && !a.actual_check_out.startsWith("0001-01-01")
            ? new Date(a.actual_check_out)
            : null;
        return {
          date: checkInDate
            ? `${String(checkInDate.getDate()).padStart(2, "0")}-${String(
                checkInDate.getMonth() + 1
              ).padStart(2, "0")}`
            : "-",
          checkIn: checkInDate
            ? `${String(checkInDate.getHours()).padStart(2, "0")}:${String(
                checkInDate.getMinutes()
              ).padStart(2, "0")}`
            : "-",
          checkOut: checkOutDate
            ? `${String(checkOutDate.getHours()).padStart(2, "0")}:${String(
                checkOutDate.getMinutes()
              ).padStart(2, "0")}`
            : "-",
          actual_check_in: a.actual_check_in,
        };
      })
      .sort((a, b) =>
        a.actual_check_in > b.actual_check_in
          ? 1
          : a.actual_check_in < b.actual_check_in
          ? -1
          : 0
      )
      .map(({ actual_check_in, ...rest }) => rest) || [];

  // Prepare emotional trend data for chart
  const emotionMap = { sad: 0, neutral: 1, happy: 2 };
  const emotionalData =
    (profile?.recent_moods ?? [])
      .map((m: Mood) => ({
        date: m.recorded_at?.slice(0, 10),
        value: emotionMap[m.emotion] ?? 1,
        recorded_at: m.recorded_at,
      }))
      .sort((a, b) =>
        a.recorded_at > b.recorded_at
          ? 1
          : a.recorded_at < b.recorded_at
          ? -1
          : 0
      )
      .map(({ recorded_at, ...rest }) => rest) || [];

  const studentInfo: StudentInfo | undefined = profile?.student_info;

  const employee = {
    id,
    name: studentInfo
      ? `${studentInfo.first_name} ${studentInfo.last_name}`
      : "Student",
    employer_name: studentInfo?.employer_name || "",
    guardian_contact_no: studentInfo?.contact_number_guardian || "",
    student_contact_no: studentInfo?.contact_number || "",
    ...studentInfo,
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getTraineeProfile(Number(id))
      .then((profileData) => {
        setProfile(profileData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const feedbacks =
    studentInfo?.remarks && studentInfo.remarks.trim() !== ""
      ? [
          {
            date: "",
            time: "",
            type: "Remark",
            content: studentInfo.remarks,
          },
        ]
      : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                Trainer Dashboard
              </h2>
            </div>

            {/* Employee Profile */}
            <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 mb-8 gap-6">
              <div className="flex-1 flex flex-col justify-center items-center md:items-start">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {employee.name}
                </h3>
                <p className="text-gray-500 text-sm mb-1">
                  ID: <span className="font-medium">{employee.id}</span>
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  Employer:{" "}
                  <span className="font-medium">{employee.employer_name}</span>
                </p>
                <div className="flex gap-4 mt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-semibold shadow">
                    Guardian: {employee.guardian_contact_no}
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 text-xs font-semibold shadow">
                    Student: {employee.student_contact_no}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Attendance Log */}
              <Card className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-md border border-blue-100/60 transition-transform hover:scale-[1.02]">
                <h3 className="text-lg font-bold mb-4 text-blue-700">
                  Attendance Log
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs text-gray-500">
                        DATE
                      </TableHead>
                      <TableHead className="text-xs text-gray-500">
                        CHECK IN
                      </TableHead>
                      <TableHead className="text-xs text-gray-500">
                        CHECK OUT
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((record, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-blue-50/60 transition"
                      >
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Incident Reports */}
              <Card className="bg-gradient-to-br from-white to-red-50 p-6 rounded-2xl shadow-md border border-red-100/60 transition-transform hover:scale-[1.02]">
                <h3 className="text-lg font-bold mb-4 text-red-700">
                  Incident Reports
                </h3>
                <div className="space-y-4">
                  {/* {!studentSummary?.ai_generated_summary && ( */}
                  <div className="text-gray-400 text-sm">
                    No incidents reported.
                  </div>
                  {/* )} */}
                  {/* {studentSummary?.ai_generated_summary && ( */}
                  {/* <div className="p-3 bg-red-50/60 rounded-lg shadow-sm border border-red-100">
                      <div
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(
                            studentSummary.ai_generated_summary
                          ),
                        }}
                      />
                    </div>
                  )} */}
                </div>
              </Card>

              {/* Emotional Trend */}
              <Card className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-2xl shadow-md border border-yellow-100/60 transition-transform hover:scale-[1.02]">
                <h3 className="text-lg font-bold mb-4 text-yellow-700">
                  Emotional Trend
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={emotionalData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => value?.slice(5)}
                        className="text-xs text-gray-400"
                      />
                      <YAxis
                        domain={[0, 2]}
                        ticks={[0, 1, 2]}
                        tickFormatter={(value) => {
                          switch (value) {
                            case 0:
                              return "Sad";
                            case 1:
                              return "Neutral";
                            case 2:
                              return "Happy";
                            default:
                              return "";
                          }
                        }}
                        className="text-xs text-gray-400"
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#eab308"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Feedbacks */}
              <Card className="bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl shadow-md border border-green-100/60 transition-transform hover:scale-[1.02]">
                <h3 className="text-lg font-bold mb-4 text-green-700">
                  Feedbacks
                </h3>
                <div className="space-y-4">
                  {feedbacks.length === 0 && (
                    <div className="text-gray-400 text-sm">
                      No feedbacks yet.
                    </div>
                  )}
                  {feedbacks.map((feedback, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-50/60 rounded-lg shadow-sm border border-green-100"
                    >
                      <p className="text-xs text-gray-500 mb-1"></p>
                      <p className="text-sm text-green-800">
                        {feedback.content}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDetail;
