import React from "react";

type Badge = string | { label: string; iconUrl?: string };

export const Tech: React.FC<{ badges: Badge[] }> = ({ badges }) => {
  if (!badges?.length) return <div className="text-muted">No badges configured.</div>;
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Tech</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {badges.map((b, i) => {
          const label = typeof b === "string" ? b.split("/").pop() : b.label;
          const iconUrl = typeof b === "string" ? b : b.iconUrl;
          return (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-subtle bg-surface p-3"
            >
              {iconUrl && <img src={iconUrl} alt="" className="h-6 w-6" />}
              <span className="text-sm">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
