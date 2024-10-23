// import { Tooltip } from "antd";
import { Tooltip } from "antd";
import React, { useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import ListFriend from "./ListFriend";

const AddFriend = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip title="Find friends">
        <div
          onClick={() => setOpen(true)}
          className="fa fa-user-plus flex items-center justify-center text-sm font-normal"
        ></div>
      </Tooltip>
      <BackgroundPortal
        show={open}
        className="laptop:!w-[40rem] desktop:!w-[35%]"
        title="Connect friend"
        onClose={() => setOpen(false)}
      >
        <ListFriend onClose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
