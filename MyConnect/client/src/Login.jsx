import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../src/hook/useAuth";
import Signup from "./Signup";
import CustomInput from "./components/common/CustomInput";

const Login = () => {
  console.log("Login calling");
  const navigate = useNavigate();
  const auth = useAuth();

  const refUsername = useRef();
  const refPassword = useRef();

  const [isLogin, setIsLogin] = useState(false);
  useLayoutEffect(() => {
    if (auth.id) {
      setIsLogin(true);
      navigate(-1, { replace: true });
    }
  }, []);

  const refLogin = useRef();
  useEffect(() => {
    // refUsername.current?.focus();
  }, []);

  const refUsernameError = useRef();
  const [usernameErr, setUsernameErr] = useState("");
  const refPasswordError = useRef();
  const [passwordErr, setPasswordErr] = useState("");

  const [userName, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const [errorUsername, setErrorUsername] = useState();
  const [errorPassword, setErrorPassword] = useState();

  const refPhUsername = useRef();
  const refPhPassword = useRef();
  const refBorderUsername = useRef();
  const refBorderPassword = useRef();

  const handleLogin = () => {
    if (userName === "" && password === "") return;

    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Username: userName,
      Password: password,
    });
    axios
      .post("api/users/login", body, { headers: headers })
      .then((res) => {
        if (res.status === 200) {
          auth.login(res.data.data.Token);
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error === "WrongPassword") {
          setErrorPassword("Wrong password");
        } else if (err.response.data.error === "NotFound") {
          setErrorUsername("User not found");
        }
      });
  };

  const toggleError = (error, action, ref) => {
    action(error);
    if (error === "") {
      ref.current.classList.remove("scale-x-100");
      ref.current.classList.add("scale-x-0");
    } else {
      ref.current.classList.remove("scale-x-0");
      ref.current.classList.add("scale-x-100");
    }
  };

  const handleInputChange = () => {
    const username = refUsername.current.value;
    const password = refPassword.current.value;
    if (username === "" && password === "") {
      toggleError("", setUsernameErr, refUsernameError);
      toggleError("", setPasswordErr, refPasswordError);
    }
  };

  const handleFocus = (e, refPH, refBorder, focus) => {
    if (e.target.value !== "") return;
    if (focus === true) {
      e.target.classList.add("input-focus");
      refPH.current.classList.add("input-focus-placeholder");
      refBorder.current.classList.add("input-focus-border");
    } else {
      e.target.classList.remove("input-focus");
      refPH.current.classList.remove("input-focus-placeholder");
      refBorder.current.classList.remove("input-focus-border");
    }
  };

  const refSignup = useRef();
  const toggleSignup = () => {
    refLogin.current.classList.remove("animate-registration-show");
    refLogin.current.classList.add("animate-registration-hide");
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    refLogin.current.classList.remove("animate-registration-hide");
    refLogin.current.classList.add("animate-registration-show");
  };

  return (
    <>
      {!isLogin ? (
        <section className="flex h-full w-full">
          <div className="grow rounded-r-[5rem] bg-red-300"></div>
          <div className="relative flex w-[40%] justify-center rounded-l-[2rem] bg-white">
            <div
              ref={refLogin}
              className="z-10 m-auto flex h-[70%] w-[70%] flex-col gap-[15%] rounded-[1rem] bg-white duration-[1s]"
            >
              <div className="flex flex-col">
                <p className="text-2xl font-semibold text-gray-600">
                  Welcome back
                </p>
                <p className="text-base text-gray-400">Have a nice day!</p>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-col gap-[3rem] text-gray-600">
                  <CustomInput
                    label="Username"
                    error={errorUsername}
                    onChange={setUsername}
                  ></CustomInput>
                  <CustomInput
                    label="Password"
                    error={errorPassword}
                    onChange={setPassword}
                  ></CustomInput>
                </div>

                <div className="mt-[1rem] cursor-pointer self-end text-gray-400 hover:text-gray-500">
                  Forgot password?
                </div>

                <div
                  className="mt-[2rem] w-full cursor-pointer self-center rounded-[.4rem] bg-gradient-to-r 
              from-purple-300 to-purple-400 bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
              font-medium text-white shadow-[0_3px_3px_-2px_#d3adfb] 
              transition-all duration-200 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#cea1fd]"
                  onClick={handleLogin}
                >
                  Sign in
                </div>

                <div className="mt-[2rem] flex items-center justify-center gap-[1rem]">
                  <p className="text-gray-400">Don't have an account?</p>
                  <div
                    onClick={toggleSignup}
                    className="cursor-pointer text-purple-400 hover:text-purple-500"
                  >
                    Sign Up
                  </div>
                </div>
              </div>
            </div>
            <Signup reference={{ refSignup, toggleLogin }}></Signup>
          </div>
        </section>
      ) : (
        ""
      )}
    </>
  );
};

export default Login;
