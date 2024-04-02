import React, { useState } from "react";
import { useAuth } from "../../hook/CustomHooks";
import ChatIcon from "../chat/ChatIcon";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  const { showChat, showProfile } = props;

  const { user } = useAuth();

  const [tabFocus, setTabFocus] = useState("chat");

  // const { reFetch } = useFetchProfile();
  // const [open, setOpen] = useState(false);

  // const openProfile = () => {
  //   reFetch();
  //   setOpen(true);
  // };

  // Event listener
  // const closeProfile = useCallback((e) => {
  //   if (
  //     // e.keyCode === 27 ||
  //     Array.from(e.target.classList).some(
  //       (item) => item === "profile-container",
  //     )
  //   )
  //     setOpen(false);
  // }, []);
  // useEventListener("keydown", closeProfile);
  // useEventListener("click", closeProfile);

  return (
    <section className="w-full max-w-[7%] shrink-0 bg-[var(--bg-color)]">
      {user ? (
        <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
          <div className="flex w-full flex-col items-center gap-[3rem]">
            <ImageWithLightBoxWithBorderAndShadow
              src={user?.Avatar ?? ""}
              className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
              // onClick={openProfile}
              slides={[
                {
                  src: user?.Avatar ?? "",
                },
              ]}
            />
            <ChatIcon
              show={() => {
                setTabFocus("chat");
                showChat();
              }}
              focus={tabFocus === "chat"}
            />
            <ProfileIcon
              show={() => {
                setTabFocus("profile");
                showProfile();
              }}
              focus={tabFocus === "profile"}
            />
          </div>
          {/* <BackgroundPortal
            open={open}
            title="Edit Profile"
            onClose={() => setOpen(false)}
          >
            <Profile onClose={() => setOpen(false)} />
          </BackgroundPortal> */}
          <div className="flex flex-col gap-[3rem]">
            <Notification />
            <div
              // onClick={openProfile}
              className="fa fa-cog cursor-pointer text-xl font-thin"
            ></div>
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default SideBar;
