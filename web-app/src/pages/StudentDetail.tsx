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
import DOMPurify from "dompurify"; // Added for sanitization
import {
  getTraineeProfile,
  TraineeProfileResponse,
  StudentInfo,
  Mood,
} from "../api/getEmployeeSummary";

interface StudentSummary {
  ai_generated_summary: string;
  behavior_changes: string[];
  on_time_percentage: number;
  other_comments: string[];
  student_name: string;
  summary_period: {
    end_date: string;
    start_date: string;
  };
  total_days_attended: number;
  total_weeks_recorded: number;
  worked_without_prompts_count: number;
}

const StudentDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<TraineeProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(
    null
  );

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

  const getStudentSummary = async (
    studentName: string
  ): Promise<StudentSummary> => {
    const response = await fetch(
      `https://87e89eab-95e5-4c0f-8192-7ee0196e1581-dev.e1-us-east-azure.choreoapis.dev/student-management-system/summarizer/v1.0/student_summary?student_name=${encodeURIComponent(
        studentName
      )}`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch student summary");
    }

    return response.json();
  };

  // ✅ Fixed: Single API call & wait until profile is loaded before calling summary
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getTraineeProfile(Number(id))
      .then((profileData) => {
        setProfile(profileData);
        if (profileData.student_info) {
          return getStudentSummary(
            `${profileData.student_info.first_name} ${profileData.student_info.last_name}`
          );
        }
      })
      .then((summaryData) => {
        if (summaryData) setStudentSummary(summaryData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const renderMarkdown = (text: string) => {
    const rawHtml = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
    return DOMPurify.sanitize(rawHtml); // ✅ Sanitized output
  };

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
            {/* Incident Reports */}
            <Card className="bg-gradient-to-br from-white to-red-50 p-6 rounded-2xl shadow-md border border-red-100/60 transition-transform hover:scale-[1.02]">
              <h3 className="text-lg font-bold mb-4 text-red-700">
                Incident Reports
              </h3>
              <div className="space-y-4">
                {!studentSummary?.ai_generated_summary && (
                  <div className="text-gray-400 text-sm">
                    No incidents reported.
                  </div>
                )}
                {studentSummary?.ai_generated_summary && (
                  <div className="p-3 bg-red-50/60 rounded-lg shadow-sm border border-red-100">
                    <div
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(
                          studentSummary.ai_generated_summary
                        ),
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDetail;
