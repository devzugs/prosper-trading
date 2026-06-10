import React from "react";
import { useState } from "react";
import { Link, useLocation  } from "react-router-dom";
import { ChevronDown } from "lucide-react";





const NavItem = ({ item, depth = 0 }) => {
  const location = useLocation();
  const hasChildren = item.children?.length > 0;
  const isActive = location.pathname === item.to;
  const isParentActive =
    hasChildren && item.children.some((c) => location.pathname === c.to);

  const [open, setOpen] = useState(isParentActive);
  const Icon = item.icon;

  return (
    <li>
      {hasChildren ? (
        <>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className={`
              group my-transition w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              ${
                isParentActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-light hover:bg-white/5 hover:text-white"
              }
            `}
          >
            <Icon
              size={18}
              className={`shrink-0 my-transition ${
                isParentActive
                  ? "text-accent"
                  : "text-text-muted group-hover:text-text-light"
              }`}
            />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              size={15}
              className={`shrink-0 my-transition text-text-muted ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <ul className="mt-1 ml-4 border-l border-white/5 pl-3 space-y-1">
              {item.children.map((child) => (
                <NavItem key={child.to} item={child} depth={depth + 1} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          to={item.to}
          className={`
            group my-transition flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
            ${depth > 0 ? "py-2" : ""}
            ${
              isActive
                ? "bg-accent/10 text-accent border-l-2 border-accent rounded-l-none -ml-px pl-2.75"
                : "text-text-light hover:bg-white/5 hover:text-white"
            }
          `}
        >
          <Icon
            size={18}
            className={`shrink-0 my-transition ${
              isActive
                ? "text-accent"
                : "text-text-muted group-hover:text-text-light"
            }`}
          />
          <span>{item.label}</span>
        </Link>
      )}
    </li>
  );
};

export default NavItem;