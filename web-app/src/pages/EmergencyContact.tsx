import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Save, Loader2 } from "lucide-react";
import {
  fetchEmergencyContact,
  updateEmergencyContact,
} from "../api/emergencyContactService";

const EmergencyContact = () => {
  const [contact, setContact] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState("");
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchEmergencyContact()
      .then((phone_number) => {
        setContact(phone_number);
      })
      .catch((err) => {
        setError("Failed to fetch emergency contact. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setInput(contact);
    setLog("");
    setError("");
  };

  // Only allow numbers and optional leading +
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith("+")) {
      value = "+" + value.slice(1).replace(/[^0-9]/g, "");
    } else {
      value = value.replace(/[^0-9]/g, "");
    }
    setInput(value);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateEmergencyContact(input);
      setContact(input);
      setEditMode(false);
      setLog("emergency contact number updated");
    } catch (err) {
      setError("Failed to update emergency contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <main className="flex-1 p-6 flex items-start justify-start p-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 max-w-md w-full p-8">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Emergency Contact Number
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="text-red-600 text-sm font-medium mt-2">
                  {error}
                </div>
              )}
              {!editMode ? (
                <div className="flex items-center justify-between">
                  <span className="text-lg tracking-widest font-mono text-gray-700 select-none">
                    {contact}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Input
                    type="tel"
                    value={input}
                    onChange={handleInputChange}
                    className="font-mono"
                    maxLength={15}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={saving || input.length < 5}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
              {log && (
                <div className="text-green-600 text-sm font-medium mt-2">
                  {log}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmergencyContact;
