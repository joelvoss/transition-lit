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

- [Jump to `<Transition />`](#transition)
- [Jump to `<TransitionGroup />`](#transitiongroup)
- [Jump to `<CSSTransition />`](#csstransition)

### `<Transition />`

The `<Transition />` component is the base component and lets you describe
a transition from one state to another over a fixed period of time.

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Transition } from 'transition-lit';

const App = () => {
  const [inProp, setInProp] = React.useState(false);

  // [1] Define the duration of the transition.
  const duration = {
    enter: 150,
    exit: 75,
  };

  // [2] Define the component's default styling. Notice that we aren't using the
  // `transition` shorthand property because we want to use different transition
  // durations for enter and exit transitions as defined in [1].
  const defaultStyle = {
    transitionProperty: 'opacity',
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

  // [4] Use the <Transition /> component to expose the different transition
  // states for you to act on. The transition state is toggled by the `in` prop.
  return (
    <div>
      <button onClick={() => setInProp(v => !v)}>Toggle</button>
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
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

By default a child component stays mounted even after the exit transition ends.
Set the `unmountOnExit` prop to disable this behaviour and unmount the child
component after it finishes exiting.

_type: boolean_  
_default: false_

##### appear

By default a child component is not transitioned in if it is shown when the
`Transition` component mounts. By setting the `appear` prop you can force a
enter transition on mount.

> **Note:** For `<Transition />` there are no additional appear states — the
> same `entering`/`entered` states are used. `<CSSTransition />` does add
> dedicated `*-appear`, `*-appear-active`, and `*-appear-done` CSS classes.

_type: boolean_  
_default: false_

##### enter

Enable/disable enter transitions.

_type: boolean_  
_default: true_

##### exit

Enable/disable exit transitions.

_type: boolean_  
_default: true_

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
the currently transitioned DOM element. The isAppearing parameter indicates
if the transition happens on initial mount.

_type: Function(node: HTMLElement, isAppearing: boolean): void_  
_default: Function(): void_

##### onEntering

Callback fired after the `entering` status is applied. The node argument is
the currently transitioned DOM element. The isAppearing parameter indicates
if the transition happens on initial mount.

_type: Function(node: HTMLElement, isAppearing: boolean): void_  
_default: Function(): void_

##### onEntered

Callback fired after the `entered` status is applied. The node argument is
the currently transitioned DOM element. The isAppearing parameter indicates
if the transition happens on initial mount.

_type: Function(node: HTMLElement, isAppearing: boolean): void_  
_default: Function(): void_

##### onExit

Callback fired before the `exiting` status is applied.

_type: Function(node: HTMLElement): void_  
_default: Function(): void_

##### onExiting

Callback fired after the `exiting` status is applied.

_type: Function(node: HTMLElement): void_  
_default: Function(): void_

##### onExited

Callback fired after the `exited` status is applied.

_type: Function(node: HTMLElement): void_  
_default: Function(): void_

---

### `<TransitionGroup />`

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
import ReactDOM from 'react-dom/client';
import { CSSTransition, TransitionGroup } from 'transition-lit';

const App = () => {
  const [items, setItems] = React.useState([
    { id: crypto.randomUUID() },
    { id: crypto.randomUUID() },
    { id: crypto.randomUUID() },
    { id: crypto.randomUUID() },
  ]);

  const addItem = () => {
    setItems(items => [...items, { id: crypto.randomUUID() }]);
  };

  const removeItem = id => {
    setItems(items => items.filter(item => item.id !== id));
  };

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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
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

### `<CSSTransition />`

A transition component inspired by [ng-animate][ng-animate]. It should be used
if animations are being done by declaring transitions via CSS classes.

`CSSTransition` applies a pair of class names during the appear, enter, and
exit states of the transition. The first class is applied and then a second
`*-active` class in order to activate the CSS transition. After the transition,
matching `*-done` class names are applied to persist the transition state.

```js
function App() {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <CSSTransition in={show} timeout={200} classNames="my-node">
        <div>I'll receive my-node-* classes</div>
      </CSSTransition>
      <button onClick={() => setShow(show => !show)}>Toggle</button>
    </div>
  );
}
```

When the `in` prop is set to `true`, the child component will first receive the
the class `my-node-enter`, then the `my-node-enter-active` will be added in the
next tick.

> **Note:** `CSSTransition` forces a reflow before adding the
> `my-node-enter-active`. This is an important trick because it allows us to
> transition between `my-node-enter` and `my-node-enter-active` even though
> they were added immediately one after another. Most notably, this is what
> makes it possible for us to animate appearance.

```css
.my-node-enter {
  opacity: 0;
}
.my-node-enter-active {
  opacity: 1;
  transition: opacity 200ms;
}
.my-node-enter-done,
.my-node-exit {
  opacity: 1;
}
.my-node-exit-active {
  opacity: 0;
  transition: opacity 200ms;
}
.my-node-exit-done {
  opacity: 0;
}
```

Keep in mind: `*-active` classes represent which styles you want to animate to.

> **Note:** If you're using the appear prop, make sure to define styles for
> `appear-*` classes as well.

#### Props

##### classNames

The animation classNames applied to the component as it appears, enters, exits
or has finished the transition. A single name can be provided and it will be
suffixed for each stage:

```js
<CSSTransition in={show} timeout={200} classNames="fade">
  <div>I'll receive my-node-* classes</div>
</CSSTransition>

// applies fade-appear, fade-appear-active, fade-appear-done, fade-enter,
// fade-enter-active, fade-enter-done, fade-exit, fade-exit-active,
// and fade-exit-done.
```

> **Note:** `fade-appear-done` and `fade-enter-done` will both be applied.
> This allows you to define different behavior for when appearing is done and
> when regular entering is done, using selectors like
> `.fade-enter-done:not(.fade-appear-done)`.

Each individual classNames can also be specified independently like:

```js
classNames={{
 appear: 'my-appear',
 appearActive: 'my-active-appear',
 appearDone: 'my-done-appear',
 enter: 'my-enter',
 enterActive: 'my-active-enter',
 enterDone: 'my-done-enter',
 exit: 'my-exit',
 exitActive: 'my-active-exit',
 exitDone: 'my-done-exit',
}}
```

_type: string | { appear?: string, appearActive?: string, appearDone?: string,_
_enter?: string, enterActive?: string, enterDone?: string,_
_exit?: string, exitActive?: string, exitDone?: string }_  
_default: ''_

##### onEnter

A `<Transition>` callback fired immediately after the `enter` or `appear` class
is applied.

_type: Function(node: HTMLElement, isAppearing: boolean)_

##### onEntering

A `<Transition>` callback fired immediately after the `enter-active` or
`appear-active` class is applied.

_type: Function(node: HTMLElement, isAppearing: boolean)_

##### onEntered

A `<Transition>` callback fired immediately after the `enter` or `appear`
classes are removed and the `enter-done` class is added to the DOM node.

_type: Function(node: HTMLElement, isAppearing: boolean)_

##### onExit

A `<Transition>` callback fired immediately after the `exit` class is applied.

_type: Function(node: HTMLElement)_

##### onExiting

A `<Transition>` callback fired immediately after the `exit-active` is applied.

_type: Function(node: HTMLElement)_

##### onExited

A `<Transition>` callback fired immediately after the `exit` classes are
removed and the `exit-done` class is added to the DOM node.

_type: Function(node: HTMLElement)_

[react-spring]: https://www.react-spring.io/
[ng-animate]: https://github.com/jiayihu/ng-animate
