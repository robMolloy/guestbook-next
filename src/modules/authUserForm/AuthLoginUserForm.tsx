import { loginFirebaseUser } from "@/utils";
import React, { useState } from "react";

type TRule = ({ validRegex: RegExp } | { invalidRegex: RegExp }) & {
  message: string;
};
type TRules = TRule[];

const createRuleMap = <T extends { [k: string]: TRules }>(p: T) => {
  return p;
};

const checkRules = (p: { rules: TRules; value: string }) => {
  const userPasswordError = p.rules.find((x) => {
    if ("validRegex" in x) return !x.validRegex.test(p.value);
    return x.invalidRegex.test(p.value);
  });
  return userPasswordError?.message ?? "";
};

const ruleMap = createRuleMap({
  password: [
    {
      validRegex: /[!@#$%^&*(),.?":{}|<>]/,
      message: "string must contain a special character",
    },
    {
      validRegex: /^.{7,}$/,
      message: "string must be longer than 8 characters",
    },
  ],
  email: [
    {
      validRegex: /[!@#$%^&*(),.?":{}|<>]/,
      message: "string must contain a special character",
    },
    {
      validRegex: /^.{7,}$/,
      message: "string must be longer than 8 characters",
    },
    {
      validRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "this does not appear to be an email",
    },
  ],
});

export type TAuthLoginUserFormProps = {
  onLoginSuccess: () => void;
  onLoginFail: () => void;
};

export const AuthLoginUserForm = (p: TAuthLoginUserFormProps) => {
  const [userEmail, setUserEmail] = useState("");
  const [userEmailErrorMessage, setUserEmailErrorMessage] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordErrorMessage, setUserPasswordErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!!isLoading) return;
    checkUserEmailValid();
    checkUserPasswordValid();
    if (!!userEmailErrorMessage || !!userPasswordErrorMessage) return;

    setIsLoading(true);

    const formData = { userEmail: userEmail, userPassword: userPassword };
    const loginResponse = await loginFirebaseUser(formData);
    if (loginResponse.success) {
      p.onLoginSuccess();
    } else {
      p.onLoginFail();
      const errorMessage = loginResponse.error.message;
      if (errorMessage) setFormErrorMessage(errorMessage);
    }
    setIsLoading(false);
  };

  const checkUserEmailValid = () => {
    const errMsg = checkRules({ rules: ruleMap.email, value: userEmail });
    setUserEmailErrorMessage(errMsg);
  };

  const checkUserPasswordValid = () => {
    const errMsg = checkRules({ rules: ruleMap.password, value: userPassword });
    setUserPasswordErrorMessage(errMsg);
  };

  return (
    <form className="w-full">
      <div>
        {formErrorMessage && (
          <div style={{ textAlign: "center" }} className="bg-error">
            {formErrorMessage}
          </div>
        )}
        <label className="form-control w-full">
          <div className="label">
            <span
              className={`label-text${
                userEmailErrorMessage ? " bg-error" : ""
              }`}
            >
              {userEmailErrorMessage || "Type your email"}
            </span>
          </div>
          <input
            type="text"
            placeholder="email"
            className={`input input-bordered input-info w-full${
              !userEmailErrorMessage || " input-error"
            }`}
            onInput={(e) => {
              setUserEmail((e.target as HTMLInputElement).value);
              checkUserEmailValid();
            }}
            value={userEmail}
          />
        </label>
      </div>
      <br />
      <div>
        <label className="form-control">
          <div className="label">
            <span
              className={`label-text${
                userPasswordErrorMessage ? " bg-error" : ""
              }`}
            >
              {userPasswordErrorMessage || "Type your password"}
            </span>
          </div>
          <input
            type="password"
            placeholder="password"
            className={`input input-bordered input-info w-full${
              !userPasswordErrorMessage || " input-error"
            }`}
            onInput={(e) => {
              setUserPassword((e.target as HTMLInputElement).value);
              checkUserPasswordValid();
            }}
            value={userPassword}
          />
        </label>
      </div>
      <br />
      <br />
      <button
        type="submit"
        className="btn btn-primary"
        onClick={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        Submit
        {!!isLoading && (
          <span className="loading loading-spinner loading-md"></span>
        )}
      </button>
    </form>
  );
};
