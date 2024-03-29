import { Tooltip } from "antd";
import EmojiPicker from "emoji-picker-react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GenerateContent, HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useEventListener,
  useFetchAttachments,
  useFetchConversations,
  useFetchFriends,
  useFetchMessages,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import UpdateTitle from "../chat/UpdateTitle";
import BackgroundPortal from "../common/BackgroundPortal";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import AcceptButton from "../friend/AcceptButton";
import AddButton from "../friend/AddButton";
import CancelButton from "../friend/CancelButton";
import UserProfile from "../profile/UserProfile";
import ChatInput from "./ChatInput";

const Chatbox = (props) => {
  console.log("Chatbox calling");
  const { contacts, refChatbox, toggleInformation } = props;

  const auth = useAuth();
  const { participants } = useFetchParticipants();
  const { messages, removeLastItem, addNewItem } = useFetchMessages();
  const { selected } = useFetchConversations();
  const { reFetch: reFetchAttachments } = useFetchAttachments();
  const { profile, request, reFetchRequest } = useFetchFriends();

  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);

  const refChatContent = useRef();
  const refScrollButton = useRef();
  const refToggleInformationContainer = useRef();
  const refChatboxContainer = useRef();
  const refTitleContainer = useRef();
  const refChatInput = useRef();

  useEffect(() => {
    setFiles([]);
  }, []);

  refChatbox.newMessage = (messageData) => {
    if (
      messageData.ContactId !== auth.id &&
      messageData.ConversationId === selected?.Id
    )
      addNewItem(messageData);
  };

  useEffect(() => {
    // listenNotification((message) => {
    //   console.log("Chatbox receive message from worker");
    //   const messageData = JSON.parse(message.data);
    //   switch (message.event) {
    //     case "NewMessage":
    //       // add new message to current list
    //       var newArr = messages?.map((item) => {
    //         if (item.Messages.some((message) => message.Id === messageData.Id))
    //           return item;
    //         if (
    //           item.Date !== moment(messageData.CreatedTime).format("MM/DD/YYYY")
    //         )
    //           return item;

    //         item.Messages = [...item.Messages, messageData];
    //         return item;
    //       });
    //       setMessages(newArr);

    //       setTimeout(() => {
    //         refChatContent.current.scrollTop =
    //           refChatContent.current.scrollHeight;
    //       }, 200);
    //       break;
    //     default:
    //       break;
    //   }
    // });

    // setTimeout(() => {
    //   refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    // }, 500);
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  }, [messages]);

  const chooseFile = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles([...files, ...mergedFiles]);

    e.target.value = null;
  };

  const removeFile = (e) => {
    setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  };

  const uploadFile = async () => {
    // Create a root reference
    const storage = getStorage();
    return Promise.all(
      files.map((item) => {
        if (
          ["doc", "docx", "xls", "xlsx", "pdf"].includes(
            item.name.split(".")[1],
          )
        ) {
          return uploadBytes(ref(storage, `file/${item.name}`), item).then(
            (snapshot) => {
              return getDownloadURL(snapshot.ref).then((url) => {
                return {
                  type: "file",
                  url: url,
                  name: item.name,
                  size: item.size,
                };
              });
            },
          );
        }
        return uploadBytes(ref(storage, `img/${item.name}`), item).then(
          (snapshot) => {
            return getDownloadURL(snapshot.ref).then((url) => {
              return {
                type: "image",
                url: url,
                name: item.name,
                size: item.size,
              };
            });
          },
        );
      }),
    );
  };

  const sendMessage = async (text) => {
    let body = {
      ContactId: auth.id,
      ConversationId: selected.Id,
    };
    if (files.length === 0) {
      if (text === "") return;
      body = {
        ...body,
        Type: "text",
        Content: text,
      };
    } else {
      const uploaded = await uploadFile().then((uploads) => {
        return uploads.map((item) => ({
          Type: item.type,
          MediaUrl: item.url,
          MediaName: item.name,
          MediaSize: item.size,
        }));
      });
      body = {
        ...body,
        Type: "media",
        Attachments: uploaded,
        Content: uploaded.map((item) => item.MediaName).join(","),
      };
    }

    addNewItem(body);
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;

    HttpRequest({
      method: "post",
      url: `api/messages/send`,
      token: auth.token,
      data: body,
    })
      .then((res) => {
        setFiles([]);
        if (body.Type === "media") reFetchAttachments(selected.Id);
      })
      .catch((err) => {
        removeLastItem();
      });
  };

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  const toggleInformationContainer = () => {
    toggleInformation();
    if (
      refToggleInformationContainer.current.classList.contains(
        "animate-information-hide-arrow",
      )
    ) {
      refToggleInformationContainer.current.classList.remove(
        "animate-information-hide-arrow",
      );
      refToggleInformationContainer.current.classList.add(
        "animate-information-show-arrow",
      );
    } else {
      refToggleInformationContainer.current.classList.remove(
        "animate-information-show-arrow",
      );
      refToggleInformationContainer.current.classList.add(
        "animate-information-hide-arrow",
      );
    }
  };

  // Event listener
  const handleScroll = useCallback(() => {
    if (
      refChatContent.current.scrollHeight - refChatContent.current.scrollTop >
      500
    )
      refScrollButton.current.classList.remove("hidden");
    else refScrollButton.current.classList.add("hidden");
  }, []);

  useEventListener("scroll", handleScroll);
  const closeProfile = useCallback((e) => {
    if (
      // e.keyCode === 27 ||
      Array.from(e.target.classList).some(
        (item) => item === "profile-container",
      )
    )
      setOpen(false);
  }, []);
  // useEventListener("keydown", closeProfile);
  useEventListener("click", closeProfile);

  const closeEmoji = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (
      classList.some((item) => item === "choose-emoji") ||
      classList.some((item) => item.includes("epr"))
    )
      return;
    setOpenEmoji(false);
  }, []);
  useEventListener("click", closeEmoji);

  const onEmojiClick = (emoji) => {
    refChatInput.setText(emoji.emoji);
  };

  return (
    <div
      ref={refChatboxContainer}
      className="mx-[.1rem] flex flex-1 grow-[2] flex-col items-center"
    >
      <div className="relative flex w-full grow flex-col overflow-hidden bg-[var(--bg-color)] [&>*]:px-[2rem]">
        <div
          ref={refScrollButton}
          className="fa fa-arrow-down absolute bottom-[1rem] right-[50%] hidden aspect-square w-[3rem] cursor-pointer items-center 
          justify-center rounded-[50%] bg-[var(--main-color-normal)] font-normal text-[var(--text-sub-color)] hover:bg-[var(--main-color)]"
          onClick={scrollChatContentToBottom}
        ></div>
        <div className="flex h-[7rem] w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] py-[.5rem]">
          <div className="flex items-center gap-[1rem]">
            {selected?.IsGroup ? (
              <ImageWithLightBoxWithBorderAndShadow
                src={selected?.Avatar ?? ""}
                className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                onClick={() => {}}
              />
            ) : (
              <ImageWithLightBoxWithBorderAndShadow
                src={profile?.Avatar ?? ""}
                className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                // onClick={() => {
                //   setUserId(profile?.Id);
                //   setOpen(true);
                // }}
                slides={[
                  {
                    src: profile?.Avatar ?? "",
                  },
                ]}
              />
            )}

            <div
              ref={refTitleContainer}
              className="relative flex grow flex-col laptop:max-w-[30rem] desktop:max-w-[50rem]"
            >
              {selected?.IsGroup ? (
                <>
                  <div className="flex w-full gap-[.5rem]">
                    <CustomLabel
                      className="text-start text-lg font-bold"
                      title={selected?.Title}
                      tooltip
                    />
                    <UpdateTitle />
                  </div>
                  <p>{participants?.length} members</p>
                </>
              ) : (
                <>
                  <CustomLabel
                    className="text-start text-lg font-bold"
                    title={profile?.Name}
                  />
                  {
                    {
                      new: (
                        <AddButton
                          className="!ml-0 text-xs laptop:h-[2rem] laptop:w-[10rem]"
                          id={profile?.Id}
                          onClose={() => reFetchRequest(profile?.Id)}
                        />
                      ),
                      request_received: (
                        <AcceptButton
                          className="!ml-0 text-xs laptop:h-[2rem] laptop:w-[10rem]"
                          request={request}
                          onClose={() => reFetchRequest(profile?.Id)}
                        />
                      ),
                      request_sent: (
                        <CancelButton
                          className="!ml-0 text-xs laptop:h-[2rem] laptop:w-[10rem]"
                          id={request?.Id}
                          onClose={() => reFetchRequest(profile?.Id)}
                        />
                      ),
                      friend: <p>Friend</p>,
                    }[request?.Status]
                  }
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-[1rem]">
            <div
              ref={refToggleInformationContainer}
              onClick={toggleInformationContainer}
              className="fa fa-arrow-right flex aspect-square w-[3rem] cursor-pointer items-center justify-center 
              rounded-[1rem] text-lg font-normal"
            ></div>
          </div>
        </div>
        <div
          ref={refChatContent}
          className="hide-scrollbar flex grow flex-col gap-[2rem] overflow-y-scroll scroll-smooth 
          bg-gradient-to-b from-[var(--sub-color)] to-[var(--main-color-thin)] pb-4"
        >
          {messages?.map((message) => (
            <div
              className={`flex items-end gap-[1rem] 
                ${message.ContactId === auth.id ? "flex-row-reverse" : ""}`}
            >
              {message.ContactId !== auth.id ? (
                <div className="relative w-[3rem]">
                  <ImageWithLightBoxWithBorderAndShadow
                    src={
                      contacts?.find((item) => item.Id == message.ContactId)
                        .Avatar ?? ""
                    }
                    className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
                    onClick={() => {
                      setUserId(message.ContactId);
                      setOpen(true);
                    }}
                  />
                </div>
              ) : (
                ""
              )}
              <div
                className={`flex flex-col gap-[.3rem] laptop:w-[clamp(40rem,70%,50rem)] desktop:w-[clamp(40rem,70%,80rem)] 
                  ${message.ContactId === auth.id ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-center gap-[1rem] text-xs text-[var(--text-main-color-blur)]
                    ${message.ContactId === auth.id ? "flex-row-reverse" : ""}`}
                >
                  {message.ContactId === auth.id ? (
                    ""
                  ) : (
                    <p>
                      {
                        contacts?.find((item) => item.Id == message.ContactId)
                          .Name
                      }
                    </p>
                  )}

                  <p>
                    {moment(message.CreatedTime).format("DD/MM/YYYY") ===
                    moment().format("DD/MM/YYYY")
                      ? moment(message.CreatedTime).format("HH:mm")
                      : moment(message.CreatedTime).format("DD/MM HH:mm")}
                  </p>
                </div>
                {message.Type === "text" ? (
                  <div
                    className="break-all rounded-[3rem] bg-gradient-radial-to-bc from-[var(--sub-color)] to-[var(--main-color)] 
                    px-[1.5rem] py-[.7rem] text-[var(--text-sub-color)]"
                  >
                    {GenerateContent(contacts, message.Content)}
                  </div>
                ) : (
                  <div
                    className={`flex w-full flex-wrap ${message.ContactId === auth.id ? "justify-end" : ""} gap-[1rem]`}
                  >
                    {message.Attachments.map((item, index) => (
                      <ImageWithLightBox
                        src={item.MediaUrl}
                        title={item.MediaName?.split(".")[0]}
                        className="my-auto aspect-square w-[45%] cursor-pointer rounded-2xl"
                        slides={message.Attachments.map((item) => ({
                          src:
                            item.Type === "image"
                              ? item.MediaUrl
                              : "images/filenotfound.svg",
                        }))}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <BackgroundPortal
            className="!w-[35%]"
            open={open}
            title="Profile"
            onClose={() => setOpen(false)}
          >
            <UserProfile id={userId} onClose={() => setOpen(false)} />
          </BackgroundPortal>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-[var(--bg-color)] px-8 py-3">
        <div className="flex max-w-[10rem] grow items-center justify-evenly">
          <input
            multiple
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            id="choose-image"
            onChange={chooseFile}
          ></input>
          <Tooltip title="Choose image">
            <label
              for="choose-image"
              className="fa fa-image cursor-pointer font-normal"
            ></label>
          </Tooltip>
          <input
            multiple
            type="file"
            accept=".doc,.docx,.xls,.xlsx,.pdf"
            className="hidden"
            id="choose-file"
            onChange={chooseFile}
          ></input>
          <Tooltip title="Choose file">
            <label
              for="choose-file"
              className="fa fa-file cursor-pointer font-normal"
            ></label>
          </Tooltip>
          {selected.IsGroup ? (
            ""
          ) : (
            <div className="relative">
              <Tooltip title="Emoji">
                <label
                  className="fa fa-smile choose-emoji cursor-pointer font-normal"
                  onClick={() => setOpenEmoji(true)}
                ></label>
              </Tooltip>
              <EmojiPicker
                open={openEmoji}
                width={300}
                height={400}
                className="!absolute !bottom-[3rem] !left-[1rem] !z-[1000]"
                onEmojiClick={onEmojiClick}
              />
            </div>
          )}
        </div>
        {files.length !== 0 ? (
          <>
            <div
              className={`${
                files.length === 1
                  ? "grid-cols-[50%]"
                  : "laptop:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] desktop:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]"
              } hide-scrollbar grid max-h-[10rem] w-full gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.2rem] 
              border-[var(--main-color-normal)] p-[.5rem] laptop:w-[clamp(40rem,75%,70rem)] desktop:w-[clamp(70rem,75%,120rem)]`}
            >
              {files.map((item) => (
                <div
                  style={{
                    "--image-url": [
                      "doc",
                      "docx",
                      "xls",
                      "xlsx",
                      "pdf",
                    ].includes(item.name.split(".")[1])
                      ? "url('images/imagenotfound.jpg')"
                      : `url('${URL.createObjectURL(item)}'`,
                  }}
                  className={`relative aspect-video rounded-[.8rem] bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center`}
                  title={item.name.split(".")[0]}
                >
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    className="fa fa-times-circle absolute right-[0] top-[-5%] z-[1] aspect-square w-[1rem] cursor-pointer rounded-[50%] 
                    bg-white text-[var(--danger-text-color)] hover:text-[var(--danger-text-color-normal)]"
                    title="Clear image"
                  ></span>
                </div>
              ))}
            </div>
            <div className="flex grow">
              <Tooltip title="Send">
                <div
                  className="fa fa-paper-plane flex aspect-square h-full cursor-pointer items-center justify-center rounded-[.8rem] 
                  text-[var(--main-color-medium)]"
                  onClick={sendMessage}
                ></div>
              </Tooltip>
            </div>
          </>
        ) : (
          <ChatInput send={sendMessage} refChatInputExpose={refChatInput} />
        )}
      </div>
    </div>
  );
};

export default Chatbox;
