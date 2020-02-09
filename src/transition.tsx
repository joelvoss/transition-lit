import React from 'react';
import TransitionGroupContext from './transition-group-context';
import { TransitionProps } from './types';

export enum Phase {
  UNMOUNTED = 'unmounted',
  ENTERING = 'entering',
  ENTERED = 'entered',
  EXITING = 'exiting',
  EXITED = 'exited',
}

export const Transition: React.FC<TransitionProps> = props => {
  const { children, ...childProps } = props;
  let nodeRef = React.useRef<HTMLElement>();

  let context = React.useContext(TransitionGroupContext);
  // In the context of a TransitionGroup all enters are really appears
  let appear = context && !context.isMounting ? props.enter : props.appear;

  let initialStatus;
  if (props.in) {
    if (appear) {
      initialStatus = Phase.EXITED;
    } else {
      initialStatus = Phase.ENTERED;
    }
  } else {
    if (props.unmountOnExit || props.mountOnEnter) {
      initialStatus = Phase.UNMOUNTED;
    } else {
      initialStatus = Phase.EXITED;
    }
  }

  const [state, setState] = React.useState<{
    status: Phase;
    node?: HTMLElement;
    nextTimeout?: number;
    appearing?: boolean;
  }>({
    status: initialStatus,
  });

  // getDerivedStateFromProps
  if (props.in && state.status === Phase.UNMOUNTED) {
    setState({ status: Phase.EXITED });
  }

  React.useEffect(() => {
    let { status, node, nextTimeout, appearing } = state;
    let timeoutID: number;

    // Set node to the current nodeRef element
    node = node || nodeRef.current;

    const onTransitionEnd = (cb: Function) => {
      if (!node || nextTimeout == null) {
        timeoutID = setTimeout(cb, 0);
        return;
      }

      if (nextTimeout != null) {
        timeoutID = setTimeout(cb, nextTimeout);
      }
    };

    switch (status) {
      case Phase.ENTERING: {
        props.onEntering && props.onEntering(node!, appearing);

        onTransitionEnd(() => {
          setState({ status: Phase.ENTERED, node, appearing });
        });
        break;
      }
      case Phase.ENTERED: {
        props.onEntered && props.onEntered(node!, appearing);
        break;
      }
      case Phase.EXITING: {
        props.onExiting && props.onExiting(node!);

        onTransitionEnd(() => {
          setState({ status: Phase.EXITED, node });
        });
        break;
      }
      case Phase.EXITED: {
        props.onExited && props.onExited(node!);
        break;
      }
    }

    return () => {
      clearTimeout(timeoutID);
    };
  }, [props, state]);

  /**
   * getTimeouts parses the timeout prop and returns an object containing
   * `exit`, `enter` and `appear` timeouts.
   */
  const getTimeouts = React.useCallback(() => {
    const { timeout } = props;
    let exit, enter, appear;

    if (timeout != null && typeof timeout !== 'number') {
      exit = timeout.exit;
      enter = timeout.enter;
      // TODO: remove fallback for next major
      appear = timeout.appear !== undefined ? timeout.appear : enter;
    } else {
      exit = enter = appear = timeout;
    }
    return { exit, enter, appear };
  }, [props]);

  /**
   * Perform the enter transition:
   * onEnter -> onEntering -> onEntered
   */
  const performEnter = React.useCallback(
    (node: HTMLElement, mounting: boolean) => {
      const { enter } = props;

      // Skip right into ENTERED if the enter animation is disabled
      // If we are mounting and running this it means appear _must_ be set
      if (!mounting && !enter) {
        setState({
          status: Phase.ENTERED,
          node,
          nextTimeout: undefined,
          appearing: undefined,
        });
        return;
      }

      const timeouts = getTimeouts();
      const appearing = context ? context.isMounting : mounting;
      const nextTimeout = appearing ? timeouts.appear : timeouts.enter;

      props.onEnter && props.onEnter(node, appearing);
      setState({ status: Phase.ENTERING, node, nextTimeout, appearing });
    },
    [context, getTimeouts, props],
  );

  /**
   * Perform the exit transition:
   * onExit -> onExiting -> onExited
   */
  const performExit = React.useCallback(
    (node: HTMLElement) => {
      const { exit } = props;
      // Skip right into EXITED if the exit animation is disabled
      if (!exit) {
        setState({
          status: Phase.EXITED,
          node,
          nextTimeout: undefined,
          appearing: undefined,
        });
        return;
      }

      const timeouts = getTimeouts();

      props.onExit && props.onExit(node);
      setState({
        status: Phase.EXITING,
        node,
        nextTimeout: timeouts.exit,
        appearing: undefined,
      });
    },
    [getTimeouts, props],
  );

  //////////////////////////////////////////////////////////////////////////////

  // Update the current transition status
  const updateStatus = React.useCallback(
    (mounting = false, nextStatus: Phase | null) => {
      if (nextStatus !== null) {
        // nextStatus will always be ENTERING or EXITING.
        const node = nodeRef.current as HTMLElement;

        if (nextStatus === Phase.ENTERING) {
          performEnter(node, mounting);
        } else {
          performExit(node);
        }
      } else if (props.unmountOnExit && state.status === Phase.EXITED) {
        setState({ status: Phase.UNMOUNTED });
      }
    },
    [performEnter, performExit, props.unmountOnExit, state.status],
  );

  const mounted = React.useRef<boolean>(false);
  React.useEffect(() => {
    let nextStatus = null;
    const { status } = state;

    if (props.in) {
      if (status !== Phase.ENTERING && status !== Phase.ENTERED) {
        nextStatus = Phase.ENTERING;
      }
    } else {
      if (status === Phase.ENTERING || status === Phase.ENTERED) {
        nextStatus = Phase.EXITING;
      }
    }
    updateStatus(!mounted.current, nextStatus);
    mounted.current = true;
  }, [state, props, updateStatus]);

  if (state.status === Phase.UNMOUNTED) {
    return null;
  }

  // filter props
  delete childProps.in;
  delete childProps.mountOnEnter;
  delete childProps.unmountOnExit;
  delete childProps.appear;
  delete childProps.enter;
  delete childProps.exit;
  delete childProps.timeout;
  delete childProps.onEnter;
  delete childProps.onEntering;
  delete childProps.onEntered;
  delete childProps.onExit;
  delete childProps.onExiting;
  delete childProps.onExited;

  const child =
    typeof children === 'function'
      ? children(state.status, childProps)
      : React.Children.only(children);

  nodeRef = child.ref || nodeRef;
  return (
    // allows for nested Transitions
    <TransitionGroupContext.Provider value={null}>
      {React.cloneElement(child, { ...childProps, ref: nodeRef })}
    </TransitionGroupContext.Provider>
  );
};

function noop() {}

Transition.defaultProps = {
  in: false,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  enter: true,
  exit: true,

  onEnter: noop,
  onEntering: noop,
  onEntered: noop,

  onExit: noop,
  onExiting: noop,
  onExited: noop,
};
