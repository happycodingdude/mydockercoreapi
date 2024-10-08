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
          className="fa fa-user-plus flex cursor-pointer items-center justify-center text-sm font-normal"
        ></div>
      </Tooltip>
      <BackgroundPortal
        open={open}
        className="laptop:!w-[40rem] desktop:!w-[35%]"
        title="Add friend"
        onClose={() => setOpen(false)}
      >
        <ListFriend onClose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
