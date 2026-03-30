import React from 'react';
import ReactDOM from 'react-dom/client';
import { Transition } from '../../src/index';

// Demonstrates all six lifecycle callbacks:
//   onEnter, onEntering, onEntered, onExit, onExiting, onExited
//
// Each fires at the corresponding state machine transition. The log below
// records every event so you can see the exact sequence.

const duration = 400;

const defaultStyle = {
  transitionProperty: 'opacity, transform',
  transitionTimingFunction: 'ease-in-out',
  transitionDuration: `${duration}ms`,
  opacity: 0,
  transform: 'scale(0.95)',
  padding: '12px',
  background: '#f0fff0',
  marginTop: '12px',
};

const transitionStyles = {
  entering: { opacity: 1, transform: 'scale(1)' },
  entered:  { opacity: 1, transform: 'scale(1)' },
  exiting:  { opacity: 0, transform: 'scale(0.95)' },
  exited:   { opacity: 0, transform: 'scale(0.95)' },
};

const logStyle = {
  fontFamily: 'monospace',
  fontSize: '13px',
  marginTop: '16px',
  padding: '8px',
  background: '#1e1e1e',
  color: '#d4d4d4',
  maxHeight: '200px',
  overflowY: 'auto',
};

const App = () => {
  const [show, setShow] = React.useState(false);
  const [log, setLog] = React.useState([]);

  const addLog = label =>
    setLog(prev => [`${new Date().toLocaleTimeString()} — ${label}`, ...prev]);

  return (
    <div>
      <h1>Lifecycle callbacks example</h1>
      <p>
        Toggle the element and watch all six lifecycle hooks fire in the log
        below.
      </p>
      <button onClick={() => setShow(s => !s)}>Toggle</button>

      <Transition
        in={show}
        timeout={duration}
        onEnter={() => addLog('onEnter')}
        onEntering={() => addLog('onEntering')}
        onEntered={() => addLog('onEntered')}
        onExit={() => addLog('onExit')}
        onExiting={() => addLog('onExiting')}
        onExited={() => addLog('onExited')}
      >
        {status => (
          <div style={{ ...defaultStyle, ...transitionStyles[status] }}>
            Current status: <strong>{status}</strong>
          </div>
        )}
      </Transition>

      <div style={logStyle}>
        {log.length === 0 && <div style={{ color: '#888' }}>No events yet.</div>}
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
