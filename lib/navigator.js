import React, { Component } from 'react';
import { Platform } from 'react-native';
import EventEmitter from './event-emitter';
import { defaultTransitionProps, createScreen, styleHiddenScreen, styleAbsoluteFillObject } from './screen';
import { runTransition } from './transition';
import AnimationView from './animation-view';
import SwipeRecognizer from './swipe';

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

class NavigatorScreen extends React.Component {
  shouldComponentUpdate = (nextProps) => {
    return this.props.isActive !== nextProps.isActive;
  };

  render() {
    const { screen: Screen } = this.props;
    return (
      <Screen
        navigator={this.props.navigator}
        navigationProps={this.props.props}
        isActiveScreen={this.props.isActive}
        animationScreen={this.props.animation || 0}
      />
    );
  }
}

export default class Navigator extends Component {
  static defaultProps = {
    initialScreen: null,
    screens: {},
    isEnableSwipe: Platform.OS === 'ios',
  };

  state = {
    stack: [createScreen({ screen: this.props.initialScreen || Object.keys(this.props.screens)[0] })],
  };
  inTransition = false;
  renderedScreens = {};

  constructor(props) {
    super(props);
    if (this.props.navigatorRef) {
      this.props.navigatorRef.current = this.navigator;
    }
  }

  handleRef = (stackItem) => {
    return (ref) => {
      this.renderedScreens[stackItem.uuid] = ref;
    };
  };

  setAsyncState = (state) => new Promise((resolve) => this.setState(state, resolve));

  updateStack = (stack) => this.setAsyncState({ stack });

  navigatorAction = async (action) => {
    if (this.inTransition) {
      return false;
    }
    this.inTransition = true;
    await action();
    this.inTransition = false;
    return true;
  };

  getAnimationScreens = (transitionConfig) => {
    const { stack } = this.state;
    const screenPrev = stack[stack.length - 2];
    const screenNext = stack[stack.length - 1];
    const transitionProps = { ...screenNext.transitionProps, ...(transitionConfig || {}) };

    return [
      {
        getView: () => this.renderedScreens[screenPrev.uuid],
        transitionProps,
        reverse: false,
      },
      {
        getView: () => this.renderedScreens[screenNext.uuid],
        transitionProps,
        reverse: true,
      },
    ];
  };

  emitEvent = (eventName, current, next) => {
    this.navigator.events.emit(eventName, {
      prev: { name: current.screen, props: current.props },
      next: { name: next.screen, props: next.props },
    });
  };

  navigator = {
    events: new EventEmitter(),
    _activeGestureStatus: true,

    getStackLength: () => {
      return this.state.stack.length;
    },

    setGestureStatus: (status) => {
      this.navigator._activeGestureStatus = status;
    },

    getActiveScreenParams: () => {
      const topScreen = this.state.stack[this.state.stack.length - 1];
      return { name: topScreen.screen, props: topScreen.props };
    },

    goBack: async (count = 1, transitionConfig = {}) => {
      if (typeof count === 'object') {
        transitionConfig = count;
        count = 1;
      }
      return this.navigatorAction(async () => {
        const { stack } = this.state;
        if (stack.length <= count) {
          return;
        }
        const screenPrev = stack[stack.length - (count + 1)];
        const screenNext = stack[stack.length - 1];
        this.emitEvent('back', screenNext, screenPrev);
        await this.setAsyncState({ needShowId: screenPrev.uuid });
        const transitionProps = { ...screenPrev.transitionProps, ...(transitionConfig || {}) };
        await runTransition([
          {
            getView: () => this.renderedScreens[screenPrev.uuid],
            transitionProps,
            reverse: false,
          },
          {
            getView: () => this.renderedScreens[screenNext.uuid],
            transitionProps,
            reverse: true,
          },
        ]);
        await this.setAsyncState({ needShowId: null });
        await this.updateStack([...stack.slice(0, -count)]);
      });
    },

    push: async (screenId, props, transitionConfig) => {
      if (!this.props.screens[screenId]) {
        console.warn('Screen ID not found', screenId);
        return;
      }
      return this.navigatorAction(async () => {
        const { stack } = this.state;

        const screenNext = createScreen({ screen: screenId, props, transitionProps: transitionConfig });
        const transitionProps = { ...screenNext.transitionProps };
        const screenPrev = stack[stack.length - 1];

        if (transitionProps.animation === 'none') {
          screenNext.transitionProps.animation = defaultTransitionProps.animation;
        }

        await this.updateStack([...stack, screenNext]);

        if (transitionConfig && transitionConfig.preload) {
          await sleep(transitionConfig.preload);
          screenNext.preload = false;
          await this.updateStack([...stack, screenNext]);
        }

        this.emitEvent('go', screenPrev, screenNext);
        await runTransition([
          {
            getView: () => this.renderedScreens[screenPrev.uuid],
            transitionProps,
            reverse: true,
          },
          {
            getView: () => this.renderedScreens[screenNext.uuid],
            transitionProps,
            reverse: false,
          },
        ]);
      });
    },

    resetFrom: async (...args) => {
      const status = await this.navigator.push(...args);
      if (status !== false) {
        this.updateStack([this.state.stack[this.state.stack.length - 1]]);
      }
    },

    replace: async (...args) => {
      const status = await this.navigator.push(...args);
      if (status !== false) {
        this.state.stack.splice(this.state.stack.length - 2, 1);
        this.updateStack([...this.state.stack]);
      }
    },
  };

  onBackSwipeSilent = () => {
    return this.navigatorAction(async () => {
      const { stack } = this.state;
      const screenPrev = stack[stack.length - 1];
      const screenNext = stack[stack.length - 2];
      this.emitEvent('back', screenPrev, screenNext);
      await this.updateStack([...this.state.stack.slice(0, -1)]);
    });
  };

  checkActiveBack = () => {
    if (this.props.isEnableSwipe === false) {
      return false;
    }
    if (this.navigator._activeGestureStatus === false) {
      return false;
    }
    return this.state.stack.length > 1;
  };

  renderScreen = (stackItem, index) => {
    const { stack, needShowId } = this.state;
    const screen = this.props.screens[stackItem.screen];
    const topScreen = stack[stack.length - 1];
    const isActive = stackItem.uuid === topScreen.uuid;
    let st = index < stack.length - 2 && needShowId !== stackItem.uuid ? styleHiddenScreen : styleAbsoluteFillObject;
    if (isActive && topScreen.preload) {
      st = styleHiddenScreen;
    }
    const pointerEvents = !isActive || this.state.inTransition ? 'none' : undefined;
    if (!screen) {
      return null;
    }
    return (
      <AnimationView key={stackItem.uuid} style={st} pointerEvents={pointerEvents} ref={this.handleRef(stackItem)}>
        <NavigatorScreen isActive={isActive} navigator={this.navigator} props={stackItem.props} screen={screen} />
      </AnimationView>
    );
  };

  render = () => {
    const screens = this.getAnimationScreens();
    return (
      <SwipeRecognizer hasActiveBack={this.checkActiveBack} onSwipeBack={this.onBackSwipeSilent} screens={screens}>
        {this.state.stack.map(this.renderScreen)}
        {React.Children.map(this.props.children, (child) => {
          return React.cloneElement(child, {
            navigator: this.navigator,
          });
        })}
      </SwipeRecognizer>
    );
  };
}
