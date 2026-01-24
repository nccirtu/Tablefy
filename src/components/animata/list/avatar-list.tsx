import React from "react";

export const AvatarList = ({
  items,
  maxVisible = 5,
  size = 32,
  ...props
}: {
  items: Array<{ id: string; src?: string; alt?: string; initials?: string }>;
  maxVisible?: number;
  size?: number | string;
  [key: string]: any;
}) => {
  const sizeValue = typeof size === "string" ? parseInt(size, 10) || 32 : size;
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
        >
          +{items.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarList;
