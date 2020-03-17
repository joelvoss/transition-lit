import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';
import { Transition, TransitionGroup } from '../../src/index';

const App = () => {
  const [items, setItems] = React.useState([
    { id: uuid() },
    { id: uuid() },
    { id: uuid() },
    { id: uuid() },
  ]);

  return (
    <div>
      <h1>TransitionGroup example</h1>
      <button onClick={() => setItems(items => [...items, { id: uuid() }])}>
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

ReactDOM.render(<App />, document.getElementById('root'));
