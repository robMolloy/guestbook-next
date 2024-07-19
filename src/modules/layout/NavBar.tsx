import Link from "next/link";
import React from "react";

export type TNavbarProps = {
  OpenDrawerWrapper?: React.FC<{ children: React.ReactNode }>;
  children: React.ReactNode;
};

export const NavBar = (p: TNavbarProps) => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            guestbook
          </Link>
        </div>
        <div className="flex items-center">
          <div>{p.children}</div>
        </div>
      </div>
    </div>
  );
};
