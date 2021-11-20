import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { getAllFriends, getPicture } from "./server/api.js";
import "./CreateChat.css";
import { useStateValue } from "./StateProvider";
import { Avatar } from "@material-ui/core";

function CreateChat() {
  const [friendsList, setFriendsList] = useState([]);
  const [originalList, setOriginalLlist] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [openOptions, setOpenOptions] = useState(true);
  const history = useHistory();
  const [{ user, socket }, dispatch] = useStateValue();
  const [searchSelected, setSearchSelected] = useState(false);
  const searchOptions = useRef();

  const createMessage = (id) => {
    socket.emit("newPrivateChat", {
      senderId: user._id,
      receiverId: id,
    });
  };

  useEffect(async () => {
    const updateOptions = (e) => {
      if (
        searchOptions &&
        searchOptions.current &&
        !searchOptions.current.contains(e.target)
      ) {
        setOpenOptions(false);
      }
    };

    socket?.on("openMessage", (data) => {
      history.push({ pathname: `/t/${data._id}` });
    });

    document.addEventListener("mousedown", updateOptions);

    const allFriends = await getAllFriends(user._id);
    const newList = await Promise.all(
      allFriends.data.map(async (friend) => {
        friend.prof_pic = await getPicture(friend.prof_pic);
        return friend;
      })
    );
    setOriginalLlist(newList);
    setFriendsList(newList);

    return () => {
      document.removeEventListener("mousedown", updateOptions);
    };
  }, []);

  useEffect(() => {
    setFriendsList(
      originalList.filter((friend) =>
        (friend.first_name + " " + friend.last_name)
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      )
    );
  }, [searchInput]);

  return (
    <div className="create__chat">
      To:{" "}
      <div className="createSearch__container">
        <input
          onFocus={() => {
            setOpenOptions(true);
            setSearchSelected(true);
          }}
          onBlur={() => setSearchSelected(false)}
          autoFocus={true}
          placeholder="Type the name of a person"
          className="createSearch__input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
        />
        {(searchSelected || openOptions) && (
          <div className="contacts__list" ref={searchOptions}>
            <h3 className="contact__heading">Contacts</h3>
            {friendsList.map((friend) => (
              <div
                className="friend__container"
                onClick={() => createMessage(friend._id)}
              >
                <Avatar className="create__avatar" src={friend?.prof_pic} />
                <h3>{friend.first_name + " " + friend.last_name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateChat;
