// Generic mock for any `@/components/ui/*` shadcn module.
// Returns a lightweight component for EVERY named import, so e.g.
// `import { Button, Table, Select } from "@/components/ui/..."` all resolve.
const React = require("react");

// Only forward DOM-safe props so React doesn't warn about unknown attributes
// (shadcn components accept many non-DOM props like onValueChange, asChild, variant).
const DOM_PROPS = new Set([
  "className",
  "id",
  "onClick",
  "onChange",
  "value",
  "type",
  "placeholder",
  "disabled",
  "htmlFor",
  "role",
]);

function domProps(props) {
  const out = {};
  for (const key of Object.keys(props)) {
    if (DOM_PROPS.has(key) || key.startsWith("data-") || key.startsWith("aria-")) {
      out[key] = props[key];
    }
  }
  return out;
}

function element(name) {
  const lower = String(name).toLowerCase();
  let tag = "div";
  if (lower.includes("input")) tag = "input";
  else if (lower.includes("button") || lower.includes("trigger")) tag = "button";

  const Comp = React.forwardRef(function Mock({ children, ...props }, ref) {
    return React.createElement(
      tag,
      { ref, "data-ui": name, ...domProps(props) },
      tag === "input" ? undefined : children,
    );
  });
  Comp.displayName = `Mock(${name})`;
  return Comp;
}

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "__esModule") return true;
      return element(prop);
    },
  },
);
