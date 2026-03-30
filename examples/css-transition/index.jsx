import React from 'react';
import ReactDOM from 'react-dom/client';
import { CSSTransition } from '../../src/index';

// Demonstrates CSSTransition with string classNames.
// CSSTransition automatically adds and removes CSS classes at each phase:
//   alert-enter, alert-enter-active, alert-enter-done
//   alert-exit,  alert-exit-active,  alert-exit-done
// The actual styles are defined in index.html.

const App = () => {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <h1>CSSTransition example</h1>
      <p>
        Examine <code>index.html</code> for stylesheet declarations
      </p>
      <button onClick={() => setShow(show => !show)}>Toggle</button>

      <CSSTransition in={show} timeout={300} classNames="alert">
        <div className="custom-class">I'll receive alert-* classes</div>
      </CSSTransition>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
