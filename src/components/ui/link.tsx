
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  className?: string;
  underline?: boolean;
  gradient?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, children, underline = true, gradient = false, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "text-primary transition-all hover:text-primary/80 relative group",
          underline && "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary/70 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left",
          gradient && "gradient-text font-medium",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = "Link";

export { Link };
