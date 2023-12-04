import axios from "axios";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";

const Chatbox = ({ conversation, func }) => {
  console.log("Chatbox calling");
  const auth = useAuth();

  const refChatInput = useRef();
  const refChatContent = useRef();
  const refScrollButton = useRef();
  const refChatboxOption = useRef();
  const refChatboxOptionMenu = useRef();
  const refToggleInformation = useRef();

  const [files, setFiles] = useState([]);
  const [participants, setParticipants] = useState();
  const [messages, setMessages] = useState();
  useEffect(() => {
    if (!conversation) return;

    // const storage = getStorage();
    // const storageRef = ref(storage, "img/anhdep1.jpg");
    // getDownloadURL(storageRef).then((url) => {
    //   console.log(url);
    // });
    setFiles([]);

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .get(`api/conversations/${conversation?.Id}/participants`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          setParticipants(res.data.data);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(`api/conversations/${conversation?.Id}/messages`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          setMessages(res.data.data);
          // refChatContent.current.scrollTop = 0;

          // setTimeout(() => {
          //   refChatContent.current.scrollTop =
          //     refChatContent.current.scrollHeight;
          // }, 200);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [conversation]);

  useEffect(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(navigator.serviceWorker.ready)
        .then(() => {
          navigator.serviceWorker.onmessage = (event) => {
            // event is a MessageEvent object
            console.log(
              `The service worker sent me a message: ${event.data.data}`,
            );

            // user config unnotified
            if (localStorage.getItem("notification") === "false") return;

            // add new message to current list
            var newArr = messages?.map((item) => {
              if (
                item.Messages.some(
                  (message) => message.Id === event.data.data.Id,
                )
              )
                return item;
              if (
                item.Date !==
                moment(event.data.data.CreatedTime).format("MM/DD/YYYY")
              )
                return item;

              item.Messages = [...item.Messages, event.data.data];
              return item;
            });
            setMessages(newArr);

            setTimeout(() => {
              refChatContent.current.scrollTop =
                refChatContent.current.scrollHeight;
            }, 200);
          };
        });

      // navigator.serviceWorker.addEventListener("message", (event) => {
      //   // event is a MessageEvent object
      //   console.log(`The service worker sent me a message: ${event.data}`);
      // });
    }
  }, [messages]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  const sendMessage = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = {
      Type: "text",
      Content: refChatInput.current.value,
      ContactId: auth.id,
      ConversationId: conversation.Id,
    };
    axios
      .post(`api/messages/send`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          refChatInput.current.value = "";

          // add new message to current list
          if (messages.length === 0) {
            var firstMessage = [
              {
                Date: moment().format("MM/DD/YYYY"),
                Messages: [res.data.data],
              },
            ];
            setMessages(firstMessage);
          } else {
            var newArr = messages.map((item) => {
              if (
                item.Date ===
                moment(res.data.data.CreatedTime).format("MM/DD/YYYY")
              ) {
                item.Messages = [...item.Messages, res.data.data];
                return item;
              }
              return item;
            });
            setMessages(newArr);
          }

          setTimeout(() => {
            refChatContent.current.scrollTop =
              refChatContent.current.scrollHeight;
          }, 200);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const handlePressKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // The scroll listener
  const handleScroll = useCallback(() => {
    if (
      refChatContent.current.scrollHeight - refChatContent.current.scrollTop >
      500
    )
      refScrollButton.current.classList.remove("hidden");
    else refScrollButton.current.classList.add("hidden");
  }, []);

  const toggleChatboxOption = useCallback((event) => {
    // click anywhere on screen except the option toggle
    if (!refChatboxOption.current?.contains(event.target)) {
      refChatboxOptionMenu.current.classList.remove("scale-y-100");
    } else if (refChatboxOptionMenu.current.classList.contains("scale-y-100"))
      refChatboxOptionMenu.current.classList.remove("scale-y-100");
    else refChatboxOptionMenu.current.classList.add("scale-y-100");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("click", toggleChatboxOption, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("click", toggleChatboxOption, true);
    };
  }, [handleScroll, toggleChatboxOption]);

  const handleUpdateTitle = () => {
    var title = prompt("New title");
    if (title === null || title === "") return;
    conversation.Title = title;

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .put("api/conversations", conversation, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data.data);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const toggleInformation = () => {
    func.refInformation.toggleInformation();

    refToggleInformation.current.classList.add("animate-ping");
    setTimeout(() => {
      refToggleInformation.current.classList.remove("animate-ping");
      refToggleInformation.current.classList.toggle("fa-arrow-left");
      refToggleInformation.current.classList.toggle("fa-arrow-right");
    }, 500);
  };

  const chooseFile = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles([...files, ...mergedFiles]);

    // Create a root reference
    // const storage = getStorage();
    // const storageRef = ref(storage, `img/${e.target.files[0].name}`);
    // uploadBytes(storageRef, e.target.files[0]).then((snapshot) => {
    //   console.log("Uploaded a blob or file!");
    //   console.log(snapshot);
    // });
  };

  const removeFile = (e) => {
    setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  };

  return (
    <>
      <div className="z-10 flex grow flex-col items-center gap-[1rem]">
        <div className="relative flex w-full grow flex-col overflow-hidden rounded-[1rem] bg-white [&>*]:px-[2rem]">
          <div
            ref={refScrollButton}
            className="fa fa-arrow-down absolute bottom-[1rem] right-[1rem] flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                      rounded-[50%] bg-gray-300 font-normal text-gray-500"
            onClick={scrollChatContentToBottom}
          ></div>
          <div className="flex items-center justify-between border-b-[.1rem] border-b-gray-300 py-[.5rem]">
            <div className="relative flex h-full grow items-center">
              {participants?.map((item, i) =>
                i < 3 ? (
                  <div
                    className={`absolute aspect-square h-[70%] rounded-[50%] border-[.2rem] border-white bg-[red] ${
                      i === 0 ? "left-0" : ""
                    } ${i === 1 ? "left-[2rem]" : ""} ${
                      i === 2 ? "left-[4rem]" : ""
                    }`}
                  ></div>
                ) : (
                  ""
                ),
              )}
              <a
                href="#"
                className="fa fa-plus absolute left-[9rem] flex aspect-square h-[70%] items-center justify-center rounded-[50%] border-[.2rem] border-dashed border-gray-500 text-[130%] font-normal text-gray-500"
              ></a>
            </div>
            <div className="grow text-center">
              <p className="font-bold text-gray-600">{conversation?.Title}</p>
              {participants?.find((item) => item.ContactId !== auth.id)?.Contact
                .IsOnline ? (
                <p className="text-blue-500">Online</p>
              ) : (
                <p className="text-gray-400">
                  Last seen{" "}
                  {moment(
                    participants?.find((item) => item.ContactId !== auth.id)
                      ?.Contact.LastLogout,
                  ).format("DD/MM HH:mm")}
                </p>
              )}
            </div>
            <div className="flex grow justify-end gap-[1rem]">
              <div className="fa fa-search self-center font-normal text-gray-500"></div>
              <div
                ref={refChatboxOption}
                className="relative flex cursor-pointer items-center gap-[.3rem]"
              >
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div
                  ref={refChatboxOptionMenu}
                  className="absolute right-0 top-[120%] flex w-[15rem] origin-top scale-y-0 flex-col rounded-2xl bg-gray-200 py-[1rem] duration-[.5s] [&>*]:text-gray-500"
                >
                  <span
                    className="pl-[1rem] hover:bg-gray-300"
                    onClick={handleUpdateTitle}
                  >
                    Update title
                  </span>
                </div>
              </div>
              <div
                ref={refToggleInformation}
                onClick={toggleInformation}
                className="fa fa-arrow-right flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem] bg-gray-300 font-normal text-gray-500"
              ></div>
            </div>
          </div>
          <div
            ref={refChatContent}
            className="hide-scrollbar my-[2rem] flex flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
          >
            {messages?.map((date) => (
              <>
                <div
                  className="flex items-center text-center text-gray-400
                                  before:mr-[2rem] before:h-[.1rem] before:grow before:bg-gray-400
                                  after:ml-[2rem] after:h-[.1rem]  after:grow after:bg-gray-400"
                >
                  {moment(date.Date).format("DD/MM/YYYY")}
                </div>
                {date.Messages.map((message) => (
                  <div className="flex items-center gap-[2rem]">
                    <div className="aspect-square w-[5rem] self-start rounded-[50%] bg-orange-400"></div>
                    <div className="flex w-full flex-col">
                      <div className="flex items-center gap-[1rem]">
                        <h1 className="font-semibold">
                          {message.ContactId === auth.id
                            ? "You"
                            : participants?.find(
                                (item) => item.ContactId === message.ContactId,
                              )?.Contact.Name}
                        </h1>
                        {participants?.find(
                          (item) => item.ContactId === message.ContactId,
                        )?.IsModerator ? (
                          <div className="rounded-[.8rem] bg-orange-400 px-[.5rem] py-[.1rem] text-[var(--text-morderator-color)]">
                            Moderator
                          </div>
                        ) : (
                          ""
                        )}
                        <p className="text-blue-400">
                          {moment(message.CreatedTime).format("HH:mm")}
                        </p>
                        <img
                          src="../src/img/double-check.svg"
                          className="w-[2rem]"
                        ></img>
                      </div>
                      <p className=" text-gray-400">{message.Content}</p>
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="flex w-full  items-center justify-evenly rounded-[1rem] bg-white py-[.5rem]">
          <div className="flex grow items-center justify-evenly">
            <input
              multiple
              type="file"
              className="fa fa-image hidden font-normal text-gray-500"
              id="choose-image"
              onChange={chooseFile}
            ></input>
            <label
              for="choose-image"
              className="fa fa-image cursor-pointer font-normal text-gray-500"
            ></label>
            <label
              for="choose-image"
              className="fa fa-file cursor-pointer font-normal text-gray-500"
            ></label>
          </div>
          {files.length !== 0 ? (
            <div className="flex h-full flex-wrap items-center gap-[1rem] rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] py-[.5rem] laptop:w-[40rem] desktop:w-[80rem]">
              {files.map((item) => (
                <div className="relative rounded-[.8rem] border-[.1rem] border-gray-300 px-[.5rem]">
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    className="absolute right-[-.5rem] top-[-.5rem] aspect-square w-[1rem] cursor-pointer rounded-[50%] bg-red-500"
                  ></span>
                  {item.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="grow-[2]">
              <input
                ref={refChatInput}
                type="text"
                placeholder="Write some text"
                className="w-full rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] py-[.5rem] focus:outline-none"
                onKeyDown={handlePressKey}
              ></input>
            </div>
          )}
          <div className="flex h-full grow items-center justify-center laptop:max-h-[3.5rem] desktop:max-h-[4.5rem]">
            <div
              className="fa fa-paper-plane flex aspect-square h-full cursor-pointer items-center justify-center rounded-[.8rem] bg-blue-500 text-[90%] font-normal text-white"
              onClick={sendMessage}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbox;
