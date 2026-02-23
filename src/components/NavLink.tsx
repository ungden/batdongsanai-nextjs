"use client";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavLinkProps = Omit<LinkProps, "className" | "href"> & {
  className?: string | ((props: { isActive: boolean }) => string);
  children?: React.ReactNode;
  to?: string;
  href?: string | object;
};

export function NavLink({ className, children, to, href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const actualHref = (href || to || "") as string;
  // A simple isActive logic
  const isActive = pathname === actualHref || (actualHref !== "/" && pathname.startsWith(actualHref));

  const computedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={actualHref} className={computedClassName} {...props}>
      {children}
    </Link>
  );
}