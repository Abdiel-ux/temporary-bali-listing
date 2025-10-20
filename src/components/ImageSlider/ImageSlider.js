import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import useDisableBodyScrollOnSwipe from '../../util/useDisableBodyScrollOnSwipe';
import styles from './ImageSlider.module.css';
import classNames from 'classnames';

const EAGERLOADED_IMAGES = 1;

const ImageSlider = ({ images, title, loop, className, children, buttonSize = 'medium' }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop });
  const setSliderNode = useDisableBodyScrollOnSwipe();

  const emblaViewportRef = useCallback(
    node => {
      emblaRef(node);
      if (node) {
        setSliderNode(node);
      }
    },
    [emblaRef, setSliderNode]
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  const showArrows = loop || prevBtnEnabled || nextBtnEnabled;

  const slides = children
    ? React.Children.map(children, (child, index) => (
        <div className={styles.embla__slide} key={index}>
          {child}
        </div>
      ))
    : images.map((img, imgIdx) => (
        <div className={styles.embla__slide} key={imgIdx}>
          {imgIdx === 0 || isClient ? (
            <img
              src={img}
              alt={title}
              className={styles.image + ' ' + styles.imageFade}
              loading={
                isClient
                  ? Math.abs(imgIdx - selectedIndex) <= EAGERLOADED_IMAGES
                    ? 'eager'
                    : 'lazy'
                  : 'eager'
              }
            />
          ) : (
            <div className={styles.image + ' ' + styles.imageFade} />
          )}
        </div>
      ));

  const imageCount = children ? React.Children.count(children) : images.length;

  return (
    <div className={classNames(styles.embla, className)}>
      <div className={styles.embla__viewport} ref={emblaViewportRef}>
        <div className={styles.embla__container}>{slides}</div>
      </div>

      {showArrows && prevBtnEnabled && (
        <button
          className={classNames(styles.arrowLeft, styles[buttonSize])}
          type="button"
          aria-label="Previous image"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            scrollPrev();
          }}
        >
          <BsChevronLeft />
        </button>
      )}
      {showArrows && nextBtnEnabled && (
        <button
          className={classNames(styles.arrowRight, styles[buttonSize])}
          type="button"
          aria-label="Next image"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            scrollNext();
          }}
        >
          <BsChevronRight />
        </button>
      )}

      <div className={styles.dots}>
        {imageCount > 1 ? (
          <span className={styles.dotsCounter}>
            {selectedIndex + 1}/{scrollSnaps.length}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ImageSlider;
