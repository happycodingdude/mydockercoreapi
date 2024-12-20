import axios from "axios";
// import axiosRetry from "axios-retry";
import { toast } from "react-toastify";

// axiosRetry(axios, {
//   retries: 1,
//   retryCondition: async (error) => {
//     if (
//       !(error.config.url === import.meta.env.VITE_ENDPOINT_REFRESH) &&
//       error.response.status === 401 &&
//       localStorage.getItem("refresh")
//     ) {
//       const newToken = await refreshToken();
//       error.config.headers["Authorization"] = "Bearer " + newToken;
//       return true;
//     }
//     return false;
//   },
// });

const delay = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const HttpRequest = async ({
  method,
  url,
  header = {},
  data = null,
  controller = new AbortController(),
  alert = false,
  timeout = 0,
}) => {
  if (timeout !== 0) await delay(timeout);

  return await axios({
    method: method,
    url: url,
    data: data,
    headers: {
      ...{
        "Content-Type": "application/json",
        // Authorization: "Bearer " + localStorage.getItem("token"),
      },
      ...header,
    },
    signal: controller.signal,
  })
    .then((res) => {
      if (alert) toast.success("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      if (alert) toast.error("👨‍✈️ Mission failed!");
      throw err;
    });
};

// const refreshToken = () => {
//   return axios({
//     method: "post",
//     url: import.meta.env.VITE_ENDPOINT_REFRESH,
//     data: {
//       refreshToken: localStorage.getItem("refresh"),
//     },
//   }).then((res) => {
//     localStorage.setItem("token", res.data.accessToken);
//     localStorage.setItem("refresh", res.data.refreshToken);
//     return res.data.accessToken;
//   });
// };

export const generateContent = (contacts, text) => {
  if (contacts?.some((item) => text.includes(`@${item.ContactId}`))) {
    contacts.map((item) => {
      text = text.replace(
        `@${item.ContactId}`,
        `<span className="text-blue-400 cursor-pointer">${item.Name}</span>`,
      );
    });
    return parse(text);
  }
  return text;
};

export const blurImage = (containerClass) => {
  let observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          // await delay();
          // entry.target.src = entry.target.dataset.src;
          entry.target.style.backgroundImage =
            "url('" + entry.target.dataset.src + "')";
          // entry.target.classList.add("loaded");

          // Find the previous sibling with the 'loading' class
          let sibling = entry.target.previousElementSibling;

          if (sibling && sibling.classList.contains("loading")) {
            sibling.style.opacity = 0;
          }

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  // function delay() {
  //   return new Promise((resolve) => setTimeout(resolve, 3000));
  // }

  const container = document.querySelector(containerClass);
  if (!container) return;
  const images = container.querySelectorAll(".lazy-image");
  images.forEach((img) => {
    observer.observe(img);
  });
};

export const blurImageOLD1 = (containerClass) => {
  const container = document.querySelector(containerClass);
  const blurredDivs = container.querySelectorAll(".blurred-div");
  blurredDivs.forEach(async (div) => {
    // await delay();
    // if (div.classList.contains("loaded")) return;
    const img = div.querySelector("img");
    if (img.complete) {
      loaded();
    } else {
      img.addEventListener("load", loaded);
    }
    function loaded() {
      div.classList.add("loaded");
    }

    function delay() {
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
  });
};

export const blurImageOld = (containerClass) => {
  // setTimeout(() => {

  // Duyệt tất cả tấm ảnh cần lazy-load
  const container = document.querySelector(containerClass);
  const lazyBackgrounds = container.querySelectorAll(".lazy-image");

  // Chờ các tấm ảnh này xuất hiện trên màn hình
  const lazyImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      // Tấm ảnh này đã xuất hiện trên màn hình
      if (entry.isIntersecting) {
        const lazyImage = entry.target;

        // Nếu ảnh đã hiển thị rồi thì bỏ qua
        // if (!lazyImage.classList.contains("blurred")) {
        //   observer.unobserve(lazyImage);
        //   return;
        // }

        const src = lazyImage.dataset.src;

        lazyImage.tagName.toLowerCase() === "img"
          ? // <img>: copy data-src sang src
            (lazyImage.src = src)
          : // <div>: copy data-src sang background-image
            (lazyImage.style.backgroundImage = "url('" + src + "')");

        // Copy xong rồi thì bỏ class 'blurred' đi để hiển thị
        lazyImage.classList.remove("blurred");

        // Job done, không cần observe nó nữa
        observer.unobserve(lazyImage);
      }
    });
  });

  // Observe từng tấm ảnh và chờ nó xuất hiện trên màn hình
  lazyBackgrounds.forEach((lazyImage) => {
    lazyImageObserver.observe(lazyImage);
  });

  // }, 500);
};

export const findChat = (contact, conversations) => {
  const existedConversation = conversations.conversations.find(
    (item) =>
      item.isGroup === false &&
      item.participants.some((item) => item.contact.id === contact.id),
  );
  if (existedConversation) {
    queryClient.setQueryData(["conversation"], (oldData) => {
      return { ...oldData, selected: existedConversation.id };
    });
  } else {
    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
        "{contact-id}",
        contact.id,
      ),
    }).then((res) => {
      queryClient.setQueryData(["conversation"], (oldData) => {
        return {
          ...oldData,
          conversations: [
            {
              isGroup: false,
              isNotifying: true,
              id: res.data,
              participants: [
                {
                  contact: {
                    id: info.data.id,
                    name: info.data.name,
                    avatar: info.data.avatar,
                    isOnline: true,
                  },
                },
                {
                  contact: {
                    id: contact.id,
                    name: contact.name,
                    avatar: contact.avatar,
                    isOnline: contact.isOnline,
                  },
                },
              ],
            },
            ...oldData.conversations,
          ],
          selected: res.data,
        };
      });
    });
  }
};
