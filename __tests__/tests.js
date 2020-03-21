import React from 'react';
import renderer from 'react-test-renderer';
import { View } from 'react-native';

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

import Navigator, {
  AndroidBackHandler,
  useNavigator,
  withNavigator,
  setDefaultScreenStyle,
  setNavigatorCustomAnimations,
  setNavigatorDefaultParams,
} from '../lib/index';

describe('Check create Navigator instance', () => {
  test('without props', () => {
    renderer.create(<Navigator />);
  });
  test('with empty screens props', () => {
    renderer.create(<Navigator screens={{}} />);
  });
  test('with empty initialScreen props', () => {
    renderer.create(<Navigator screens={{}} initialScreen="" />);
  });
});

describe('Utility is functions', () => {
  test('setDefaultScreenStyle', () => expect(typeof setDefaultScreenStyle).toEqual('function'));
  test('setNavigatorCustomAnimations', () => expect(typeof setNavigatorCustomAnimations).toEqual('function'));
  test('setNavigatorDefaultParams', () => expect(typeof setNavigatorDefaultParams).toEqual('function'));
});

describe('Check create Navigator methods', () => {
  const nav = renderer.create(<Navigator screens={{}} />);
  const inst = nav.toTree().rendered.instance;

  test('has push', () => expect(typeof inst.navigator.push).toEqual('function'));
  test('has replace', () => expect(typeof inst.navigator.replace).toEqual('function'));
  test('has resetFrom', () => expect(typeof inst.navigator.resetFrom).toEqual('function'));
  test('has goBack', () => expect(typeof inst.navigator.goBack).toEqual('function'));
  test('has getStackLength', () => expect(typeof inst.navigator.getStackLength).toEqual('function'));
  test('has setGestureStatus', () => expect(typeof inst.navigator.setGestureStatus).toEqual('function'));
  test('has getActiveScreenParams', () => expect(typeof inst.navigator.getActiveScreenParams).toEqual('function'));
  test('has events', () => expect(typeof inst.navigator.events).toEqual('object'));
});

describe('Check withNavigator', () => {
  const WithNavComponent = withNavigator(props => {
    return <View {...props} />;
  });
  const comp = renderer.create(<WithNavComponent />);
  const inst = comp.toTree().rendered;
  test('has prop navigator', () => expect(typeof inst.props.navigator).toEqual('object'));
  test('has prop screenParams', () => expect(typeof inst.props.screenParams).toEqual('object'));
  test('has normal renderer View', () => expect(inst.rendered.rendered.type).toEqual('View'));
});

describe('Check useNavigator', () => {
  const UseNavComponent = props => {
    const [navigator, screenParams] = useNavigator();
    navigator.getActiveScreenParams();
    return <View {...props} screenParams={screenParams} />;
  };

  const comp = renderer.create(<UseNavComponent />);
  const inst = comp.toTree().rendered;
  test('has normal renderer View', () => expect(inst.rendered.type).toEqual('View'));
  test('has normal use screenParams', () => expect(typeof inst.props.screenParams).toEqual('object'));
  test('has normal use props', () => expect(typeof inst.props.screenParams.props).toEqual('object'));
  test('has normal use name', () => expect(inst.props.screenParams.name).toEqual(null));
});

describe('Check AndroidBackHandler', () => {
  const handler = renderer.create(<AndroidBackHandler />);
  test('back handler render null', () => expect(handler.toJSON()).toEqual(null));
});

describe('Check simple flow', () => {
  const PageOne = () => <View>Page One</View>;
  const PageTwo = () => <View>Page Two</View>;
  const PageThree = () => <View>Page Three</View>;

  const screens = { PageOne, PageTwo, PageThree };
  const nav = renderer.create(<Navigator screens={screens} />);
  const inst = nav.toTree().rendered.instance;

  test('init stack is one', () => {
    expect(inst.state.stack.length).toEqual(1);
  });

  test('stack is two', async () => {
    await inst.navigator.push('PageTwo');
    expect(inst.state.stack.length).toEqual(2);
  });

  test('stack is three', async () => {
    await inst.navigator.push('PageThree');
    expect(inst.state.stack.length).toEqual(3);
  });

  test('check go back', async () => {
    await inst.navigator.goBack();
    expect(inst.state.stack.length).toEqual(2);
  });

  test('check go replace', async () => {
    await inst.navigator.replace('PageThree');
    expect(inst.state.stack.length).toEqual(2);
  });

  test('check go resetFrom', async () => {
    await inst.navigator.resetFrom('PageThree');
    expect(inst.state.stack.length).toEqual(1);
  });
});
