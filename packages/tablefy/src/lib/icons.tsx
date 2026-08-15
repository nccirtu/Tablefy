import React from "react";
import {
  type LucideIcon,
  BarChart,
  Bell,
  BookOpen,
  Box,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  Circle,
  ClipboardList,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  File,
  FileText,
  Folder,
  Globe,
  Heart,
  Home,
  Image,
  Key,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Newspaper,
  Package,
  Pencil,
  CheckCircle2,
  Plus,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  Truck,
  User,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

// Curated map of common icons — keeps the bundle small. Used for string icon
// names in navigation and page header actions.
const ICONS: Record<string, LucideIcon> = {
  users: Users,
  user: User,
  settings: Settings,
  home: Home,
  dashboard: LayoutDashboard,
  layoutgrid: LayoutGrid,
  layoutdashboard: LayoutDashboard,
  list: List,
  box: Box,
  package: Package,
  tag: Tag,
  folder: Folder,
  file: File,
  filetext: FileText,
  calendar: Calendar,
  clock: Clock,
  cart: ShoppingCart,
  shoppingcart: ShoppingCart,
  shoppingbag: ShoppingBag,
  bag: ShoppingBag,
  creditcard: CreditCard,
  dollar: DollarSign,
  wallet: Wallet,
  receipt: Receipt,
  chart: BarChart,
  bell: Bell,
  mail: Mail,
  message: MessageSquare,
  star: Star,
  heart: Heart,
  building: Building2,
  briefcase: Briefcase,
  truck: Truck,
  mappin: MapPin,
  globe: Globe,
  image: Image,
  database: Database,
  shield: Shield,
  key: Key,
  lock: Lock,
  wrench: Wrench,
  layers: Layers,
  check: CheckSquare,
  clipboard: ClipboardList,
  book: BookOpen,
  news: Newspaper,
  circle: Circle,
  plus: Plus,
  add: Plus,
  trash: Trash2,
  delete: Trash2,
  pencil: Pencil,
  edit: Pencil,
  checkcircle: CheckCircle2,
  checkcircle2: CheckCircle2,
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[-_\s]/g, "");
}

export function resolveLucideIcon(
  name: string | null | undefined,
): LucideIcon | null {
  if (!name) return null;
  return ICONS[normalize(name)] ?? null;
}

export type { LucideIcon };

/**
 * Renders an icon by name — the same names the actions accept.
 *
 * Actions take `icon` as a **name** (`"pencil"`) or as a node (`<Pencil />`).
 * This is what resolves the first form, and it is exported so a custom cell can
 * use the same vocabulary instead of importing lucide itself.
 */
export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Resolved = resolveLucideIcon(name);

  return Resolved ? <Resolved className={className} /> : null;
}

/** An action's icon, whether it was given as a name or as a node. */
export function renderActionIcon(
  icon: unknown,
  className = "size-4",
): React.ReactNode {
  if (typeof icon === "string") {
    return <Icon name={icon} className={className} />;
  }

  return (icon as React.ReactNode) ?? null;
}
