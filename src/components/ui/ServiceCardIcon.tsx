import type { LucideIcon } from 'lucide-react';
import {
  Stethoscope,
  Syringe,
  Scissors,
  Home,
  Pill,
  FlaskConical,
  BedDouble,
  Microscope,
  ScanLine,
  Cross,
  Bone,
  Activity,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  consultation: Stethoscope,
  surgery: Cross,
  vaccination: Syringe,
  radiography: ScanLine,
  grooming: Scissors,
  petHotel: Home,
  pharmacy: Pill,
  laboratory: FlaskConical,
  confinement: BedDouble,
  microscopy: Microscope,
  ultrasonography: Activity,
};

export type ServiceIconName = keyof typeof iconMap;

interface ServiceCardIconProps {
  name: ServiceIconName;
  className?: string;
  size?: number;
}

export function ServiceCardIcon({ name, className, size = 64 }: ServiceCardIconProps) {
  const Icon = iconMap[name] ?? Stethoscope;
  return <Icon className={className} size={size} strokeWidth={1.5} aria-hidden />;
}
