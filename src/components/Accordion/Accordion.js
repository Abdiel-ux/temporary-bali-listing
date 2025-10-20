import React, { useState, useRef, useLayoutEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import css from './Accordion.module.css';

const Accordion = props => {
  const { items } = props;
  const [activeIndex, setActiveIndex] = useState(null);
  const contentRefs = useRef([]);

  const toggle = index => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useLayoutEffect(() => {
    items.forEach((_, index) => {
      const element = contentRefs.current[index];
      if (element) {
        if (index === activeIndex) {
          element.style.height = element.scrollHeight + 'px';
        } else {
          element.style.height = '0px';
        }
      }
    });
  }, [activeIndex, items]);

  return (
    <div className={css.root}>
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <div className={css.item} key={item.key}>
            <div className={css.title} onClick={() => toggle(index)}>
              {item.title}
              <div className={css.icon}>
                <FaAngleDown
                  className={isActive ? css.rotated : ''}
                />
              </div>
            </div>
            <div 
              ref={el => contentRefs.current[index] = el}
              className={css.contentWrapper}
            >
              <div className={css.content}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
