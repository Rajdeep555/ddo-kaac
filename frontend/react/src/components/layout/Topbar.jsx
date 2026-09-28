import { getUser } from "../../services/auth";

const Topbar = ({ onMenuClick }) => {
  const user = getUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            {user?.role === "ADMIN" ? "Admin Panel" : "Cashier Panel"}
          </p>

          <p className="hidden text-xs text-slate-400 sm:block">
            Tax Management System
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-slate-800">
          {user?.name || "User"}
        </p>

        <p className="text-xs text-slate-400">{user?.role || ""}</p>
      </div>
    </header>
  );
};

export default Topbar;
