import React, { useState } from "react";
import { useMessage } from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";

const ChatboxContainer = (props) => {
  console.log("ChatboxContainer calling");
  // const { removeInListChat, refChatbox } = props;

  // const [selected] = useSelected();
  const { data, isLoading, isRefetching } = useMessage();
  const [toggle, setToggle] = useState("information");

  // useEffect(() => {
  //   console.log(`selected => ${selected}`);
  // }, [selected]);

  return (
    <div className="relative flex grow">
      {isLoading || isRefetching ? <LocalLoading loading /> : ""}
      {data?.messages ? (
        <>
          <Chatbox
          // toggleInformation={toggleInformationContainer}
          />
          <div className="relative origin-right overflow-hidden text-base laptop:w-[22rem] laptop-lg:w-[25rem]">
            <Information
              // refAttachment={refAttachment}
              // refInformationExposed={refInformation}
              // removeInListChat={removeInListChat}
              show={toggle === "information"}
              toggle={() => setToggle("attachment")}
            />
            <Attachment
              // refInformation={refInformation}
              // refAttachmentExposed={refAttachment}
              show={toggle === "attachment"}
              toggle={() => setToggle("information")}
            />
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ChatboxContainer;
