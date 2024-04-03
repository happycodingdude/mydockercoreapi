import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchFriends } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AddButton = (props) => {
  const { id, onClose, className } = props;

  const auth = useAuth();
  const { reFetchRequestById } = useFetchFriends();

  const addFriend = () => {
    HttpRequest({
      method: "post",
      url: `api/friends?includeNotify=true`,
      token: auth.token,
      data: {
        ContactId1: auth.user.Id,
        ContactId2: id,
        Status: "request",
      },
    }).then((res) => {
      reFetchRequestById(res.Id);
      onClose();
    });
  };

  return (
    <CustomButton
      title="Add"
      className={`${className ?? ""} fa fa-user-plus`}
      onClick={addFriend}
    />
  );
};

export default AddButton;
