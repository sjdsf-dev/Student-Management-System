import React, { useEffect, useState } from "react";
import { getManagerFeedback, FeedbackResponse } from "@/api/getManagerFeedback";
import { Search, X } from "lucide-react"; // adjust import path if needed
import { Input } from "@/components/ui/input"; // adjust import path if needed

// Add "Date" as the first column
const COLUMN_ORDER = [
  "Date",
  "Student Name",
  "Number of days attended this week",
  "On time?",
  "Worked without prompts",
  "Change in behaviour noted?",
  "If yes, mention that behaviour",
  "Any other comments?",
];

const ManagerFeedback: React.FC = () => {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // renamed from search

  useEffect(() => {
    getManagerFeedback()
      .then((responses) => {
        // Sort responses by Timestamp (latest first)
        const sorted = [...responses].sort((a, b) => {
          const dateA = new Date(a["Timestamp"] || 0).getTime();
          const dateB = new Date(b["Timestamp"] || 0).getTime();
          return dateB - dateA;
        });
        setResponses(sorted);
      })
      .catch((err) => {
        setError(
          "Failed to fetch feedback responses. See console for details."
        );
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div>{error}</div>;
  if (responses.length === 0) return <div>No feedback responses found.</div>;

  // Only show columns in COLUMN_ORDER
  const headers = COLUMN_ORDER;

  // Filter responses by search (case-insensitive)
  const filteredResponses = responses.filter((resp) =>
    resp["Student Name"]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <div className="flex flex-1">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Heading and Search Bar Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                Manager Feedback Responses
              </h2>
              <div className="w-full md:w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="pl-10 bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    placeholder="Search by student name..."
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
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-x-auto mt-6 w-full">
              <table
                className="min-w-[600px] md:min-w-full border-separate border-spacing-0"
                border={1}
                cellPadding={8}
                cellSpacing={0}
              >
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50 text-left border-b border-gray-200 border-r last:border-r-0 px-4 py-2"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((resp, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      {headers.map((header) => (
                        <td
                          key={header}
                          className="text-gray-700 border-b border-gray-100 border-r last:border-r-0 px-4 py-2"
                        >
                          {header === "Date"
                            ? resp["Timestamp"]
                              ? resp["Timestamp"].split(" ")[0]
                              : ""
                            : resp[header] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredResponses.length === 0 && (
                <div className="p-4 text-gray-500">No results found.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerFeedback;
