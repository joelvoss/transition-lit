import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
import {
  Transition,
  TransitionGroup,
  TransitionProps,
  State,
  CSSTransition,
} from '../src/index';

const App = () => {
  return (
    <div>
      <h1>transition-lit</h1>
      <hr />
      <TransitionExample />
      <hr />
      <TransitionGroupExample />
      <hr />
      <CSSTransitionExample />
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////////

const FadeTransition: React.FC<TransitionProps> = ({
  in: inProp,
  children,
  ...rest
}) => {
  const duration = {
    enter: 150,
    exit: 75,
  };

  const defaultStyle = {
    tansitionProperty: 'opacity',
    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    opacity: 0,
  };

  const transitionStyles = {
    entering: { opacity: 1, transitionDuration: `${duration.enter}ms` },
    entered: { opacity: 1, transitionDuration: `${duration.enter}ms` },
    exiting: { opacity: 0, transitionDuration: `${duration.exit}ms` },
    exited: { opacity: 0, transitionDuration: `${duration.exit}ms` },
  };

  return (
    <Transition in={inProp} timeout={duration} {...rest}>
      {(state: State) => (
        <div
          style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}
        >
          {children}
          State: {state}
        </div>
      )}
    </Transition>
  );
};

////////////////////////////////////////////////////////////////////////////////

export const TransitionExample = () => {
  const [state, setState] = React.useState(false);

  return (
    <div>
      <h2>Transition example</h2>
      <FadeTransition in={state}>I'm a fade Transition!</FadeTransition>
      <button onClick={() => setState(state => !state)}>Toggle</button>
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////////

export const TransitionGroupExample = () => {
  const [items, setItems] = React.useState([
    { id: uuid() },
    { id: uuid() },
    { id: uuid() },
    { id: uuid() },
  ]);

  return (
    <div>
      <h2>TransitionGroup example</h2>
      <button onClick={() => setItems(items => [...items, { id: uuid() }])}>
        Add
      </button>
      <TransitionGroup>
        {items.map(({ id }) => (
          <FadeTransition key={id} unmountOnExit>
            {id}
            <button
              onClick={() =>
                setItems(items => items.filter(item => item.id !== id))
              }
            >
              Remove
            </button>
          </FadeTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////////

const CSSTransitionExample = () => {
  const [state, setState] = React.useState(false);
  return (
    <div>
      <CSSTransition in={state} timeout={200} classNames="my-node">
        <div>I'll receive my-node-* classes</div>
      </CSSTransition>
      <button onClick={() => setState(state => !state)}>Toggle</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
