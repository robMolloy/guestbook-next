import { useEffect, useState } from "react";
import { NavBar, NavBarContainer, NavBarDropdown } from "./NavBar";
import { useRouter } from "next/router";
import Link from "next/link";
import { logoutFirebaseUser } from "@/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { VideoStreamControls } from "../videoStream";

export type TPageLink = {
  label: string;
  href: string;
  alwaysShow?: true;
  horizontalClassName?: string;
};

const ContainerWithSpotlightBackgroundTop = () => {
  return (
    <div className="absolute top-0 z-[-99] h-[90vh] min-w-full bg-gradient-to-tr from-base-100 via-base-100 via-75% to-primary sm:via-65%" />
  );
};

export const Layout = (p: { children: React.ReactNode }) => {
  const router = useRouter();
  const [showNavStatus, setShowNavStatus] = useState<"show" | "hide" | "inform">("show");
  const [clickHoldTimer, setClickHoldTimer] = useState<NodeJS.Timeout>();
  const eventId = router.query.eventId as string;

  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();

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
          <NavBar
            leftChildren={
              <Link href="/" className="btn text-xl hover:underline">
                guestbook
              </Link>
            }
            bottomChildren={
              safeAuthStore.status === "logged_in" && (
                <div className="breadcrumbs ml-4 p-0 text-sm">
                  <ul>
                    <li>
                      <Link className="hover:underline" href="/">
                        Home
                      </Link>
                    </li>
                    {router.pathname.startsWith(`/[eventId]`) && (
                      <li>
                        <Link className="hover:underline" href={`/${eventId}`}>
                          Manage Event
                        </Link>
                      </li>
                    )}
                    {router.pathname === `/[eventId]/capture` && (
                      <li>
                        <Link className="hover:underline" href={`/${eventId}/capture`}>
                          Capture
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )
            }
            rightChildren={
              <div className="flex flex-1 items-center justify-end gap-2">
                {safeAuthStore.status === "logged_in" &&
                  router.pathname === `/[eventId]/capture` && (
                    <NavBarDropdown label="Controls">
                      <div className="min-w-96 p-4">
                        <VideoStreamControls />
                      </div>
                    </NavBarDropdown>
                  )}
                {safeAuthStore.status === "logged_in" &&
                  router.pathname === `/[eventId]/capture` && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowNavStatus("inform")}
                    >
                      Hide Nav
                    </button>
                  )}
                {safeAuthStore.status === "logged_in" &&
                  router.pathname !== `/[eventId]/capture` && (
                    <Link
                      className="btn btn-sm hover:underline"
                      href="/"
                      onClick={() => logoutFirebaseUser()}
                    >
                      Log Out
                    </Link>
                  )}
              </div>
            }
          />
        </NavBarContainer>
      )}
      {showNavStatus !== "show" && (
        <div
          className="absolute left-0 right-0"
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
      {p.children}
      <ContainerWithSpotlightBackgroundTop></ContainerWithSpotlightBackgroundTop>
    </>
  );
};
