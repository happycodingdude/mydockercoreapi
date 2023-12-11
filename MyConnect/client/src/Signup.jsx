import axios from "axios";
import React, { useEffect, useRef } from "react";

const Signup = ({ reference }) => {
  const refName = useRef();
  const refUsername = useRef();
  const refPassword = useRef();

  const refSignup = useRef();

  const toggleSignup = () => {
    refSignup.current?.classList.add("animate-registration-show");
    setTimeout(() => {
      refSignup.current?.classList.remove("animate-registration-show");
    }, 1000);
    refSignup.current?.classList.toggle("z-20");
  };

  useEffect(() => {
    reference.refSignup.toggleSignup = toggleSignup;
  }, [toggleSignup]);

  const backToLogin = () => {
    refSignup.current.classList.add("animate-registration-hide");
    setTimeout(() => {
      refSignup.current.classList.remove("animate-registration-hide");
    }, 1000);
    refSignup.current.classList.toggle("z-20");
    reference.toggleLogin();
  };

  const handleSignup = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Name: refName.current.value,
      Username: refUsername.current.value,
      Password: refPassword.current.value,
    });
    axios
      .post("api/contacts", body, { headers: headers })
      .then((res) => {
        if (res.status === 200) {
          setTimeout(() => {
            backToLogin();
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div
        ref={refSignup}
        className="absolute bottom-0 top-0 m-auto my-auto flex h-[clamp(40rem,80%,50rem)] w-[clamp(30rem,50%,40rem)] flex-col
   rounded-[1rem] bg-white
  px-[4rem] py-[2rem] duration-[1s]
  [&>*:not(:first-child)]:mt-[2rem]"
      >
        <span className="text-center text-3xl font-bold uppercase">signup</span>

        <div className="flex flex-col gap-[1rem]">
          <span className="">Name</span>
          <input
            className="rounded-[.5rem] border-[.1rem] border-gray-400 focus:outline-none"
            ref={refName}
            type="text"
            placeholder="Type your name"
          />
          <span className="">Usename</span>
          <input
            className="rounded-[.5rem] border-[.1rem] border-gray-400 focus:outline-none"
            type="text"
            ref={refUsername}
            placeholder="Type your username"
          />
          <span className="">Password</span>
          <input
            className="rounded-[.5rem] border-[.1rem] border-gray-400 focus:outline-none"
            type="password"
            ref={refPassword}
            placeholder="Type your password"
          />
        </div>

        <button
          className="w-[50%] self-center rounded-[1rem] border-[.2rem] border-gray-400 uppercase"
          onClick={handleSignup}
        >
          sign up
        </button>

        <div
          className="cursor-pointer self-center text-blue-500"
          onClick={backToLogin}
        >
          Back to login
        </div>
      </div>
    </>
  );
};

export default Signup;