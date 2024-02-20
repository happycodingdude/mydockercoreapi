import { Tooltip } from "antd";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GenerateContent, HttpRequest } from "../../common/Utility";
import { useAuth, useEventListener } from "../../hook/CustomHooks";
import UpdateTitle from "../chat/UpdateTitle";
import BackgroundPortal from "../common/BackgroundPortal";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import UserProfile from "../profile/UserProfile";
import ChatInput from "./ChatInput";

const page = 1;
const limit = 10;

const Chatbox = ({ reference }) => {
  console.log("Chatbox calling");
  if (!reference.conversation) return;
  const auth = useAuth();

  const refChatInput = useRef();
  const refChatContent = useRef();
  const refScrollButton = useRef();
  const refToggleInformationContainer = useRef();
  const refChatboxContainer = useRef();
  const refTitleContainer = useRef();

  const [files, setFiles] = useState([]);
  const [participants, setParticipants] = useState();
  const [messages, setMessages] = useState();
  const [suggestion, setSuggestion] = useState([]);

  const initParticipantAndSuggestion = (data) => {
    if (!data) return;
    setParticipants(data);
    const suggestion = data
      .filter((item) => item.ContactId !== auth.id)
      .map((item) => {
        return {
          name: item.Contact.Name,
          avatar: item.Contact.Avatar,
          userId: item.Contact.Id,
        };
      });
    setSuggestion(suggestion);

    reference.refInformation.setParticipants(data);
  };

  useEffect(() => {
    setFiles([]);

    const controller = new AbortController();
    HttpRequest({
      method: "get",
      url: `api/conversations/${reference.conversation.Id}/messages?page=${page}&limit=${limit}`,
      token: auth.token,
      controller: controller,
    }).then((res) => {
      if (!res) return;
      refChatContent.current.scrollTop = 0;
      setMessages(res.reverse());
    });
    HttpRequest({
      method: "get",
      url: `api/conversations/${reference.conversation.Id}/participants`,
      token: auth.token,
      controller: controller,
    }).then(initParticipantAndSuggestion);

    return () => {
      controller.abort();
    };
  }, [reference.conversation.Id]);

  useEffect(() => {
    reference.refChatbox.setParticipants = () => {
      HttpRequest({
        method: "get",
        url: `api/conversations/${reference.conversation.Id}/participants`,
        token: auth.token,
      }).then(initParticipantAndSuggestion);
    };
    reference.refChatbox.newMessage = (message) => {
      setMessages([...messages, message]);
    };
  }, [initParticipantAndSuggestion, setMessages]);

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

    // refChatContent.current.classList.add("scroll-smooth");
    setTimeout(() => {
      refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    }, 500);
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
    var body = {
      ContactId: auth.id,
      ConversationId: reference.conversation.Id,
    };
    if (files.length === 0) {
      body = {
        ...body,
        Type: "text",
        Content: text,
      };
    } else {
      body = {
        ...body,
        Type: "media",
        Attachments: await uploadFile().then((uploads) => {
          return uploads.map((item) => ({
            Type: item.type,
            MediaUrl: item.url,
            MediaName: item.name,
            MediaSize: item.size,
          }));
        }),
      };
    }
    HttpRequest({
      method: "post",
      url: `api/messages/send`,
      token: auth.token,
      data: body,
    }).then((res) => {
      setFiles([]);
      setMessages([...messages, res]);

      setTimeout(() => {
        refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
      }, 500);
    });
  };

  const pressKey = (e) => {
    // Press Shift + Enter to generate new line
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      if (refChatInput.current.textarea.value === "") return;
      sendMessage();
    }
    // Press tab to choose
    // else if (e.keyCode == 9) {
    //   e.preventDefault();
    // }
  };

  const selectMention = (option) => {
    console.log(option);
  };

  const searchMention = (text, prefix) => {
    console.log(text);
    console.log(prefix);
  };

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  const toggleInformationContainer = () => {
    reference.toggleInformationContainer();
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

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState();

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
      e.keyCode === 27 ||
      Array.from(e.target.classList).some(
        (item) => item === "profile-container",
      )
    )
      setOpen(false);
  }, []);
  useEventListener("keydown", closeProfile);
  useEventListener("click", closeProfile);

  return (
    <div
      ref={refChatboxContainer}
      className="mx-[.1rem] flex flex-1 grow-[2] flex-col items-center"
    >
      <div className="relative flex w-full grow flex-col overflow-hidden bg-white [&>*]:px-[2rem]">
        <div
          ref={refScrollButton}
          className="fa fa-arrow-down absolute bottom-[1rem] right-[50%] flex hidden aspect-square w-[3rem] cursor-pointer items-center justify-center
                      rounded-[50%] bg-[#f0f0f0] font-normal text-gray-500 hover:bg-[#dadada]"
          onClick={scrollChatContentToBottom}
        ></div>
        <div className="flex h-[7rem] w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-gray-300 py-[.5rem]">
          <div className="flex items-center gap-[1rem]">
            <ImageWithLightBoxWithBorderAndShadow
              src={reference.conversation?.Avatar ?? ""}
              className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
              onClick={() => {}}
            />
            <div
              ref={refTitleContainer}
              className="relative flex grow flex-col laptop:max-w-[30rem] desktop:max-w-[50rem]"
            >
              {reference.conversation?.IsGroup ? (
                <>
                  <div className="flex w-full gap-[.5rem]">
                    <CustomLabel
                      className="text-start text-lg font-bold text-gray-600"
                      title={reference.conversation.Title}
                      tooltip
                    />
                    <UpdateTitle reference={reference} />
                  </div>
                  <p>{participants?.length} members</p>
                </>
              ) : (
                <CustomLabel
                  className="text-start text-lg font-bold text-gray-600"
                  title={
                    participants?.find(
                      (item) => item.ContactId !== auth.user.Id,
                    )?.Contact.Name
                  }
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-[1rem]">
            <div
              ref={refToggleInformationContainer}
              onClick={toggleInformationContainer}
              className="fa fa-arrow-right flex aspect-square w-[3rem] 
                cursor-pointer items-center justify-center rounded-[1rem] 
                text-lg font-normal text-gray-500"
            ></div>
          </div>
        </div>
        <div
          ref={refChatContent}
          className="hide-scrollbar flex grow flex-col gap-[2rem] overflow-y-scroll
            scroll-smooth bg-gradient-to-b from-white to-pink-50 pb-4"
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
                      reference.contacts.find(
                        (item) => item.Id == message.ContactId,
                      ).Avatar ?? ""
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
                className={`flex flex-col laptop:w-[clamp(40rem,70%,50rem)] 
                  desktop:w-[clamp(40rem,70%,80rem)] 
                  ${message.ContactId === auth.id ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-center gap-[1rem] text-xs text-gray-400 
                    ${message.ContactId === auth.id ? "flex-row-reverse" : ""}`}
                >
                  {message.ContactId === auth.id ? (
                    ""
                  ) : (
                    <p>
                      {
                        reference.contacts.find(
                          (item) => item.Id == message.ContactId,
                        ).Name
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
                    className={`break-all rounded-[3rem] bg-gradient-radial-to-bc from-white 
                      to-pink-400 px-[1.5rem] py-[.7rem] text-white`}
                    // ${
                    //   message.ContactId === auth.id
                    //     ? "rounded-l-[1rem] rounded-tr-[1rem]"
                    //     : "rounded-r-[1rem] rounded-tl-[1rem]"
                    // }`}
                  >
                    {GenerateContent(reference.contacts, message.Content)}
                  </div>
                ) : (
                  <div
                    className={`flex w-full flex-wrap ${message.ContactId === auth.id ? "justify-end" : ""} gap-[1rem] text-gray-400`}
                  >
                    {message.Attachments.map((item, index) => (
                      <ImageWithLightBox
                        src={item.MediaUrl}
                        title={item.MediaName?.split(".")[0]}
                        className="my-auto max-w-[45%] cursor-pointer rounded-2xl"
                        slides={message.Attachments.map((item) => ({
                          src:
                            item.Type === "image"
                              ? item.MediaUrl
                              : "../src/assets/filenotfound.svg",
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
            className="aspect-video !w-[35%]"
            open={open}
            title="Profile"
            onClose={() => setOpen(false)}
          >
            <UserProfile
              id={userId}
              onClose={() => setOpen(false)}
              checkExistChat={reference.checkExistChat}
            />
          </BackgroundPortal>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-white px-8 py-3">
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
              className="fa fa-image cursor-pointer font-normal text-gray-500"
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
              className="fa fa-file cursor-pointer font-normal text-gray-500"
            ></label>
          </Tooltip>
        </div>
        {files.length !== 0 ? (
          <>
            <div
              className={`${
                files.length === 1
                  ? "grid-cols-[50%]"
                  : "laptop:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] desktop:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]"
              } hide-scrollbar grid max-h-[10rem] w-full gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.1rem] border-gray-300 p-[1rem]            
          laptop:w-[clamp(40rem,75%,70rem)]         
          desktop:w-[clamp(70rem,75%,120rem)]`}
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
                      ? "url('../src/assets/imagenotfound.jpg')"
                      : `url('${URL.createObjectURL(item)}'`,
                  }}
                  className={`relative aspect-video rounded-[.8rem] bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center`}
                  title={item.name.split(".")[0]}
                >
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    className="fa fa-times-circle absolute right-[0] top-[-5%] z-[1] aspect-square w-[1rem] cursor-pointer rounded-[50%] bg-white text-red-500 hover:text-red-400"
                    title="Clear image"
                  ></span>
                </div>
              ))}
            </div>
            <div className="flex grow">
              <Tooltip title="Send">
                <div
                  className="fa fa-paper-plane m-auto flex aspect-square 
                    cursor-pointer items-center justify-center 
                    rounded-[.8rem] text-pink-500"
                  onClick={sendMessage}
                ></div>
              </Tooltip>
            </div>
          </>
        ) : (
          <ChatInput mentions={suggestion} onClick={sendMessage} />
        )}
      </div>
    </div>
  );
};

export default Chatbox;