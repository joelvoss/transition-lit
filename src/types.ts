import { Phase } from './transition';

export type EnterFn = (node: HTMLElement, isAppearing?: boolean) => void;
export type ExitFn = (node: HTMLElement) => void;

export interface TransitionProps {
  in?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  timeout?: number | { enter?: number; exit?: number; appear?: number };
  onEnter?: EnterFn;
  onEntering?: EnterFn;
  onEntered?: EnterFn;
  onExit?: ExitFn;
  onExiting?: ExitFn;
  onExited?: ExitFn;
}

export type State =
  | Phase.ENTERING
  | Phase.ENTERED
  | Phase.EXITING
  | Phase.EXITED;

export interface TransitionGroupContext {
  isMounting?: boolean;
}

export interface TransitionGroupProps {
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  childFactory?: (child: React.ReactNode) => React.ReactNode;
}

export type ChildMapping = {
  [key: string]: React.ReactNode;
};

export interface TransitionGroupState {
  contextValue: { isMounting: boolean };
  children: ChildMapping;
}

export interface CSSTransitionProps extends TransitionProps {
  classNames?: string | { [key: string]: string };
}
