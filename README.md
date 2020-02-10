# transition-lit

**transition-lit** is a rudimentary animation/transition library written for
React applications. It is _not_ an animation library like [react-spring] and it
doesn't animate styles by itself. Instead, it reveals transition stages,
manages classes and group elements, and manipulates the DOM, hopefully making it
easier to build actual visual transitions on top.

## Install

```sh
# Using npm
npm install transition-lit

# Using yarn (v1.xx)
yarn add transition-lit
```

## Examples

**transition-lit** exposes a handful of components demonstrated in this section.

### `<Transition />`

The `<Transition />` component is the base component and lets you describe
a transition from one state to another over a fixed period of time.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Transition } from 'transition-lit';

const App = () => {
  // [1] Define the duration of the transition.
  const duration = {
    enter: 150,
    exit: 75,
  };

  // [2] Define the components default styling. Notice that we aren't using the
  // `transition` shorthand property because we want to use different transition
  // durations for enter and exit transitions as defined in [1].
  const defaultStyle = {
    tansitionProperty: 'opacity',
    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    opacity: 0,
  };

  // [3] Define styles for each transition phase.
  const transitionStyles = {
    entering: { opacity: 1, transitionDuration: `${duration.enter}ms` },
    entered: { opacity: 1, transitionDuration: `${duration.enter}ms` },
    exiting: { opacity: 0, transitionDuration: `${duration.exit}ms` },
    exited: { opacity: 0, transitionDuration: `${duration.exit}ms` },
  };

  // [4] Use the <Transition /> component to expose the differen transition
  // states for you to act on. The transition state is toggled by the `in` prop.
  return (
    <div>
      <Transition in={inProp} timeout={duration}>
        {state => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
          >
            This is a fade transition!
          </div>
        )}
      </Transition>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

## API

### Props

#### children

Use the function as a child pattern to expose the current transition state
to your child components. Possible transition states are: `entering`, `entered`,
`exiting` and `exited`.

```js
<Transition in={inProp} timeout={200}>
  {state => <Component className={`animation animation-${state}`} />}
</Transition>
```

_type: Function | Element_  
_required_

#### in

Triggers enter or exit transitions.
`true` triggers the enter transition, `false` triggers the exit transition.

_type: boolean_  
_default: false_

#### mountOnEnter

By default a child component is mounted immediately along the `Transition`
component. Set the `mountOnEnter` prop if you want to defer mounting to the
first enter transition.

_type: boolean_  
_default: false_

#### unmountOnExit

By default a child component stays mounted event after the exit transition ends.
Set the `unmountOnExit` prop to disabled this behaviour and unmount the child
component after it finishes exiting.

_type: boolean_  
_default: false_

#### appear

By default a child component is not transitioned in if it is shown when the
`Transition` component mounts. By setting the `appear` prop you can force a
enter transition on mount.

> **Note:** There are no additional 'appear' states. Instead this prop adds an
> additional enter transition.

_type: boolean_  
_default: false_

#### enter

Enable/disabled enter transitions.

_type: boolean_  
_default: false_

#### exit

Enable/disable exit transitions.

_type: boolean_  
_default: false_

#### timeout

Duration of a transition in milliseconds.  
You can provide a single number for all transition phases or an object
defining individual timeouts.

```js
timeout={200}

// or

timeout={{
  appear: 100,
  enter: 200,
  exit: 75,
}}
```

_type: number | { enter?: number, exit?: number, appear?: number }_  
_required_

#### onEnter

Callback fired before the `entering` status is applied. The node argument is
the currently transitioned DOMElement. The isAppearing parameter is indicating
if the transition happens on initial mount.

_type: Function(node: HtmlElement, isAppearing: boolean): void_  
_default: Function(): void_

#### onEntering

Callback fired after the `entering` status is applied. The node argument is
the currently transitioned DOMElement. The isAppearing parameter is indicating
if the transition happens on initial mount.

_type: Function(node: HtmlElement, isAppearing: boolean): void_  
_default: Function(): void_

#### onEntered

Callback fired after the `entered` status is applied. The node argument is
the currently transitioned DOMElement. The isAppearing parameter is indicating
if the transition happens on initial mount.

_type: Function(node: HtmlElement, isAppearing: boolean): void_  
_default: Function(): void_

#### onExit

Callback fired before the `exiting` status is applied.

_type: Function(node: HtmlElement): void_  
_default: Function(): void_

#### onExiting

Callback fired after the `exiting` status is applied.

_type: Function(node: HtmlElement): void_  
_default: Function(): void_

#### onExited

Callback fired after the `exited` status is applied.

_type: Function(node: HtmlElement): void_  
_default: Function(): void_

---

This project was bootstrapped with [jvdx](https://github.com/joelvoss/jvdx).

[react-spring]: https://www.react-spring.io/
