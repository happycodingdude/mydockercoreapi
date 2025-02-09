import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "react-toastify";
import refreshToken from "../features/authentication/services/refreshToken";
import { HttpRequest } from "../types";

axiosRetry(axios, {
  retries: 1,
  retryCondition: (error) => {
    if (
      error.config.url !== import.meta.env.VITE_ENDPOINT_REFRESH &&
      error.response?.status === 401 &&
      localStorage.getItem("refreshToken")
    ) {
      return refreshToken({
        userId: localStorage.getItem("userId"),
        refreshToken: localStorage.getItem("refreshToken"),
      })
        .then((res) => {
          // Update the failed request's config with the new token
          error.config.headers["Authorization"] = "Bearer " + res.accessToken;

          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);
          localStorage.setItem("userId", res.userId);

          // Retry the request
          return true;
        })
        .catch((err) => {
          console.error("Failed to refresh token:", err);

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");

          // Navigate back to the login page
          window.location.href = "/auth";
          return false;
        });
    }
    return false; // No retry if condition not met
  },
});

const HttpRequest = async <TReq = undefined, TRes = undefined>(
  req: HttpRequest<TReq, TRes>,
) => {
  // if (timeout !== 0) await delay(timeout);

  return await axios<TRes | undefined>({
    method: req.method,
    baseURL: import.meta.env.VITE_ASPNETCORE_CHAT_URL,
    url: req.url,
    data: req.data,
    headers: {
      ...{
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
      ...req.headers,
    },
    // signal: req.controller.signal,
    // transformResponse: [(data) => {
    //   try {
    //     return JSON.parse(data);
    //   } catch {
    //     return data;
    //   }
    // }],
    // transformResponse: (r: TRes) => r
  })
    .then((res) => {
      if (req.alert) toast.success("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      if (req.alert) toast.error("👨‍✈️ Mission failed!");
      throw err;
    });
};

export default HttpRequest;
