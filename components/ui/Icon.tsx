import type { LucideProps } from "lucide-react";
import { getIcon } from "@/lib/icons";

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Component = getIcon(name);
  // Icons are stateless SVG wrappers looked up by a string key from the DB —
  // resolving which one to render is the entire point of this component.
  // eslint-disable-next-line react-hooks/static-components
  return <Component {...props} />;
}
