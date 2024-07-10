import React, { useState } from "react";
import { AuthCreateUserForm, AuthLoginUserForm } from ".";
import clsx from "clsx";

export const UserAuthCreateLoginForm = () => {
  const [mode, setMode] = useState<"login" | "create">("login");
  return (
    <div className="box card" style={{ boxShadow: "7px 7px 13px rgba(0, 0, 0, 0.5)" }}>
      <span role="tablist" className="tabs tabs-bordered">
        <a
          role="tab"
          className={`tab no-underline ${mode === "login" ? "tab-active" : ""}`}
          onClick={() => setMode("login")}
        >
          Login
        </a>
        <a
          role="tab"
          className={`tab no-underline ${clsx({ "tab-active": mode === "create" })}`}
          onClick={() => setMode("create")}
        >
          Create
        </a>
      </span>
      <div className="card-body items-center text-center">
        {mode === "login" && (
          <AuthLoginUserForm
            onLoginSuccess={() => {
              console.log("login success");
            }}
            onLoginFail={() => {
              console.log("login fail");
            }}
          />
        )}
        {mode === "create" && (
          <AuthCreateUserForm
            onCreateUserSuccess={() => {
              console.log("user created success");
            }}
            onCreateUserFail={() => {
              console.log("user created failed");
            }}
          />
        )}
      </div>
    </div>
  );
};
