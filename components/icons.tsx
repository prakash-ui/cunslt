import {
  Linkedin,
  Sun as SunIcon,
  Moon as MoonIcon,
  Activity,
  AlertCircle,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart,
  Bell,
  Bluetooth,
  BluetoothOff,
  Bold,
  Bookmark,
  BookmarkPlus,
  Briefcase,
  Calendar, // Added Calendar
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clipboard,
  Clock,
  Cloud,
  CloudOff,
  Code,
  Coffee,
  Command,
  Copy,
  CreditCard as PaymentCard,
  Crop,
  Database,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  File,
  FileCheck,
  FileText,
  Filter,
  Flag,
  Folder,
  FolderPlus,
  Gift,
  Globe,
  Grid,
  Heading1,
  Heading2,
  Heading3,
  Heart,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Info,
  Instagram, // Added Instagram
  Italic,
  Laptop,
  Layers,
  Lightbulb as LightbulbIcon,
  LineChart,
  Link,
  List,
  ListOrdered,
  Loader2,
  Lock,
  LogOut,
  Mail, // Alternative for Send
  MapPin,
  Maximize,
  Menu,
  MessageSquare,
  Mic,
  Minimize,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Phone,
  PhoneOff,
  PieChart,
  Pizza,
  Plus,
  Power,
  PowerOff,
  Printer,
  Quote,
  RefreshCw,
  Redo,
  RotateCcw,
  RotateCw,
  Save,
  Scissors,
  Search,
  Send, // Added Send
  Server,
  Settings,
  Share,
  Shield,
  ShoppingCart,
  Sliders,
  Smile,
  Star, // Added Star
  StarHalf, // Added StarHalf
  SunMedium,
  Tag,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Trash2,
  Twitter,
  Underline,
  Undo,
  Unlock,
  Upload,
  User,
  Users, // Added Users
  Video,
  VideoOff,
  Wallet,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// For any icons that still can't be found, create custom fallbacks
const FallbackIcon = ({ ...props }: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export type Icon = LucideIcon;

export const Icons = {
  laptop: Laptop,
  linkedin: Linkedin,
  sun: SunIcon,
  moon: MoonIcon,
  // Social Media Icons
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  github: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      />
    </svg>
  ),

  // UI Icons
  logo: Command,
  close: X,
  spinner: Loader2,
  check: Check,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  users: Users || FallbackIcon, // Fallback if Users not available
  menu: Menu,
  settings: Settings,
  search: Search,
  filter: Filter,
  externalLink: ExternalLink,
  link: Link,
  copy: Copy,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  eye: Eye,
  eyeOff: EyeOff,
  lock: Lock,
  unlock: Unlock,
  info: Info,
  alertCircle: AlertCircle,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  empty: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.5 6.5h-11" />
      <path d="M14.5 10.5h-5" />
      <path d="M5.5 14.5h13" />
      <path d="M5.5 18.5h13" />
    </svg>
  ),

  // Navigation Icons
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  home: Home,
  mapPin: MapPin,
  globe: Globe,

  // Content Icons
  post: FileText,
  page: File,
  media: Image,
  video: Video,
  camera: Camera,
  mic: Mic,
  phone: Phone,
  phoneOff: PhoneOff,
  videoOff: VideoOff,
  message: MessageSquare,
  send: Send || Mail || FallbackIcon, // Fallback chain
  paperclip: Paperclip,
  smile: Smile,
  quote: Quote,
  code: Code,
  terminal: Terminal,

  // Document Icons
  fileCheck: FileCheck,
  clipboard: Clipboard,
  edit: Edit,
  save: Save,
  printer: Printer,
  archive: Archive,
  trash: Trash,
  trash2: Trash2,

  // Status Icons
  star: Star || FallbackIcon,
  starHalf: StarHalf || FallbackIcon,
  award: Award,
  heart: Heart,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  flag: Flag,

  // Time Icons
  calendar: Calendar || FallbackIcon,
  clock: Clock,
};