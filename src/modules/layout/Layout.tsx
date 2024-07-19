import { useEffect, useState } from "react";
import { NavBar } from "./NavBar";

export type TPageLink = {
  label: string;
  href: string;
  alwaysShow?: true;
  horizontalClassName?: string;
};

const NavBarContainer = (p: { children: React.ReactNode }) => {
  return (
    <div className="sticky top-0 z-[10]">
      <div className="navbar w-full border-b bg-base-300">{p.children}</div>
    </div>
  );
};

const ContainerWithSpotlightBackgroundTop = (p: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-[50vh]">
      <div className="absolute top-0 z-[-1] min-h-[90vh] min-w-full bg-gradient-to-tr from-base-100 via-base-100 via-75% to-primary sm:via-65%"></div>
      {p.children}
    </div>
  );
};

export const Layout = (p: { children: React.ReactNode }) => {
  const [showNavStatus, setShowNavStatus] = useState<"show" | "hide" | "inform">("show");
  const [clickHoldTimer, setClickHoldTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (showNavStatus === "inform") {
      const timer = setTimeout(() => {
        setShowNavStatus((x) => (x === "inform" ? "hide" : x));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNavStatus]);

  return (
    <>
      {showNavStatus === "show" && (
        <NavBarContainer>
          <NavBar>
            <div className="flex gap-4">
              <button className="btn btn-outline" onClick={() => setShowNavStatus("inform")}>
                Hide Nav
              </button>
            </div>
          </NavBar>
        </NavBarContainer>
      )}
      {showNavStatus !== "show" && (
        <div
          className="absolute left-0 right-0 z-50"
          onMouseDown={() => setClickHoldTimer(setTimeout(() => setShowNavStatus("show"), 2000))}
          onMouseUp={() => clearTimeout(clickHoldTimer)}
        >
          {showNavStatus === "inform" && (
            <div className="border text-center">
              click and hold here for 3 seconds to show nav bar
            </div>
          )}
          {showNavStatus === "hide" && <br />}
        </div>
      )}
      <ContainerWithSpotlightBackgroundTop>{p.children}</ContainerWithSpotlightBackgroundTop>
    </>
  );
};
