import React, { useState, useEffect } from 'react';
import { defaultTransitionProps, styleAbsoluteFillObject } from './screen';
import { defaultAnimations } from './transition';
import Navigator from './navigator';
import { BackHandler } from 'react-native';

let navigatorRef = React.createRef();

export const setNavigatorDefaultParams = params => {
  Object.assign(defaultTransitionProps, params);
};

export const setNavigatorCustomAnimations = params => {
  Object.assign(defaultAnimations, params);
};

export function setDefaultScreenStyle(styles) {
  Object.assign(styleAbsoluteFillObject, styles);
}

export function useNavigator() {
  const [name, setActiveScreenName] = useState(null);
  const [props, setActiveScreenProps] = useState(null);

  function setActiveScreen({ next }) {
    setActiveScreenProps(next.props);
    setActiveScreenName(next.name || null);
  }

  useEffect(() => {
    const _nav = navigatorRef.current;
    if (!_nav) {
      return;
    }
    setActiveScreen({ next: _nav.getActiveScreenParams() });
    const unsubscribeGo = _nav.events.on('go', setActiveScreen);
    const unsubscribeBack = _nav.events.on('back', setActiveScreen);
    return () => {
      unsubscribeGo();
      unsubscribeBack();
    };
  }, []);

  return [navigatorRef.current, { props, name }];
}

export function withNavigator(WrappedComponent) {
  return function WithNavigator(props) {
    const [navigator, screenParams] = useNavigator();
    const newProps = {
      ...props,
      screenParams: screenParams,
      navigator,
    };
    return <WrappedComponent {...newProps} />;
  };
}

export function AndroidBackHandler() {
  const [navigator] = useNavigator();

  function handleBackAndroid() {
    const isNeedHide = navigator.getStackLength() === 1;
    if (isNeedHide) {
      return false;
    }
    navigator.goBack();
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackAndroid);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackAndroid);
  }, []);

  return null;
}

export default function NavigatorWrapper(props) {
  return <Navigator {...props} navigatorRef={navigatorRef} />;
}
