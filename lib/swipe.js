import { Dimensions, PanResponder, View } from 'react-native';
import React from 'react';
import { getAnimationByScreenAndIndex } from './transition';

const offsetTouchStart = 30;
const { width } = Dimensions.get('window');
const directionalOffsetThreshold = width / 3;

let startX = 0;

export default class IOSSwipeRecognizer extends React.Component {
  constructor(props) {
    super(props);
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const isVerticalSwipe = Math.sqrt(Math.pow(gestureState.dx, 2) < Math.pow(gestureState.dy, 2));
        if (isVerticalSwipe) {
          return false;
        }
        return Math.sqrt(Math.pow(gestureState.dx, 2) + Math.pow(gestureState.dy, 2)) > 10;
      },
      onPanResponderRelease: this.finish,
      onPanResponderTerminate: this.finish,
      onPanResponderStart: (event, gesture) => {
        startX = gesture.x0;
      },
      onPanResponderMove: (event, gesture) => {
        const isSingleTouch = event.nativeEvent.touches.length === 1;
        // limit left position
        if (startX > offsetTouchStart) {
          return;
        }

        if (!props.hasActiveBack() || !isSingleTouch) {
          return;
        }

        const position = Math.max(Math.min(gesture.dx / windowWidth, 1), 0); // 0..1
        // move screen position
        this.props.screens
          .map((screen, index) => screen.getView().move(getAnimationByScreenAndIndex(screen, index), position))
          .filter(Boolean);
      },
    });
  }

  finish = async (event, gesture) => {
    if (!this.props.hasActiveBack()) {
      return;
    }
    if (startX > offsetTouchStart) {
      return;
    }
    const position = Math.max(Math.min(gesture.dx / width, 1), 0); // 0..1
    const isBack = position * width > directionalOffsetThreshold;
    // start swipe & fixed animations view
    if (isBack) {
      await Promise.all(
        this.props.screens
          .map((screen, index) => screen.getView().fixed(getAnimationByScreenAndIndex(screen, index)))
          .filter(Boolean),
      );
      this.props.onSwipeBack();
      return;
    }
    // return to initial position
    if (position > 0.001) {
      this.props.screens
        .map((screen, index) => screen.getView().restore(getAnimationByScreenAndIndex(screen, index), position))
        .filter(Boolean);
    }
  };

  render = () => {
    return (
      <View style={{ flex: 1 }} {...this.panResponder.panHandlers}>
        {this.props.children}
      </View>
    );
  };
}
