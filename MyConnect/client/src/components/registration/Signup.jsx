import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";

const Signup = ({ reference }) => {
  const refSignupContainer = useRef();
  const refSignup = useRef();

  const toggleSignup = () => {
    refSignupContainer.current?.classList.toggle("opacity-0");
    refSignup.current?.classList.toggle("translate-x-[150%]");
    reset();
  };

  const toggleLogin = () => {
    refSignupContainer.current?.classList.toggle("opacity-0");
    refSignup.current?.classList.toggle("translate-x-[150%]");
  };

  useEffect(() => {
    reference.refSignup.toggleSignup = toggleSignup;
    reference.refSignup.toggleLogin = toggleLogin;
  }, [toggleSignup]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleSignup = () => {
    if (username === "" || password === "") return;
    if (password.length < 6) {
      setErrorPassword("Password min characters is 6");
      return;
    }
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Name: name,
      Username: username,
      Password: password,
    });
    axios
      .post("api/users/signup", body, { headers: headers })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setTimeout(() => {
          reference.toggleLogin()();
        }, 100);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error === "UserExists") {
          setErrorUsername("User exists");
        }
      });
  };

  const reset = () => {
    setName("");
    setUsername("");
    setPassword("");
    setErrorUsername("");
    setErrorPassword("");
  };

  return (
    <div
      ref={refSignupContainer}
      className="absolute left-0 flex h-full w-[40%] justify-center overflow-hidden bg-white opacity-0 transition-all duration-500"
    >
      <div
        ref={refSignup}
        className="m-auto flex h-[70%] w-[70%] translate-x-[150%] flex-col gap-[15%] bg-white transition-all duration-500"
      >
        <p className="text-5xl text-gray-600">Create account</p>

        <div className="flex flex-col">
          <div className="flex flex-col gap-[3rem] text-gray-600">
            <CustomInput
              type="text"
              label="Name"
              value={name}
              onChange={setName}
            ></CustomInput>
            <CustomInput
              type="text"
              label="Username"
              value={username}
              error={errorUsername}
              onChange={(text) => {
                setUsername(text);
                if (text === "") setErrorUsername("");
              }}
            ></CustomInput>
            <CustomInput
              type="password"
              label="Password"
              value={password}
              error={errorPassword}
              onChange={(text) => {
                setPassword(text);
                if (text === "") setErrorPassword("");
              }}
            ></CustomInput>
          </div>

          <CustomButton
            title="Sign up"
            className="mt-[4rem]"
            onClick={handleSignup}
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
