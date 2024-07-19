import React from "react";

export type TNavbarProps = {
  OpenDrawerWrapper?: React.FC<{ children: React.ReactNode }>;
  leftChildren?: React.ReactNode;
  centerChildren?: React.ReactNode;
  rightChildren?: React.ReactNode;
  bottomChildren?: React.ReactNode;
};

export const NavBar = (p: TNavbarProps) => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="flex flex-1">{p.leftChildren}</div>
        <div className="">
          <div>{p.centerChildren}</div>
        </div>
        <div className="flex flex-1">{p.rightChildren}</div>
      </div>
      <div className="flex w-full">
        <div className="flex flex-1">{p.bottomChildren}</div>
      </div>
    </div>
  );
};
