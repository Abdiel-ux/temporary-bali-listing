import React, { useEffect } from "react";  // ← tambahkan useEffect di sini
import "./Faq.css";
import logo from "./logo.png";
import arrow from "./arrow.png";

const Faq = ({ onBack }) => {
  const faqData = [
    {
      question: "Lorem Ipsum Is Simple dummy text 1",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
    {
      question: "Lorem Ipsum Is Simple dummy text 2",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
    {
      question: "Lorem Ipsum Is Simple dummy text 3",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
    {
      question: "Lorem Ipsum Is Simple dummy text 4",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
    { 
      question: "Lorem Ipsum Is Simple dummy text 5",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
  ];  

  useEffect(() => {
    const details = document.querySelectorAll(".faq-content details");

    details.forEach((targetDetail) => {
      targetDetail.addEventListener("toggle", () => {
        if (targetDetail.open) {
          details.forEach((detail) => {
            if (detail !== targetDetail) {
              detail.removeAttribute("open");
            }
          });
        }
      });
    });
  }, []);

  return (
    <div className="faq-container">
      {/* Header */}
      <div className="faq-header">
        <div className="logo">
          <img src={logo} alt="Logo" />
          <span>Bali Listings</span>
        </div>
        <div className="title">FAQ</div>
      </div>

      {/* FAQ Accordion (scrollable) */}
      <div className="faq-content">
        {faqData.map((item, idx) => (
          <details key={idx}>
            <summary>
              {item.question}
              <img src={arrow} className="arrow" alt="arrow" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>

      {/* Footer */}
      <div className="faq-footer">
        <a href="#">View all FAQs</a>
      </div>

      {/* Tombol back ke HelpWidget */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            fontSize: "12px",
            marginBottom: "15px",
            background: "transparent",
            border: "none",
            color: "#EB2BE8",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default Faq;
