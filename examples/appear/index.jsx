import React from 'react';
import ReactDOM from 'react-dom/client';
import { Transition } from '../../src/index';

// Demonstrates the `appear` prop: the enter animation runs on first mount
// without any user interaction. Reload the page to see it again.

const duration = 600;

const defaultStyle = {
  transitionProperty: 'opacity, transform',
  transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  transitionDuration: `${duration}ms`,
  opacity: 0,
  transform: 'translateY(16px)',
};

const transitionStyles = {
  entering: { opacity: 1, transform: 'translateY(0)' },
  entered:  { opacity: 1, transform: 'translateY(0)' },
  exiting:  { opacity: 0, transform: 'translateY(16px)' },
  exited:   { opacity: 0, transform: 'translateY(16px)' },
};

const App = () => {
  const [show, setShow] = React.useState(true);

  return (
    <div>
      <h1>Appear example</h1>
      <p>
        The <code>appear</code> prop triggers the enter animation on first mount.
        Unmount and remount the element to see it again.
      </p>
      <button onClick={() => setShow(s => !s)}>
        {show ? 'Unmount' : 'Remount'}
      </button>

      {show && (
        <Transition in={true} timeout={duration} appear>
          {status => (
            <div style={{ ...defaultStyle, ...transitionStyles[status] }}>
              I animated in on mount! (status: {status})
            </div>
          )}
        </Transition>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
