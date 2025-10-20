import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const LazyRender = props => {
  const { children, placeholderHeight = 200, rootMargin = '400px' } = props;
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
      }
    );

    const pRef = placeholderRef.current;
    if (pRef) {
      observer.observe(pRef);
    }

    return () => {
      if (pRef) {
        observer.unobserve(pRef);
      }
    };
  }, [rootMargin]);

  return isVisible ? (
    children
  ) : (
    <div ref={placeholderRef} style={{ minHeight: `${placeholderHeight}px` }} />
  );
};

LazyRender.propTypes = {
  children: PropTypes.node.isRequired,
  placeholderHeight: PropTypes.number,
  rootMargin: PropTypes.string,
};

export default LazyRender;
