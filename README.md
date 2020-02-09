# transition-lit

**transition-lit** is a rudimentary animation/transition library written for
React applications. This is _not_ an animation library like [react-spring], it
does not animate styles by itself. Instead it exposes transition stages, manages
classes and group elements and manipulates the DOM in useful ways, making the
implementation of actual visual transitions much easier.

## Install

```sh
# Using npm
npm install transition-lit

# Using yarn
yarn add transition-lit
```

## Examples

**transition-lit** exposes simple components useful for defining entering and
exiting transitions demonstrated in this section.

### `<Transition />`

The Transition component lets you describe a transition from one component
state to another over time with a simple declarative API. Most commonly it's
used to animate the mounting and unmounting of a component, but can also be
used to describe in-place transition states as well.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Transition } from 'transition-lit';

const App = () => {
  // [1] Define enter and exit duration in milliseconds
  const duration = {
    enter: 150,
    exit: 75,
  };

  // [2] Define the default styling. Notice that we aren't using the
  // `transition` shorthand property because we want use different transition
  // durations in [1].
  const defaultStyle = {
    tansitionProperty: 'opacity',
    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    opacity: 0,
  }

  // [3] Define styles for each transition phase.
  const transitionStyles = {
    entering: { opacity: 1, transitionDuration: `${duration.enter}ms` },
    entered: { opacity: 1, transitionDuration: `${duration.enter}ms` },
    exiting: { opacity: 0, transitionDuration: `${duration.exit}ms` },
    exited: { opacity: 0, transitionDuration: `${duration.exit}ms` },
  };

  // [4] Use the <Transition /> component to expose the differen transition
  // states for you to act on.
  return (
    <div>
      <Transition in={inProp} timeout={duration}>
        {state => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state]
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
TBD


---

This project was bootstrapped with [jvdx](https://github.com/joelvoss/jvdx).

[react-spring]: https://www.react-spring.io/