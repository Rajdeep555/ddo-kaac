import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import logo from "../../assets/logo.jpg";

/* ---------- Icons ---------- */

const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    {children}
  </svg>
);

const DashboardIcon = () => (
  <Icon>
    <path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />
  </Icon>
);

const TaxIcon = () => (
  <Icon>
    <path d="M9 14l6-6m-5.5-3.5h.01M14.5 19.5h.01M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </Icon>
);

const DdoIcon = () => (
  <Icon>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
    <path d="M7 7h10M7 11h10M7 15h6" />
  </Icon>
);

const LogoutIcon = () => (
  <Icon>
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </Icon>
);

const ChevronIcon = ({ open }) => (
  <Icon
    className={`h-4 w-4 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`}>
    <path d="M19 9l-7 7-7-7" />
  </Icon>
);

/* ---------- Menu config ---------- */

const cashierMenu = [
  {
    key: "tax",
    label: "Tax",
    icon: TaxIcon,
    children: [
      { to: "/cashier/tax/create", label: "Create" },
      { to: "/cashier/tax/created", label: "Created Data" },
    ],
  },
];

const adminMenu = [
  {
    key: "ddo",
    label: "DDO",
    icon: DdoIcon,
    children: [
      { to: "/admin/ddo/create", label: "Create" },
      { to: "/admin/ddo/created", label: "Created" },
    ],
  },
  {
    key: "tax",
    label: "Tax",
    icon: TaxIcon,
    children: [{ to: "/admin/tax-details", label: "Tax Details" }],
  },
];

/* ---------- Component ---------- */

const Sidebar = ({ role, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isAdmin = role === "ADMIN";
  const menu = isAdmin ? adminMenu : cashierMenu;

  // Open the group that contains the current page on first load
  const [openMenu, setOpenMenu] = useState(
    () =>
      menu.find((item) =>
        item.children.some((child) => pathname.startsWith(child.to)),
      )?.key ?? null,
  );

  const toggleMenu = (key) => {
    setOpenMenu((current) => (current === key ? null : key));
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
      isActive
        ? "bg-white/10 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-white"
        : "text-blue-100 hover:bg-white/5 hover:text-white"
    }`;

  const subLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm transition ${focusRing} ${
      isActive
        ? "bg-white/10 font-medium text-white"
        : "text-blue-200 hover:bg-white/5 hover:text-white"
    }`;

  const menuButtonClass = (isOpen, hasActiveChild) =>
    `flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
      isOpen || hasActiveChild
        ? "text-white"
        : "text-blue-100 hover:bg-white/5 hover:text-white"
    } ${isOpen ? "bg-white/5" : ""}`;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          bg-blue-950 text-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          {/* Replace with your official emblem / logo */}
          <div className="flex h-12 w-12 shrink-0 items-center overflow-hidden justify-center rounded-full border border-white/30 bg-white/10">
            {/* <Icon className="h-5 w-5">
              <path d="M3 10 12 4l9 6" />
              <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
              <path d="M3 20h18" />
            </Icon> */}
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              Tax Management
            </p>
            <p className="text-xs text-blue-300">
              {isAdmin ? "Admin Panel" : "Cashier Panel"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink
            to={isAdmin ? "/admin/dashboard" : "/cashier"}
            end
            onClick={closeMobile}
            className={linkClass}>
            <DashboardIcon />
            <span>Dashboard</span>
          </NavLink>

          {menu.map((item) => {
            const isOpen = openMenu === item.key;
            const hasActiveChild = item.children.some((child) =>
              pathname.startsWith(child.to),
            );
            const Item = item.icon;

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.key)}
                  aria-expanded={isOpen}
                  className={menuButtonClass(isOpen, hasActiveChild)}>
                  <span className="flex items-center gap-3">
                    <Item />
                    <span>{item.label}</span>
                  </span>

                  <ChevronIcon open={isOpen} />
                </button>

                {isOpen && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/15 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={closeMobile}
                        className={subLinkClass}>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/5 hover:text-white ${focusRing}`}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
