// src/components/Message.js
import React, { useState } from "react";
import "./Message.css";

import Logo from "./img/logo.png";
import Person1 from "./img/person1.png";
import UserAvatar from "./img/users.png";
import SendIcon from "./img/send.png";

const Message = () => {
  const [messages, setMessages] = useState([
    {
      sender: "admin",
      avatar: Person1,
      name: "Admin",
      text: "Hello!\nWhat we can help?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() === "") return;

    setMessages([
      ...messages,
      {
        sender: "user",
        avatar: UserAvatar,
        name: "You",
        text: inputValue,
      },
    ]);
    setInputValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-widget">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <img src={Logo} alt="Logo" className="logo" />
          <div className="text-header">Bali Listings</div>
        </div>
        <span>Support</span>
      </div>

      {/* Body */}
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-container ${msg.sender}`}
          >
            <img src={msg.avatar} alt="Avatar" className="avatar" />
            <div className="message-content">
              <div className="message">
                <span
                  className={
                    msg.sender === "admin"
                      ? "username-admin"
                      : "username"
                  }
                >
                  {msg.name}
                </span>
                {msg.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="chat-footer">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Type here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend}>
            <img src={SendIcon} alt="Send" className="send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
