import React from 'react';
import ReactDOM from 'react-dom/client';
import { Transition } from '../../src/index';

// Demonstrates the core Transition component using the render-prop form.
// The child function receives the current status string and applies inline
// styles directly, making the transition purely JS-driven with no CSS classes.

const App = () => {
  const [show, setShow] = React.useState(false);

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
    <div>
      <h1>Basic example</h1>
      <button onClick={() => setShow(state => !state)}>Toggle</button>
      <Transition in={show} timeout={duration}>
        {status => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[status],
            }}
          >
            Current status: {status}
          </div>
        )}
      </Transition>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
