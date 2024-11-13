// import { Tooltip } from "antd";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import React, { useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import ListFriend from "./ListFriend";

const AddFriend = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* <div
        onClick={() => setOpen(true)}
        className="fa fa-user-plus base-icon-lg"
      ></div> */}
      <PersonAddAltOutlinedIcon
        fontSize="large"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      />
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
