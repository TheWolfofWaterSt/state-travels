"use client";

import { clearAdminToken } from "@/lib/auth-client";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        clearAdminToken();
        window.location.href = "/logout";
      }}
      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
    >
      Logout
    </button>
  );
}
