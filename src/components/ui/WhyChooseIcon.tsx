import type { LucideIcon } from 'lucide-react';
import { Heart, Stethoscope, Sparkles, Building2 } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  stethoscope: Stethoscope,
  sparkles: Sparkles,
  building: Building2,
};

export type WhyChooseIconName = keyof typeof iconMap;

interface WhyChooseIconProps {
  name: WhyChooseIconName;
  className?: string;
  size?: number;
}

export function WhyChooseIcon({ name, className, size = 50 }: WhyChooseIconProps) {
  const Icon = iconMap[name] ?? Heart;
  return <Icon className={className} size={size} strokeWidth={2} aria-hidden />;
}
