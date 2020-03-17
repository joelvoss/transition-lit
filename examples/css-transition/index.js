import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from '../../src/index';

const App = () => {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <h1>CSSTransition example</h1>
      <p>
        Examine <code>index.html</code> for stylesheet declarations
      </p>
      <button onClick={() => setShow(show => !show)}>Toggle</button>

      <CSSTransition in={show} timeout={200} classNames="my-node">
        <div className="custom-class">I'll receive my-node-* classes</div>
      </CSSTransition>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
