import React from 'react';
import TransitionGroupContext from './transition-group-context';
import {
  getChildMapping,
  getInitialChildMapping,
  getNextChildMapping,
} from './utils';
import {
  TransitionGroupProps,
  TransitionGroupState,
  ChildMapping,
} from './types';

////////////////////////////////////////////////////////////////////////////////

const values =
  Object.values ||
  ((obj: { [key: string]: any }) => Object.keys(obj).map(k => obj[k]));

////////////////////////////////////////////////////////////////////////////////

export const TransitionGroup: React.FC<TransitionGroupProps> = props => {
  const mounted = React.useRef<boolean | null>(null);

  // Custom onExit method for each transition child.
  // Remove a child that shouldn't be rendered anymore.
  const handleExited = (child: React.ReactElement<any>, node: HTMLElement) => {
    let currentChildMapping = getChildMapping(props.children);

    if (child.key! in currentChildMapping) return;

    if (child.props.onExited) {
      child.props.onExited(node);
    }

    if (mounted.current) {
      setState(ps => {
        let children: ChildMapping = { ...ps.children };
        delete children[child.key!];
        return {
          ...ps,
          children,
        };
      });
    }
  };

  const [state, setState] = React.useState<TransitionGroupState>({
    contextValue: { isMounting: true },
    children: getInitialChildMapping(props, handleExited),
  });

  // Set the context value for this group of transitions on cDM.
  React.useEffect(() => {
    mounted.current = true;
    setState(ps => ({
      ...ps,
      contextValue: { isMounting: false },
    }));

    return () => {
      mounted.current = false;
    };
  }, []);

  // Whenever our props change (e.g. children get added/removed), calculate the
  // next child mapping to render.
  const [prevProps, setPrevProps] = React.useState(props);
  if (prevProps !== props) {
    setState(ps => ({
      ...ps,
      children: getNextChildMapping(props, state.children, handleExited),
    }));
    setPrevProps(props);
  }

  // Since the childFactory prop is set via `defaultProps`, we are safe to
  // assume it exists.
  const children = values(state.children).map(props.childFactory!);

  return (
    <TransitionGroupContext.Provider value={state.contextValue}>
      {children}
    </TransitionGroupContext.Provider>
  );
};

TransitionGroup.defaultProps = {
  childFactory: child => child,
};
