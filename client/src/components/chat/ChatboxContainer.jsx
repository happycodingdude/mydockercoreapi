import React, { useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import {
  useAttachment,
  useConversation,
  useMessage,
} from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import ChatboxHeader from "./ChatboxHeader";
import Information from "./Information";

const ChatboxContainer = () => {
  console.log("ChatboxContainer calling");
  const {
    data: messages,
    isLoading: isLoadingMessage,
    isRefetching: isRefetchingMessage,
  } = useMessage();
  const {
    isLoading: isLoadingAttachment,
    isRefetching: isRefetchingAttachment,
  } = useAttachment();
  const { data: conversations } = useConversation();

  const [toggle, setToggle] = useState("");
  const { loading, setLoading } = useLoading();

  const isLoading = isLoadingMessage || isLoadingAttachment;
  const isRefetching = isRefetchingMessage || isRefetchingAttachment;

  useEffect(() => {
    if (!isLoading && !isRefetching) {
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [isLoading, isRefetching]);

  return (
    <div className="relative grow">
      {loading ? (
        <LocalLoading className="!z-[11]" />
      ) : messages?.messages || conversations?.createGroupChat ? (
        <div className="flex h-full w-full flex-col border-l-[.1rem] border-l-[var(--border-color)]">
          <ChatboxHeader
            toggle={toggle}
            setToggle={setToggle}
            messages={messages}
          />
          <div className="flex h-0 w-full grow">
            <Chatbox isToggle={toggle !== ""} />
            <div
              className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem] 
            ${toggle !== "" ? "opacity-100" : "opacity-0"}`}
            >
              <Information
                show={toggle === "information"}
                toggle={() => setToggle("attachment")}
                onLoaded={() => setLoading(false)}
              />
              <Attachment
                show={toggle === "attachment"}
                toggle={() => setToggle("information")}
              />
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ChatboxContainer;
