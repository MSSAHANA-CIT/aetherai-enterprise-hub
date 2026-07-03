import { forwardRef, type HTMLAttributes } from "react";
import { Card as DSCard } from "../../design/components/Card";
import type { CardProps as DSCardProps } from "../../design/components/Card";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", glow, className, children, ...props }, ref) => {
    const dsVariant: DSCardProps["variant"] =
      variant === "gradient" ? "gradient" : variant === "glass" ? "glass" : "default";

    return (
      <DSCard ref={ref} variant={dsVariant} glow={glow} className={className} {...props}>
        {children}
      </DSCard>
    );
  }
);

Card.displayName = "Card";

export default Card;
