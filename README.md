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

#### Props

##### children

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

##### in

Triggers enter or exit transitions.
`true` triggers the enter transition, `false` triggers the exit transition.

_type: boolean_  
_default: false_

##### mountOnEnter

By default a child component is mounted immediately along the `Transition`
component. Set the `mountOnEnter` prop if you want to defer mounting to the
first enter transition.

_type: boolean_  
_default: false_

##### unmountOnExit

By default a child component stays mounted event after the exit transition ends.
Set the `unmountOnExit` prop to disabled this behaviour and unmount the child
component after it finishes exiting.

_type: boolean_  
_default: false_

##### appear

By default a child component is not transitioned in if it is shown when the
`Transition` component mounts. By setting the `appear` prop you can force a
enter transition on mount.

> **Note:** There are no additional 'appear' states. Instead this prop adds an
> additional enter transition.

_type: boolean_  
_default: false_

##### enter

Enable/disabled enter transitions.

_type: boolean_  
_default: false_

##### exit

Enable/disable exit transitions.

_type: boolean_  
_default: false_

##### timeout

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

##### onEnter

Callback fired before the `entering` status is applied. The node argument is
the currently transitioned DOMElement. The isAppearing parameter is indicating
if the transition happens on initial mount.

_type: Function(node: HtmlElement, isAppearing: boolean): void_  
_default: Function(): void_

##### onEntering

Callback fired after the `entering` status is applied. The node argument is
the currently transitioned DOMElement. The isAppearing parameter is indicating
if the transition happens on initial mount.

_type: Function(node: HtmlElement, isAppearing: boolean): void_  
_default: Function(): void_

##### onEntered

Callback fired after the `entered` status is applied. The node argument is
the currently transitioned DOMElement. The isAppearing parameter is indicating
if the transition happens on initial mount.

_type: Function(node: HtmlElement, isAppearing: boolean): void_  
_default: Function(): void_

##### onExit

Callback fired before the `exiting` status is applied.

_type: Function(node: HtmlElement): void_  
_default: Function(): void_

##### onExiting

Callback fired after the `exiting` status is applied.

_type: Function(node: HtmlElement): void_  
_default: Function(): void_

##### onExited

Callback fired after the `exited` status is applied.

_type: Function(node: HtmlElement): void_  
_default: Function(): void_

---

### `<TransitionGroup>`

The `<TransitionGroup>` component manages a set of transition components
(`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
components, `<TransitionGroup>` is a state machine for managing the mounting and
unmounting of components over time.

Consider the example below. As items are removed or added to the TodoList the
in prop is toggled automatically by the `<TransitionGroup>`.

> **Note:** `<TransitionGroup>` does not define any animation behavior! Exactly
> how a list item animates is up to the individual transition component. This
> means you can mix and match animations across different list items.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';
import { Transition, TransitionGroup } from 'transition-lit';

const App = () => {
  const [items, setItems] = React.useState([
    { id: uuid() },
    { id: uuid() },
    { id: uuid() },
    { id: uuid() },
  ]);

  const addItem = () => {
    setItems(items => [...items, { id: uuid() }]);
  }

  const removeItem = id => {
    setItems(items => items.filter(item => item.id !== id);
  }

  return (
    <>
      <button onClick={() => addItem()}>Add</button>

      <TransitionGroup>
        {items.map(({ id }) => (
          <CSSTransition key={id} timeout={200} classNames="my-node">
            <div>
              <span>{id}</span>
              <button onClick={() => removeItem(id)}>Remove</button>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

#### Props

##### children

A set of `<Transition>` components, that are toggled in and out as they leave.
The `<TransitionGroup>` will inject specific transition props, so remember to
spread them through if you are wrapping the `<Transition>` component.

In case you want to transition content of a single transition child (e.g. route-
transitions or carousel-/image-transitions) you have to change the `key`
prop of the transition child which forces `<TransitionGroup>` to transition
the child out and back in again.

_type: any_

##### appear

A convenience prop that enables or disables appear animations for all children.

> **Note:** Specifying this will override any defaults set on individual
> children `<Transitions>`.

_type: boolean_

##### enter

A convenience prop that enables or disables enter animations for all children.

> **Note:** Specifying this will override any defaults set on individual
> children `<Transitions>`.

_type: boolean_

##### exit

A convenience prop that enables or disables exit animations for all children.

> **Note:** Specifying this will override any defaults set on individual
> children `<Transitions>`.

_type: boolean_

##### childFactory

You may need to apply reactive updates to a child as it is exiting.
This is generally done by using cloneElement however in the case of an exiting
child the element has already been removed and not accessible to the consumer.

If you do need to update a child as it leaves you can provide a childFactory to
wrap every child, even the ones that are leaving.

_type: Function(child: ReactNode) -> ReactNode_  
_default: child => child_

---

This project was bootstrapped with [jvdx](https://github.com/joelvoss/jvdx).

[react-spring]: https://www.react-spring.io/
