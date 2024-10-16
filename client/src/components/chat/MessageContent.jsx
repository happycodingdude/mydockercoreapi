import moment from "moment";
import React from "react";
import { useInfo, useMessage } from "../../hook/CustomHooks";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

const MessageContent = (props) => {
  console.log("MessageContent calling");
  const { message, pending } = props;

  const { data: info } = useInfo();
  const { data: messages } = useMessage();

  return (
    <div
      key={message.id}
      className={`flex items-end gap-[1rem] 
      ${message.contactId === info.data.id ? "flex-row-reverse" : ""}`}
    >
      {/* Sender avatar */}
      {message.contactId !== info.data.id ? (
        <div className="relative w-[3rem]">
          {messages.isGroup ? (
            <ImageWithLightBoxAndNoLazy
              src={
                messages.participants.find((q) => q.contact.id != info.data.id)
                  .contact.avatar
              }
              className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
              // onClick={() => {
              //   setUserId(message.contactId);
              //   setOpen(true);
              // }}
            />
          ) : (
            <ImageWithLightBoxAndNoLazy
              src={
                messages.participants.find((q) => q.contact.id != info.data.id)
                  .contact.avatar
              }
              className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
              slides={[
                {
                  src: messages.participants.find(
                    (q) => q.contact.id != info.data.id,
                  ).contact.avatar,
                },
              ]}
            />
          )}
        </div>
      ) : (
        ""
      )}
      <div
        className={`flex flex-col gap-[.3rem] laptop:w-[clamp(60rem,70%,80rem)] desktop:w-[clamp(40rem,70%,80rem)] 
        ${message.contactId === info.data.id ? "items-end" : "items-start"}`}
      >
        {/* Sender infor */}
        <div
          className={`flex items-center gap-[1rem] text-xs text-[var(--text-main-color-thin)]
          ${message.contactId === info.data.id ? "flex-row-reverse" : ""}`}
        >
          {message.contactId === info.data.id ? (
            ""
          ) : (
            <p className="text-[var(--main-color-thin)]">
              {
                messages.participants.find((q) => q.contact.id != info.data.id)
                  .contact.name
              }
            </p>
          )}

          <p>
            {moment(message.createdTime).format("DD/MM/YYYY") ===
            moment().format("DD/MM/YYYY")
              ? moment(message.createdTime).format("HH:mm")
              : moment(message.createdTime).format("DD/MM HH:mm")}
          </p>
        </div>
        {/* Content */}
        {message.type === "text" ? (
          <div
            //   className={`break-all rounded-[3rem] bg-gradient-radial-to-tc from-[#00AFB9]  ${pending ? "to-[var(--main-color-normal)]" : "to-[#FED9B7]"}
            // px-[1.5rem] py-[.7rem] text-[var(--text-main-color-normal)]`}
            // className={`break-all rounded-[3rem] ${pending ? "text-[var(--text-main-color-thin)]" : "text-[var(--text-main-color)]"} `}
            className={`break-all rounded-[3rem] ${pending ? "opacity-50" : ""} `}
          >
            {/* {GenerateContent(participants, message.content)} */}
            {message.content}
          </div>
        ) : (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.data.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {/* {pending
              ? message.attachments?.map((item, index) => (
                  <ImageWithLightBoxWithShadowAndNoLazy
                    src={item.mediaUrl}
                    title={item.mediaName?.split(".")[0]}
                    className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} cursor-pointer opacity-50`}
                    slides={message.attachments.map((item) => ({
                      src:
                        item.type === "image"
                          ? item.mediaUrl
                          : "images/filenotfound.svg",
                    }))}
                    index={index}
                  />
                ))
              : message.attachments?.map((item, index) => (
                  <ImageWithLightBox
                    src={item.mediaUrl}
                    title={item.mediaName?.split(".")[0]}
                    className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} cursor-pointer`}
                    // spinnerClassName="laptop:bg-[size:100%]"
                    spinnerClassName="laptop:bg-[size:5rem]"
                    imageClassName="bg-[size:100%]"
                    slides={message.attachments.map((item) => ({
                      src:
                        item.type === "image"
                          ? item.mediaUrl
                          : "images/filenotfound.svg",
                    }))}
                    index={index}
                  />
                ))} */}

            {/* {message.attachments?.map((item, index) => (
              <ImageWithLightBox
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} cursor-pointer`}
                // spinnerClassName="laptop:bg-[size:100%]"
                spinnerClassName="laptop:bg-[size:5rem]"
                imageClassName="bg-[size:100%]"
                slides={message.attachments.map((item) => ({
                  src:
                    item.type === "image"
                      ? item.mediaUrl
                      : "images/filenotfound.svg",
                }))}
                index={index}
              />
            ))} */}

            {message.attachments?.map((item, index) => (
              <ImageWithLightBoxAndNoLazy
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} ${pending ? "opacity-50" : ""} cursor-pointer bg-[size:100%]`}
                slides={message.attachments.map((item) => ({
                  src:
                    item.type === "image"
                      ? item.mediaUrl
                      : "images/filenotfound.svg",
                }))}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageContent);
