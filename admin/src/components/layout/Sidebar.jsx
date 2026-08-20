import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, X, Activity, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { navGroups } from '../../config/navGroups';

function NavGroup({ group }) {
  const location = useLocation();
  const isActive = group.items?.some((item) => location.pathname.startsWith(item.href));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-colors hover:bg-slate-100"
      >
        <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
          {group.label}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isActive ? 'text-teal-600' : 'text-slate-400'}`}
        />
      </button>

      {open && (
        <div className="mt-0.5 mb-2 space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive: active }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                  active
                    ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
                }`
              }
            >
              <item.icon size={14} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsedLink({ item }) {
  return (
    <NavLink
      to={item.href}
      title={item.label}
      className={({ isActive }) =>
        `flex items-center justify-center w-10 h-10 mx-auto rounded-md transition-all duration-150 ${
          isActive
            ? 'bg-teal-50 text-teal-700'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <item.icon size={17} className="flex-shrink-0" />
    </NavLink>
  );
}

export default function Sidebar({ open, onClose, collapsed = false, onToggleCollapsed, logo }) {
  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} showCollapseToggle logo={logo} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 flex-shrink-0">
          {logo
            ? <img src={logo} alt="Logo" className="h-8 max-w-[120px] object-contain" />
            : <span className="text-sm font-bold text-slate-800">Aging Congress</span>
          }
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <SidebarContent collapsed={false} logo={logo} />
      </aside>
    </>
  );
}

function SidebarContent({ collapsed, onToggleCollapsed, showCollapseToggle, logo }) {
  return (
    <>
      {/* Logo */}
      <div className={`hidden lg:flex items-center h-16 border-b border-slate-200 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            className={collapsed ? 'h-8 w-8 object-contain' : 'h-8 max-w-[120px] object-contain'}
          />
        ) : (
          <div className="w-8 h-8 bg-teal-700 flex items-center justify-center rounded-md flex-shrink-0">
            <Activity size={15} className="text-white" />
          </div>
        )}
        {!collapsed && !logo && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-tight truncate">Aging Congress</p>
            <p className="text-xs text-teal-600 font-medium">Admin Panel</p>
          </div>
        )}
        {!collapsed && logo && (
          <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
        )}
      </div>

      {/* Nav */}
      {collapsed ? (
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navGroups.map((group) =>
            group.single ? (
              <CollapsedLink key={group.href} item={group} />
            ) : (
              <div key={group.label} className="space-y-1 pb-1 mb-1 border-b border-slate-100 last:border-0">
                {group.items.map((item) => (
                  <CollapsedLink key={item.href} item={item} />
                ))}
              </div>
            )
          )}
        </nav>
      ) : (
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navGroups.map((group) =>
            group.single ? (
              <NavLink
                key={group.href}
                to={group.href}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
                  }`
                }
              >
                <group.icon size={16} className="flex-shrink-0" />
                {group.label}
              </NavLink>
            ) : (
              <NavGroup key={group.label} group={group} />
            )
          )}
        </nav>
      )}

      {/* Footer */}
      <div className={`border-t border-slate-200 flex-shrink-0 ${collapsed ? 'p-2' : 'px-4 py-3'}`}>
        {showCollapseToggle && (
          <button
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex items-center gap-2 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors ${
              collapsed ? 'w-10 h-10 justify-center mx-auto' : 'w-full px-3 py-2 text-sm'
            }`}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={16} />}
            {!collapsed && 'Collapse'}
          </button>
        )}
        {!collapsed && (
          <p className="text-xs text-slate-400 text-center mt-2">v1.0.0 · Aging Congress CMS</p>
        )}
      </div>
    </>
  );
}
