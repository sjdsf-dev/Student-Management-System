// src/components/layout/UserProfile.tsx
import { ArrowLeftFromLine } from "lucide-react";
import { useAuth } from ".././context/AuthContext";

interface UserProfileProps {
  compact: boolean;
}

const UserProfile = ({ compact }: UserProfileProps) => {
  const { user, logout } = useAuth();

  const avatarInitial =
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const fullName =
    user?.first_name && user.first_name.trim().length > 0
      ? `${user.first_name}${user?.last_name ? ` ${user.last_name}` : ""}`
      : user?.email || "";

  return !compact ? (
    <div className="mt-auto p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {avatarInitial}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-2 py-4 px-4 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 mx-1 mt-2"
          title="Logout"
        >
          <ArrowLeftFromLine className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  ) : (
    <div className="mt-auto p-2 border-t border-gray-200 flex flex-col items-center">
      <div className="mb-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <span className="text-base font-semibold text-white">
          {avatarInitial}
        </span>
      </div>
      <div className="mt-4 border-t border-gray-200">
        <div className="mb-2 w-8 h-8 flex items-center justify-center mt-4">
          <ArrowLeftFromLine className="text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
