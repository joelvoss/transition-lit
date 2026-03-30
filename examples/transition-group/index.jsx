import React from 'react';
import ReactDOM from 'react-dom/client';
import { Transition, TransitionGroup } from '../../src/index';

// Demonstrates TransitionGroup managing a dynamic keyed list.
// TransitionGroup tracks which children are entering or leaving and keeps
// exiting children alive in the DOM until their exit animation completes.
// FadeTransition is a small wrapper that wires Transition to inline opacity
// styles and passes through the in/...rest props supplied by TransitionGroup.

const App = () => {
  const [items, setItems] = React.useState([
    { id: crypto.randomUUID() },
    { id: crypto.randomUUID() },
    { id: crypto.randomUUID() },
    { id: crypto.randomUUID() },
  ]);

  return (
    <div>
      <h1>TransitionGroup example</h1>
      <button onClick={() => setItems(items => [...items, { id: crypto.randomUUID() }])}>
        Add
      </button>
      <TransitionGroup>
        {items.map(({ id }) => (
          <FadeTransition key={id}>
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

const FadeTransition = ({ in: inProp, children, ...rest }) => {
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
      {status => (
        <div
          style={{
            ...defaultStyle,
            ...transitionStyles[status],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
