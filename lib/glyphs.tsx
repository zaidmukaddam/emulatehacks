import {
  type LucideIcon,
  type LucideProps,
  Anchor,
  Binary,
  BookOpen,
  Braces,
  Building2,
  Component,
  Cpu,
  Database,
  Factory,
  FileWarning,
  FolderInput,
  Fuel,
  GitMerge,
  Globe,
  Hash,
  HeartCrack,
  KeyRound,
  KeySquare,
  Layers2,
  Lock,
  Mail,
  MailSearch,
  MailWarning,
  PackageOpen,
  PackageX,
  Phone,
  Radio,
  Satellite,
  ScrollText,
  ServerCrash,
  Share2,
  ShieldAlert,
  ShieldOff,
  Skull,
  Sprout,
  Terminal,
  Worm,
  Workflow,
  Zap,
} from "lucide-react";
import type { Category, Scenario } from "./types";

const SCENARIO_GLYPH: Record<string, LucideIcon> = {
  "3cx-supply-chain": Phone,
  "canvas-free-for-teacher": BookOpen,
  "citrix-bleed-token": ShieldOff,
  "ci-token-leak": Workflow,
  "classic-password-file": BookOpen,
  "cih-chernobyl": Skull,
  "code-red-iis": ServerCrash,
  "colonial-pipeline-ransom": Fuel,
  "conficker-ms08-067": Share2,
  "copy-fail-kernel": Cpu,
  "equifax-struts-cve": Building2,
  "exposed-env-file": FileWarning,
  "f5-bigip-tmui": Layers2,
  "heartbleed-openssl": HeartCrack,
  "http2-rapid-reset": Zap,
  "iloveyou-macro": Mail,
  "log4shell-jndi": Binary,
  "melissa-macro": ScrollText,
  "mirai-iot-dyn": Radio,
  "morris-internet-worm": Worm,
  "moveit-mft-clop": FolderInput,
  "mydoom-smtp": MailWarning,
  "npm-qix-phish": PackageX,
  "polyfill-cdn-sale": Globe,
  "proxylogon-exchange": MailSearch,
  "react2shell-rsc": Component,
  "regresshion-openssh": KeySquare,
  "shellshock-bash": Braces,
  "spring4shell-core": Sprout,
  "sql-slammer-worm": Database,
  "stuxnet-plc": Factory,
  "solarwinds-sunburst": Satellite,
  "suspicious-ssh-login": ShieldAlert,
  "terrapin-ssh-handshake": Anchor,
  "tj-actions-tag-drift": GitMerge,
  "wannacry-eternalblue": Lock,
  "xz-backdoor": PackageOpen,
};

const CATEGORY_GLYPH_MAP: Record<Category, LucideIcon> = {
  "modern-cloud": KeyRound,
  "classic-history": BookOpen,
  "incident-response": ShieldAlert,
  "ctf-puzzle": Hash,
};

export const CATEGORY_LABEL: Record<Category, string> = {
  "modern-cloud": "Modern / Cloud",
  "classic-history": "Classic",
  "incident-response": "Defensive / IR",
  "ctf-puzzle": "Puzzle",
};

export const DIFFICULTY_LABEL: Record<Scenario["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function ScenarioIcon({
  slug,
  ...props
}: { slug: string } & LucideProps) {
  const Icon = SCENARIO_GLYPH[slug] ?? Terminal;
  return <Icon aria-hidden {...props} />;
}

export function CategoryIcon({
  category,
  ...props
}: { category: Category } & LucideProps) {
  const Icon = CATEGORY_GLYPH_MAP[category];
  return <Icon aria-hidden {...props} />;
}
