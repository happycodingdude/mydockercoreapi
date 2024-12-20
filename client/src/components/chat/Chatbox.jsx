import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { debounce } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImage, HttpRequest } from "../../common/Utility";
import {
  useConversation,
  useEventListener,
  useInfo,
  useMessage,
} from "../../hook/CustomHooks";
import { send } from "../../hook/MessageAPIs";
import FetchingMoreMessages from "../common/FetchingMoreMessages";
import RelightBackground from "../common/RelightBackground";
import ChatboxHeader from "./ChatboxHeader";
import ChatInput from "./ChatInput";
import MessageContent from "./MessageContent";

const Chatbox = (props) => {
  console.log("Chatbox calling");
  const { refChatbox, toggleInformation, showInfo } = props;

  const queryClient = useQueryClient();

  const refChatContent = useRef();
  const refScrollToBottom = useRef();
  const refToggleInformationContainer = useRef();
  const refChatboxContainer = useRef();
  const refTitleContainer = useRef();
  const refInput = useRef();

  // const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [page, setPage] = useState(2);
  const [fetching, setFetching] = useState(false);
  const [autoScrollBottom, setAutoScrollBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const {
    data: messages,
    isLoading,
    isRefetching,
  } = useMessage(conversations?.selected?.id, page);

  useEffect(() => {
    blurImage(".chatbox-content");
    refChatContent.current.classList.remove("scroll-smooth");
    // setFiles([]);

    if (autoScrollBottom) {
      scrollChatContentToBottom();
      setTimeout(() => {
        refChatContent.current.classList.add("scroll-smooth");
      }, 500);
    }
  }, [messages, autoScrollBottom]);

  useEffect(() => {
    setPage(2);
    setAutoScrollBottom(true);
    setTimeout(() => {
      refInput.current.focus();
    }, 100);
  }, [conversations?.selected]);

  // const chooseFile = (e) => {
  //   const chosenFiles = Array.from(e.target.files);
  //   if (chosenFiles.length === 0) return;

  //   const mergedFiles = chosenFiles.filter((item) => {
  //     if (!files.some((file) => file.name === item.name)) return item;
  //   });
  //   setFiles([...files, ...mergedFiles]);

  //   e.target.value = null;
  // };

  // const removeFile = (e) => {
  //   setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  // };

  const delay = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  const {
    mutate: sendMutation,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async (param) => {
      // await delay(2000);

      let randomId = Math.random().toString(36).substring(2, 7);
      queryClient.setQueryData(["message"], (oldData) => {
        return {
          ...oldData,
          messages: [
            {
              id: randomId,
              type: param.type,
              content: param.content,
              contactId: info.id,
              attachments: param.attachments,
              currentReaction: null,
              noLazy: true,
            },
            ...oldData.messages,
          ],
        };
      });

      // if (param.type === "text" && param.content === "") return;

      let bodyToCreate = {
        moderator: conversations?.selected.participants.find(
          (q) => q.isModerator === true,
        ).contact.id,
        type: param.type,
        content: param.content,
      };
      let bodyLocal = Object.assign({}, bodyToCreate);

      if (param.files.length !== 0) {
        const uploaded = await uploadFile(param.files).then((uploads) => {
          return uploads.map((item) => ({
            type: item.type,
            mediaUrl: item.url,
            mediaName: item.name,
            mediaSize: item.size,
          }));
        });
        bodyToCreate = {
          ...bodyToCreate,
          attachments: uploaded,
        };
        bodyLocal = {
          ...bodyLocal,
          attachments: param.attachments,
        };
      }

      var id = await send(conversations?.selected.id, bodyToCreate);
      // await delay(3000);

      queryClient.setQueryData(["message"], (oldData) => {
        const updatedMessages = oldData.messages.map((message) => {
          if (message.id !== randomId) return message;
          message.id = id;
          message.loaded = true;
          return message;
        });
        return {
          ...oldData,
          messages: updatedMessages,
        };
      });

      const element = document.querySelector(`[data-id="${randomId}"]`);
      const image = element.querySelector(".nolazy-image");
      image.classList.add("loaded");

      queryClient.setQueryData(["conversation"], (oldData) => {
        const clonedConversations = oldData.conversations.map((item) => {
          return Object.assign({}, item);
        });
        const updatedConversations = clonedConversations.map((conversation) => {
          if (conversation.id !== conversations?.selected.id)
            return conversation;
          conversation.lastMessage =
            param.type === "text"
              ? param.content
              : param.files.map((item) => item.name).join(",");
          return conversation;
        });
        return {
          ...oldData,
          conversations: updatedConversations,
          filterConversations: updatedConversations,
        };
      });

      if (param.files.length !== 0) {
        queryClient.setQueryData(["attachment"], (oldData) => {
          const cloned = oldData.map((item) => {
            return Object.assign({}, item);
          });
          // Chỉ cần lấy item đầu tiên vì là thời gian gần nhất
          var firstItem = cloned[0];
          // Nếu undefined tức là chưa có attachment nào
          // hoặc nếu ngày gần nhất không phải hôm nay
          // -> tạo object mới
          if (!firstItem || firstItem.date !== moment().format("MM/DD/YYYY")) {
            cloned.unshift({
              date: moment().format("MM/DD/YYYY"),
              attachments: param.attachments,
            });
            return cloned;
          }
          // Ngược lại thì ngày gần nhất là hôm nay
          else {
            const newData = cloned.map((item) => {
              if (item.date === moment().format("MM/DD/YYYY")) {
                return {
                  ...item,
                  attachments: [...param.attachments, ...item.attachments],
                };
              }
              return item;
            });
            return newData;
          }
        });
      }
    },
  });

  const uploadFile = async (files) => {
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

  // const sendMedia = async () => {
  //   const uploaded = await uploadFile().then((uploads) => {
  //     return uploads.map((item) => ({
  //       type: item.type,
  //       mediaUrl: item.url,
  //       mediaName: item.name,
  //       mediaSize: item.size,
  //     }));
  //   });

  //   const lazyImages = files.map((item) => {
  //     // console.log(URL.createObjectURL(item));
  //     return {
  //       type: "image",
  //       mediaUrl: URL.createObjectURL(item),
  //     };
  //   });
  //   setFiles([]);
  //   sendMutation({ type: "media", attachments: lazyImages });
  // };

  useEffect(() => {
    scrollChatContentToBottom();
  }, [isPending]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    // refChatContent.current.scrollTop = 0;
  };

  const toggleInformationContainer = () => {
    toggleInformation();
    // if (
    //   refToggleInformationContainer.current.classList.contains(
    //     "animate-information-hide-arrow",
    //   )
    // ) {
    //   refToggleInformationContainer.current.classList.remove(
    //     "animate-information-hide-arrow",
    //   );
    //   refToggleInformationContainer.current.classList.add(
    //     "animate-information-show-arrow",
    //   );
    // } else {
    //   refToggleInformationContainer.current.classList.remove(
    //     "animate-information-show-arrow",
    //   );
    //   refToggleInformationContainer.current.classList.add(
    //     "animate-information-hide-arrow",
    //   );
    // }
  };

  // Event listener
  // const closeProfile = useCallback((e) => {
  //   if (e.target.closest(".profile-container")) setOpen(false);
  // }, []);
  // useEventListener("click", closeProfile);

  const fetchMoreMessage = (conversationId, page, currentScrollHeight) => {
    setFetching(true);
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_GETWITHPAGING.replace(
        "{id}",
        conversationId,
      ).replace("{page}", page),
    }).then((data) => {
      queryClient.setQueryData(["message"], (oldData) => {
        const cloned = Object.assign({}, oldData);
        cloned.messages = [...cloned.messages, ...data.data.messages];
        cloned.nextExist = data.data.nextExist;
        return cloned;
      });
      setPage((current) => current + 1);
      setFetching(false);
      requestAnimationFrame(() => {
        refChatContent.current.style.scrollBehavior = "auto";
        refChatContent.current.scrollTop =
          refChatContent.current.scrollHeight - currentScrollHeight;
        refChatContent.current.style.scrollBehavior = "smooth";
      });
    });
  };

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  const handleScroll = useCallback(async () => {
    // Nếu scroll 1 khoảng lớn hơn kích thước ô chat thì hiện nút scroll to bottom
    const distanceFromBottom =
      refChatContent.current.scrollHeight -
      (refChatContent.current.scrollTop + refChatContent.current.clientHeight);
    if (
      refChatContent.current.clientHeight !== 0 &&
      distanceFromBottom >= refChatContent.current.clientHeight
    )
      setShowScrollToBottom(true);
    else setShowScrollToBottom(false);

    if (refChatContent.current.scrollTop === 0 && messages.nextExist) {
      setAutoScrollBottom(false);
      const currentScrollHeight = refChatContent.current.scrollHeight;
      debounceFetch(conversations?.selected.id, page, currentScrollHeight);
    }
  }, [conversations?.selected, messages, page]);
  useEventListener("scroll", handleScroll);

  return (
    <div
      ref={refChatboxContainer}
      className={`relative mx-[.1rem] flex w-full grow flex-col items-center border-x-[.1rem] border-x-[var(--border-color)]
        ${showInfo ? "" : "shrink-0"}`}
    >
      {/* {isLoading || isRefetching ? <LocalLoading /> : ""} */}
      <div className="chatbox-content relative flex w-full grow flex-col justify-between overflow-hidden">
        {fetching ? <FetchingMoreMessages loading /> : ""}
        <RelightBackground
          data-show={showScrollToBottom}
          onClick={scrollChatContentToBottom}
          className={`absolute bottom-[5%] right-[50%] z-20
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
        >
          <div className="fa fa-chevron-down base-icon"></div>
        </RelightBackground>
        <ChatboxHeader
          toggleInformation={toggleInformation}
          showInfo={showInfo}
          messages={messages}
          selected={conversations?.selected}
        />
        <div
          ref={refChatContent}
          // className=" hide-scrollbar flex grow flex-col-reverse gap-[2rem] overflow-y-scroll scroll-smooth
          // bg-gradient-to-b from-[var(--sub-color)] to-[var(--main-color-thin)] pb-4"
          className="hide-scrollbar flex grow flex-col gap-[2rem] overflow-y-scroll bg-[var(--bg-color-extrathin)] px-[1rem] pb-[2rem]"
        >
          {messages?.messages
            ? [...messages?.messages]
                .reverse()
                .map((message, index) => (
                  <MessageContent
                    message={message}
                    id={conversations.selected.id}
                    mt={index === 0}
                  />
                ))
            : ""}
          {/* {messages?.messages.map((message, index) => (
            <MessageContent
              message={message}
              id={conversations.selected.id}
              mt={index === 0}
            />
          ))} */}

          {/* {isPending && (
            <MessageContent
              pending={isPending}
              message={{
                type: variables.type,
                content: variables.content,
                contactId: info.id,
                attachments: variables.attachments,
                currentReaction: null,
                noLazy: true,
              }}
            />
          )} */}

          {/* <BackgroundPortal
            className="!w-[35%]"
            show={open}
            title="Profile"
            onClose={() => setOpen(false)}
          >
            <UserProfile id={userId} onClose={() => setOpen(false)} />
          </BackgroundPortal> */}
        </div>
        {/* </div> */}
      </div>
      <div className="flex w-full items-center justify-center py-3">
        <ChatInput
          className="chatbox"
          send={(text, files) => {
            if (text.trim() === "" && files.length === 0) return;

            const lazyImages = files.map((item) => {
              return {
                type: "image",
                mediaUrl: URL.createObjectURL(item),
              };
            });
            // setFiles([]);
            sendMutation({
              type: text.trim() === "" ? "media" : "text",
              content: text,
              attachments: lazyImages,
              files: files,
            });
          }}
          ref={refInput}
        />
      </div>
    </div>
  );
};

export default Chatbox;
