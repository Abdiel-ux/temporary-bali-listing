import React, { useState } from "react";
import styles from "./HelpWidget.module.css";

import Logo from "./img/logo.png";
import Person1 from "./img/person1.png";
import Person2 from "./img/person2.png";
import Person3 from "./img/person3.png";
import FaqIcon from "./img/faq.png";
import MessageIcon from "./img/message.png";

import Faq from "./Faq";
import Message from "./Message";

const HelpWidget = () => {
  const [showFaq, setShowFaq] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  if (showFaq) {
    return <Faq onBack={() => setShowFaq(false)} />;
  }

  if (showMessage) {
    return <Message onBack={() => setShowMessage(false)} />;
  }

  return (
    <div className={styles.hlWidget}>
      <div className={styles.hlLogo}>
        <img className={styles.hlLogoImg} src={Logo} alt="Logo Bali Listings" />
        <div className={styles.hlLogoText}>Bali Listings</div>
      </div>

      <div className={styles.hlAvatars}>
        <img
          className={styles.hlAvatar}
          style={{ position: "relative", zIndex: 3 }}
          src={Person1}
          alt="Person 1"
        />
        <img
          className={styles.hlAvatar}
          style={{ position: "relative", zIndex: 2 }}
          src={Person2}
          alt="Person 2"
        />
        <img
          className={styles.hlAvatar}
          style={{ position: "relative", zIndex: 1 }}
          src={Person3}
          alt="Person 3"
        />
      </div>

      <h2 className={styles.hlTitle}>How can we help ?</h2>

      <div
        className={styles.hlOption}
        role="button"
        tabIndex={0}
        onClick={() => setShowFaq(true)}
      >
        <div style={{ textAlign: "left" }}>
          <strong>Frequently asked questions</strong>
          <div className={styles.hlOptionSub}>We are here to help.</div>
        </div>
        <img className={styles.hlOptionIcon} src={FaqIcon} alt="FAQ Icon" />
      </div>

      <div
        className={styles.hlOption}
        role="button"
        tabIndex={0}
        onClick={() => setShowMessage(true)}
      >
        <div style={{ textAlign: "left" }}>
          <strong>Send us a message</strong>
          <div className={styles.hlOptionSub}>We are here to help.</div>
        </div>
        <img
          className={styles.hlOptionIcon}
          src={MessageIcon}
          alt="Message Icon"
        />
      </div>
    </div>
  );
};

export default HelpWidget;
