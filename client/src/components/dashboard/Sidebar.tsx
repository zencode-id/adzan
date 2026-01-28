// Sidebar component - no hooks needed as state is managed by parent

interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard", href: "#" },
  {
    id: "location",
    icon: "location_on",
    label: "Location Settings",
    href: "#",
  },
  { id: "announcements", icon: "campaign", label: "Announcements", href: "#" },
  { id: "content", icon: "view_carousel", label: "Content Display", href: "#" },
  { id: "display", icon: "palette", label: "Theme Display", href: "#" },
  { id: "prayer", icon: "schedule", label: "Prayer Calculation", href: "#" },
  { id: "system", icon: "info", label: "System Info", href: "#" },
];

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export function Sidebar({ activeItem = "system", onItemClick }: SidebarProps) {
  const handleClick = (id: string) => {
    onItemClick?.(id);
  };

  return (
    <aside className="w-64 bg-emerald-950 text-white flex flex-col shadow-2xl z-20 shrink-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--primary-gold)" }}
          >
            <span className="material-symbols-outlined text-emerald-950 font-bold">
              mosque
            </span>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none">
              MOSQUE DISPLAY
            </h1>
            <p className="text-[10px] text-white/60 font-medium tracking-widest mt-1">
              CONTROL PANEL
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="grow p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              handleClick(item.id);
            }}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all group
              ${
                activeItem === item.id
                  ? "text-emerald-950 font-semibold shadow-lg"
                  : "text-white/60 hover:bg-white/5"
              }
            `}
            style={
              activeItem === item.id
                ? { backgroundColor: "var(--primary-gold)" }
                : {}
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-emerald-900/50 p-4 rounded-xl">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">
            Logged in as
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <p className="text-xs font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
