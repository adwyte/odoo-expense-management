"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> | undefined
>(undefined);

type BaseProps = VariantProps<typeof toggleVariants> & {
  className?: string;
  children?: React.ReactNode;
};

// 🧩 Function overloads to satisfy Radix's strict typing
function ToggleGroup(
  props: Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
    "type"
  > &
    BaseProps & { type: "single" },
  ref: React.Ref<HTMLDivElement>
): React.ReactElement | null;
function ToggleGroup(
  props: Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
    "type"
  > &
    BaseProps & { type: "multiple" },
  ref: React.Ref<HTMLDivElement>
): React.ReactElement | null;

// ✅ Implementation
function ToggleGroup(
  { className, variant, size, children, type, ...props }: any,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

const ForwardedToggleGroup = React.forwardRef(ToggleGroup);
ForwardedToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {
  className?: string;
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, variant, size, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context?.variant || variant,
          size: context?.size || size,
        }),
        "rounded-none border-l-0 first:rounded-l-md last:rounded-r-md first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ForwardedToggleGroup as ToggleGroup, ToggleGroupItem };
