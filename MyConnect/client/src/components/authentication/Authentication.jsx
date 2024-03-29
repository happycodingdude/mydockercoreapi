import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/CustomHooks";
import Login from "./Login";
import Signup from "./Signup";

const Authentication = () => {
  console.log("Login calling");

  const navigate = useNavigate();
  const { id } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  useLayoutEffect(() => {
    if (id) {
      setIsLogin(true);
      navigate(-1, { replace: true });
    }
  }, []);

  const refBgContainer = useRef();
  const refBgSignUpLabelContainer = useRef();
  const refBgSignInLabelContainer = useRef();
  const refLoginContainer = useRef();
  const refLoginWrapper = useRef();
  const refLogin = useRef();
  const refSignup = useRef();

  const toggleBg = () => {
    // Animate background container
    refBgContainer.current?.classList.toggle("left-[40%]");
    refBgContainer.current?.classList.toggle("rounded-br-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tr-[20rem]");
    refBgContainer.current?.classList.toggle("rounded-r-0");
    refBgContainer.current?.classList.toggle("rounded-bl-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tl-[20rem]");
    // Animate background text
    refBgSignUpLabelContainer.current?.classList.toggle("translate-x-[-200%]");
    refBgSignUpLabelContainer.current?.classList.toggle("opacity-0");
    refBgSignInLabelContainer.current?.classList.toggle("translate-x-[-150%]");
    refBgSignInLabelContainer.current?.classList.toggle("opacity-0");
    // Animate form
    refLoginContainer.current?.classList.toggle("opacity-0");
    refLoginWrapper.current?.classList.toggle("translate-x-[-150%]");
  };

  const toggleSignup = () => {
    toggleBg();
    refLogin.toggleSignup();
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    toggleBg();
    refLogin.toggleLogin();
    refSignup.toggleLogin();
  };

  return (
    <div className="flex w-full flex-col bg-[var(--bg-color)] text-[clamp(1rem,1.2vw,2rem)]">
      {!isLogin ? (
        <section className="relative flex h-full w-full transition-all duration-500">
          <div
            ref={refBgContainer}
            className="absolute left-0 z-10 h-full w-[60%] overflow-hidden rounded-br-[10rem] rounded-tr-[20rem] 
            bg-[url('images/avatar1.jpg')] bg-[size:120%] bg-[position:center_center] bg-no-repeat transition-all duration-500
            before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0
            before:h-full before:w-full before:bg-[rgba(86,86,86,0.47)]"
          ></div>
          <Login reference={{ refLogin }} />
          <Signup reference={{ refSignup, toggleLogin }}></Signup>

          <div
            ref={refBgSignUpLabelContainer}
            className="absolute left-[10%] top-1/2 z-10 flex translate-y-[-50%] flex-col items-center gap-[2rem] text-center 
            text-[var(--text-sub-color)] transition-all duration-500"
          >
            <p className="text-7xl">Hello, friend</p>
            <div
              onClick={toggleSignup}
              className="cursor-pointer rounded-[1rem] border-[.2rem] border-[var(--sub-color)] px-[5rem] py-[.5rem] text-2xl 
              transition-all duration-500 hover:shadow-[0_3px_10px_var(--sub-color)]"
            >
              Sign up
            </div>
          </div>
          <div
            ref={refBgSignInLabelContainer}
            className="absolute right-[-30%] top-1/2 z-10 flex translate-y-[-50%] flex-col items-center gap-[2rem] text-center 
            text-[var(--text-sub-color)] opacity-0 transition-all duration-500"
          >
            <p className="text-7xl">Welcome back</p>
            <div
              onClick={toggleLogin}
              className="cursor-pointer rounded-[1rem] border-[.2rem] border-[var(--sub-color)] px-[5rem] py-[.5rem] text-2xl 
              transition-all duration-500 hover:shadow-[0_3px_10px_var(--sub-color)]"
            >
              Sign in
            </div>
          </div>
        </section>
      ) : (
        ""
      )}
    </div>
  );
};

export default Authentication;
