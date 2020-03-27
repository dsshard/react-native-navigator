import { Easing } from 'react-native';

const uuid = () => Math.random().toString(36).substr(2, 9);

export const defaultTransitionProps = {
  animation: 'right',
  duration: 250,
  easing: Easing.bezier(0.42, 0, 0.58, 1),
};

export const styleAbsoluteFillObject = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  flex: 1,
};

export const styleHiddenScreen = {
  width: 0,
  height: 0,
  opacity: 0,
  ...styleAbsoluteFillObject,
};

export const createScreen = (screen) => {
  const screenTransitions = screen.transitionProps || {};
  const properties = {
    props: screen.props || {},
    screen: screen.screen,
    transitionProps: { ...defaultTransitionProps, ...screenTransitions },
  };
  return { uuid: uuid(), ...properties };
};
