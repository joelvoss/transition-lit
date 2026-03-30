import React from 'react';
import ReactDOM from 'react-dom/client';
import { Transition } from '../../src/index';

// Demonstrates mountOnEnter and unmountOnExit.
//
// - Default: element is always in the DOM, just hidden (opacity 0).
// - mountOnEnter: element is not mounted until the first enter transition.
// - unmountOnExit: element is removed from the DOM after exit completes.
// - Both together: lazily mounted, eagerly unmounted.
//
// Inspect the DOM in DevTools to observe the difference.

const duration = 300;

const defaultStyle = {
  transitionProperty: 'opacity',
  transitionTimingFunction: 'ease-in-out',
  transitionDuration: `${duration}ms`,
  padding: '8px 12px',
  background: '#e0f0ff',
  marginTop: '8px',
  opacity: 0,
};

const transitionStyles = {
  entering: { opacity: 1 },
  entered:  { opacity: 1 },
  exiting:  { opacity: 0 },
  exited:   { opacity: 0 },
};

const Box = ({ label, in: inProp, mountOnEnter, unmountOnExit }) => (
  <Transition
    in={inProp}
    timeout={duration}
    mountOnEnter={mountOnEnter}
    unmountOnExit={unmountOnExit}
  >
    {status => (
      <div style={{ ...defaultStyle, ...transitionStyles[status] }}>
        {label} — status: <strong>{status}</strong>
      </div>
    )}
  </Transition>
);

const App = () => {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <h1>mountOnEnter / unmountOnExit example</h1>
      <p>Inspect the DOM to see which elements are present while hidden.</p>
      <button onClick={() => setShow(s => !s)}>Toggle</button>

      <Box label="Default (always in DOM)" in={show} />
      <Box label="mountOnEnter only" in={show} mountOnEnter />
      <Box label="unmountOnExit only" in={show} unmountOnExit />
      <Box label="mountOnEnter + unmountOnExit" in={show} mountOnEnter unmountOnExit />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
