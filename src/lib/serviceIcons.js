import {
  Heart,
  Shield,
  Dumbbell,
  RotateCcw,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Users,
  Leaf,
  MessageSquare,
} from "lucide-react";

export const SERVICE_ICONS = {
  Heart,
  Shield,
  Dumbbell,
  RotateCcw,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Users,
  Leaf,
  MessageSquare,
};

export const getServiceIcon = (name) => SERVICE_ICONS[name] ?? MessageSquare;
