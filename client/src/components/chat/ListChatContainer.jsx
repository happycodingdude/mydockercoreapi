import React from "react";
import ListChat from "./ListChat";
import ListChatHeader from "./ListChatHeader";

const ListChatContainer = () => {
  console.log("ListChatContainer calling");
  return (
    <div className="flex flex-col bg-[var(--bg-color-light)] shadow-[5px_0px_10px_-10px_var(--main-color)_inset] laptop:w-[27rem] laptop-lg:w-[30rem]">
      {/* <div className="flex w-[calc(100%/4)] min-w-[calc(100%/4)] flex-col bg-[var(--main-color-medium)]"> */}
      <ListChatHeader />
      <ListChat />
    </div>
  );
};

export default ListChatContainer;
