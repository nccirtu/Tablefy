import { usePage } from "@inertiajs/react";
import {
  type LucideIcon,
  Bell,
  BookOpen,
  Box,
  Briefcase,
  Building2,
  BarChart,
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
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  User,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

/** The raw nav payload shared by the PHP package as `props.tablefy.navigation`. */
export interface TablefyNavPayloadItem {
  label: string;
  href: string;
  icon: string | null;
  group: string | null;
  badge: string | null;
}

/** A nav item shaped for the host's `NavItem` (icon resolved to a component). */
export interface TablefyNavItem {
  title: string;
  href: string;
  icon: LucideIcon | null;
  badge?: string | null;
  group?: string | null;
}

// Curated map of common navigation icons (keeps the bundle small — only these
// are pulled in). Pass `resolveIcon` to useTablefyNav() to support more.
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
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[-_\s]/g, "");
}

function defaultResolveIcon(name: string | null): LucideIcon | null {
  if (!name) return null;
  return ICONS[normalize(name)] ?? null;
}

interface UseNavOptions {
  /** Provide your own name → icon resolver (e.g. for icons not in the curated map). */
  resolveIcon?: (name: string) => LucideIcon | null;
}

function readPayload(): TablefyNavPayloadItem[] {
  const page = usePage();
  const props = page.props as { tablefy?: { navigation?: TablefyNavPayloadItem[] } };
  return props?.tablefy?.navigation ?? [];
}

/**
 * The resource navigation, shaped to drop straight into the host's `NavItem[]`.
 * Spread it into your sidebar's items:
 *
 *   const items = [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }, ...useTablefyNav()];
 */
export function useTablefyNav(options: UseNavOptions = {}): TablefyNavItem[] {
  const resolve = options.resolveIcon
    ? (name: string | null) => (name ? options.resolveIcon!(name) : null)
    : defaultResolveIcon;

  return readPayload().map((item) => ({
    title: item.label,
    href: item.href,
    icon: resolve(item.icon),
    badge: item.badge,
    group: item.group,
  }));
}

/** Same items, grouped by their `group` (for a Filament-style grouped sidebar). */
export function useTablefyNavGroups(
  options: UseNavOptions = {},
): { group: string | null; items: TablefyNavItem[] }[] {
  const items = useTablefyNav(options);
  const groups: { group: string | null; items: TablefyNavItem[] }[] = [];

  for (const item of items) {
    const key = item.group ?? null;
    let bucket = groups.find((g) => g.group === key);
    if (!bucket) {
      bucket = { group: key, items: [] };
      groups.push(bucket);
    }
    bucket.items.push(item);
  }

  return groups;
}
