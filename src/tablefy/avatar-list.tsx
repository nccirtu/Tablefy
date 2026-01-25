import React from "react";

export const AvatarList = ({
  items,
  maxVisible = 5,
  size = 32,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  items: Array<{ id: string; src?: string; alt?: string; initials?: string }>;
  maxVisible?: number;
  size?: number | string;
}) => {
}) => {
  const sizeValue = size ?? 32;
  return (
    <div
      className="avatar-list"
      style={{ "--avatar-size": `${sizeValue}px` } as React.CSSProperties}
      {...props}
    >
      {items.slice(0, maxVisible).map((item) => (
        <div key={item.id} className="avatar-item">
          {item.src ? (
            <img
              src={item.src}
              alt={item.alt || "Avatar"}
              style={{ width: `${sizeValue}px`, height: `${sizeValue}px` }}
            />
          ) : (
            <div
              className="avatar-initials"
              style={{ width: `${sizeValue}px`, height: `${sizeValue}px` }}
            >
              {item.initials || "?"}
            </div>
          )}
        </div>
      ))}
      {items.length > maxVisible && (
        <div
          className="avatar-count"
          style={{ width: `${sizeValue}px`, height: `${sizeValue}px` }}
          aria-label={`${items.length - maxVisible} weitere Personen`}
          role="img"
        >
          {items.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarList;
