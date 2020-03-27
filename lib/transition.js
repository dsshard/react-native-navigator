import { Dimensions } from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const defaultAnimations = {
  none: [
    (anim) => ({
      opacity: anim,
    }),
  ],

  fade: [
    (anim) => ({
      opacity: anim,
    }),
  ],

  flip: [
    (anim) => ({
      opacity: anim,
      transform: [
        {
          rotateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '-180deg'],
          }),
        },
      ],
    }),

    (anim) => ({
      transform: [
        {
          rotateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['-180deg', '0deg'],
          }),
        },
      ],
    }),
  ],

  zoom: [
    (anim) => ({
      opacity: anim,
      transform: [
        {
          scale: anim,
        },
      ],
    }),

    (anim) => ({
      transform: [
        {
          scale: anim,
        },
      ],
    }),
  ],

  left: [
    (anim) => ({
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0],
          }),
        },
      ],
      opacity: anim,
    }),
    (anim) => ({
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-windowWidth, 0],
          }),
        },
      ],
    }),
  ],

  right: [
    (anim) => ({
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-40, 0],
          }),
        },
      ],
      opacity: anim,
    }),
    (anim) => ({
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [windowWidth, 0],
          }),
        },
      ],
    }),
  ],

  top: [
    (anim) => ({
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-windowHeight, 0],
          }),
        },
      ],
    }),
  ],

  bottom: [
    (anim) => ({
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [windowHeight, 0],
          }),
        },
      ],
    }),
  ],
};

export function getAnimationByScreenAndIndex(screen, index) {
  const list = defaultAnimations[screen.transitionProps.animation];
  const { duration, easing } = screen.transitionProps;

  return {
    reverse: screen.reverse,
    duration: screen.transitionProps.animation === 'none' ? 0 : duration,
    animation: list[index] || list[0],
    easing,
  };
}

export const runTransition = (screens) => {
  const promises = screens
    .map((screen, index) => screen.getView().transition(getAnimationByScreenAndIndex(screen, index)))
    .filter(Boolean);
  return Promise.all(promises);
};
