import React from "react";
import "./AllFriends.css";
import { Avatar } from "@material-ui/core";

function AllFriends({ friendsList }) {
  console.log(friendsList);
  return (
    <div className="allFriends">
      {friendsList.map((friend) => (
        <div className="friendComponent__container">
          <Avatar src="" />
          {friend.first_name + friend.last_name}
        </div>
      ))}
    </div>
  );
}

export default AllFriends;
