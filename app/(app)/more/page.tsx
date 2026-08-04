import Link from "next/link";
import { Users, BookOpen, Wrench, Plane, ShieldCheck, Briefcase, GraduationCap, Compass, UtensilsCrossed, ShoppingCart, Bell } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  { href: "/work", label: "Work", subtitle: "Update checklists, goals", icon: Briefcase },
  { href: "/university", label: "University", subtitle: "Study material, exams, report card", icon: GraduationCap },
  { href: "/learning", label: "Learning & Growth", subtitle: "Reading list, skill practice", icon: BookOpen },
  { href: "/social", label: "Social & Relationships", subtitle: "People, shared goals, occasions", icon: Users },
  { href: "/environment", label: "Home & Environment", subtitle: "Maintenance, chores", icon: Wrench },
  { href: "/personal", label: "Personal Admin", subtitle: "Documents, passwords, checklist", icon: ShieldCheck },
  { href: "/travel", label: "Travel & Experiences", subtitle: "Trips, packing, bucket list", icon: Plane },
  { href: "/reminders", label: "Reminders", subtitle: "Priority-flagged notes, pinnable to Home", icon: Bell },
  { href: "/wishlist", label: "Things I Need", subtitle: "What to buy, by category", icon: ShoppingCart },
  { href: "/activities", label: "Activities to do", subtitle: "Ideas with cost estimates and locations", icon: Compass },
  { href: "/restaurant-savers", label: "Restaurant Savers", subtitle: "Daily food specials, every day", icon: UtensilsCrossed },
];

export default function MorePage() {
  return (
    <div>
      <PageHeading title="More" subtitle="Everything else, all in one place." />
      <ul className="space-y-4">
        {SECTIONS.map(({ href, label, subtitle, icon: Icon }) => (
          <li key={href}>
            <Link href={href}>
              <Card className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-charcoal">{label}</p>
                  <p className="truncate text-xs text-charcoal-soft">{subtitle}</p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
