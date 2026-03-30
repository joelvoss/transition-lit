import React from 'react';
import ReactDOM from 'react-dom/client';
import { CSSTransition } from '../../src/index';

// Demonstrates two CSSTransition features:
//
// 1. `appear` prop — runs the enter animation on initial mount using
//    the *-appear / *-appear-active / *-appear-done CSS classes.
//
// 2. Object form of `classNames` — instead of deriving class names from
//    a string prefix, you supply each class name explicitly:
//    { enter, enterActive, enterDone, exit, exitActive, exitDone,
//      appear, appearActive, appearDone }

const objectClassNames = {
  enter:        'slide-in',
  enterActive:  'slide-in-active',
  enterDone:    'slide-in-done',
  exit:         'slide-out',
  exitActive:   'slide-out-active',
  exitDone:     'slide-out-done',
  appear:       'slide-in',
  appearActive: 'slide-in-active',
  appearDone:   'slide-in-done',
};

const App = () => {
  const [showA, setShowA] = React.useState(true);
  const [showB, setShowB] = React.useState(true);

  return (
    <div>
      <h1>CSSTransition — appear &amp; classNames object</h1>

      <h2>String classNames with appear</h2>
      <p>
        <code>classNames="fade"</code> + <code>appear</code>. Reload to see the
        appear animation; toggle to see enter/exit.
      </p>
      <button onClick={() => setShowA(s => !s)}>Toggle A</button>
      <CSSTransition in={showA} timeout={{ enter: 400, exit: 300 }} classNames="fade" appear>
        <div className="box">Element A — slides in from the left on mount</div>
      </CSSTransition>

      <hr />

      <h2>Object classNames with appear</h2>
      <p>
        <code>classNames</code> as an object with fully custom class names.
        Reload to see the appear animation; toggle to see enter/exit.
      </p>
      <button onClick={() => setShowB(s => !s)}>Toggle B</button>
      <CSSTransition
        in={showB}
        timeout={{ enter: 400, exit: 300 }}
        classNames={objectClassNames}
        appear
      >
        <div className="box">Element B — slides in from the top on mount</div>
      </CSSTransition>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
