"use client";

import React from "react";
import { usePathname } from "next/navigation";

type Props = { children: React.ReactNode };

export function RouteTransition({ children }: Props) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className="motion-reduce:animate-none animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    >
      {children}
    </div>
  );
}

