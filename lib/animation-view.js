import { Animated } from 'react-native';
import React from 'react';

export default class AnimationView extends React.PureComponent {
  state = {
    anim: new Animated.Value(0),
    style: null,
    _animation: null,
  };

  transition = ({ animation, reverse, duration, easing }) => {
    this.state.anim.setValue(reverse ? 1 : 0);
    this.setState({ style: animation(this.state.anim) });

    return new Promise((resolve) => {
      Animated.timing(this.state.anim, {
        toValue: reverse ? 0 : 1,
        duration,
        easing,
        useNativeDriver: true,
      }).start(resolve);
    });
  };

  move = ({ animation, reverse, duration, easing }, position) => {
    if (this.state._animation !== animation) {
      this.setState({ style: animation(this.state.anim), _animation: animation });
    }
    this.state.anim.setValue(reverse ? 1 - position : position);
  };

  fixed = ({ reverse, duration, easing }) => {
    return new Promise((resolve) => {
      Animated.timing(this.state.anim, {
        toValue: reverse ? 0 : 1,
        duration: duration * (1 - Math.abs(this.state.anim.__getValue())),
        easing,
        useNativeDriver: true,
      }).start(resolve);
    });
  };

  restore = ({ animation, reverse, duration, easing }, position) => {
    this.state.anim.setValue(reverse ? 1 - position : position);
    return new Promise((resolve) => {
      Animated.timing(this.state.anim, {
        toValue: reverse ? 1 : 0,
        duration: duration * (1 - Math.abs(position)),
        easing,
        useNativeDriver: true,
      }).start(resolve);
    });
  };

  render = () => {
    const { style, children, pointerEvents } = this.props;
    return (
      <Animated.View pointerEvents={pointerEvents} style={[style, this.state.style]}>
        {React.cloneElement(children, { animation: this.state.anim })}
      </Animated.View>
    );
  };
}
