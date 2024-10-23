import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";

const AddButton = (props) => {
  const { id, onClose, className } = props;

  const [processing, setProcessing] = useState(false);

  const addFriend = () => {
    setProcessing(true);
    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_ADD.replace(
        "{contact-id}",
        id,
      ),
    }).then((res) => {
      onClose(res.data);
    });
  };

  return (
    <CustomButton
      title="Add"
      className={`${className} laptop:!w-[6rem]`}
      onClick={addFriend}
      processing={processing}
    />
  );
};

export default AddButton;
