
### React Native Navigator  
  
Super simple & functionality  
  
## Example 
```javascript  
import { SafeAreaView, StatusBar } from 'react-native';
import Navigator, {  
  useNavigator, 
  setDefaultScreenStyle, 
  setNavigatorDefaultParams, 
  setNavigatorCustomAnimations, 
  withNavigator
} from '@coxy/react-native-navigator';  
  
  
export default () => {  
  const PageOne = () => <View>Page One</View> 
  const PageTwo = () => <View>Page Two</View> 
  const PageThree = () => <View>Page Three</View>
 
  const screens = {  
    PageOne,  
    PageThree,  
    PageTwo,  
  };  
   
  const [navigator, screenParams] = useNavigator();  
  return ( 
    <> 
      <StatusBar barStyle="dark-content" /> 
      <SafeAreaView style={{ flex: 1 }}>  
        <Navigator screens={screens} />  
      </SafeAreaView> 
    </> 
  );
};  
```  

---

### API  
  

#### Navigator Component

Root component for creating navigation

```javascript
const screens = {  
  PageOne,  
  PageThree,  
  PageTwo,  
}; 
<Navigator screens={screens} initialScreen={'PageOne'} />
```  

props:

**screens** - The object which contains all the screens

**initialScreen** - The screen that will be displayed during initialization

**isEnableSwipe** - Default - IOS: true, Android: false
 


#### useNavigator  

For use in functional components. Pass the current screen parameters and Navigator itself to the result of the function.

```javascript  
const [navigator, screenParams] = useNavigator();  
```  
  
```javascript  
navigator = @Navigator  
screenParams = @screenParams  
```  
  

#### withNavigator 

For higher order components. Passes the current navigation parameters and the Navigator itself to the component prop
  
```javascript  
const MenuComponent = withNavigator(props => { 
  const { screenParams, navigator } = props;  
  return <View />
})  
```  
  
```javascript  
navigator = @Navigator  
screenParams = @screenParams
```  
  

#### AndroidBackHandler 

A simple handler for pressing a button back on Android which causes a transition back
  
```javascript  
<AndroidBackHandler />  
```  
  


#### setDefaultScreenStyle  

Sets default styles for the current active screen.

```javascript  
setDefaultScreenStyle({  
  backgroundColor: 'transparent',  
  shadowOpacity: 0.1,  
  shadowRadius: 20,  
  shadowColor: 'black',  
  shadowOffset: { height: 0, width: 0 },  
  height: '100%',   
  flex: 1,  
})  
```  
  

#### setNavigatorCustomAnimations  
Allows you to add custom animations. Each animation is an array, the first element is responsible for the animation of the "leaving" screen, and the second element is for the animation of the screen that appears on the screen.

```javascript  
setNavigatorCustomAnimations({  
  customAnimationName: [  // custom name  
    anim => ({ // animate previews screen  
      transform: [{
        translateX: anim.interpolate({  
          inputRange: [0, 1],  
          outputRange: [-40, 0],  
        }), 
      }],  
      opacity: anim,  
    }),
    
    anim => ({  // animate current screen  
      transform: [{
        translateX: anim.interpolate({  
          inputRange: [0, 1],  
          outputRange: [width, 0],  
        })
      }]
    })
  ]
});  
```  
  

#### setNavigatorDefaultParams  

Allows you to set global animation and transition settings. The argument of the function is an object with parameters (transitionProps which is described below)
```  
setNavigatorDefaultParams(transitionProps);  

transitionProps = @transitionProps
```  


 ---
  
### @Navigator  
  
```navigator.push: Function  (screenId, params, transitionProps)```

> Go to the next screen.

*Flow:*
1. stack prev = [1, 2, 3];  
2. push(4)  
3. stack next = [1, 2, 3, 4];  
   
   

```navigator.replace: Function (screenId, params, transitionProps)```

> Replace current screen

*Flow:*  
1. stack prev = [1, 2, 3];  
2. replace(4)  
3. stack next = [1, 2, 4];  
  



```navigator.goBack: Function (transitionProps)```

> Go back one screen

*Flow:*  
1. stack prev = [1, 2, 3];  
2. goBack()  
3. stack next = [1, 2];  


```navigator.goBack: Function (countScreen, transitionProps)```

> Go back more one screen

*Flow:*  
1. stack prev = [1, 2, 3, 4];  
2. goBack(2)  
3. stack next = [1, 2];  
  

```navigator.resetFrom: Function (screenId, params, transitionProps)```

> Makes an animated transition to the screen and clears the stack. \
> Great for bottom menu navigation.


*Flow:*  
1. stack prev = [1, 2, 3, 4];  
2. resetFrom(2)  
3. stack next = [2];  
  



```navigator.setGestureStatus: Function (Boolean)```

> Allows you to set the status for using the gesture back,
> lock or unlock.

##### example:
```javascript
useEffect(() => {
  props.navigator.setGestureStatus(!props.isActiveScreen);
  return () => {
    props.navigator.setGestureStatus(true);
  };
}, [props.isActiveScreen]);
```
  

```navigator.getStackLength: Function ()```

> Returns current stack length

```navigator.events: EventEmitter (on, off, once, etc..)```

> Allows you to subscribe to transition events between screens. it\
> standard type of EventEmitter'a
  


  
#### Events:  

Currently, only one transition event between the "go" and "back" screens is implemented, which as an argument to the function passes an object with the fields next, prev. next - the screen to which they switched, prev - the screen from which they left.
```
this.props.navigator.events.on('go', ({ 
  next: {
    name,
    props,
  }, 
  prev: {
    name,
    props,
  }
}) => {
  console.log(prev, next)
})  
```

  
  
### @transitionProps  
**animation** - *default* **right** [fade|left|right|none|flip|zoom|top|bottom]  

> The selected animation for the transition, which is set at the beginning or which\
> was installed via * setNavigatorCustomAnimations *

**duration** - *default* **250** [ms]  

> Transition time between screens. Indicated in ms


**easing** - *default* - **Easing.bezier(0.42, 0, 0.58, 1)**  

> Function for animation

---  
  
### Navigator props for screen  
Navigation options that are passed as props to each screen.

```
props: {  
  navigator: @Navigator,  
  isActiveScreen: Boolean,
  navigationProps: Object || null  
  animationScreen: Animated.Value(0...1)  
}
```  
**navigator** = @Navigator

> Navigator object

**isActiveScreen** - Boolean

> Indicates that the selected screen is visible and active.

**navigationProps** - Object | Null

> Passed parameters to the navigation function

**animationScreen** - Animated.Value(0...1)

> Function that can be used for Navigator-dependent animations. \
> For example, when animating a transition, animate the transparency of the header as well.

  
### Example animationScreen  

Dependent Animation Example

```javascript  
  
const PageTwo = props => { 
  const [navigator] = useNavigator();  

  return (
    <Animated.View style={{  
      position: 'absolute',  
      transform: [{  
        translateY: props.animationScreen.interpolate({  
          inputRange: [0, 1],  
          outputRange: [500, 0]  
        }) 
      }],  
      height: 50,  
      width: 50,  
      backgroundColor: 'red'  
    }} 
    /> 
  );
 }  
```


