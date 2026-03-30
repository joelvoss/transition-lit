import type { ReactElement, ReactNode } from 'react';

export type EnterHandler = (node: HTMLElement, isAppearing?: boolean) => void;
export type ExitHandler = (node: HTMLElement) => void;

export const UNMOUNTED = 'unmounted';
export const EXITED = 'exited';
export const ENTERING = 'entering';
export const ENTERED = 'entered';
export const EXITING = 'exiting';

export interface TransitionActions {
	appear?: boolean;
	enter?: boolean;
	exit?: boolean;
}

interface BaseTransitionProps {
	in?: boolean;
	mountOnEnter?: boolean;
	unmountOnExit?: boolean;
	onEnter?: EnterHandler;
	onEntering?: EnterHandler;
	onEntered?: EnterHandler;
	onExit?: ExitHandler;
	onExiting?: ExitHandler;
	onExited?: ExitHandler;
	children?: TransitionChildren;
	[prop: string]: unknown;
}

export type TransitionStatus =
	| typeof ENTERING
	| typeof ENTERED
	| typeof EXITING
	| typeof EXITED
	| typeof UNMOUNTED;

export type TransitionChildren =
	| ReactNode
	| ((status: TransitionStatus) => ReactNode);

export interface TransitionProps extends BaseTransitionProps {
	timeout: number | { appear?: number; enter?: number; exit?: number };
}

////////////////////////////////////////////////////////////////////////////////

export type ChildMapping = {
	[x: string]: ReactNode;
};

////////////////////////////////////////////////////////////////////////////////

export interface CSSTransitionProps extends TransitionProps {
	classNames?: string | { [key: string]: string };
}

////////////////////////////////////////////////////////////////////////////////

export interface TransitionGroupProps extends TransitionActions {
	children?:
		| ReactElement<TransitionProps>
		| Array<ReactElement<TransitionProps>>;
	childFactory?(child: ReactNode): ReactNode;
	[prop: string]: unknown;
}

export interface TransitionGroupState {
	contextValue: ContextValue;
	children: ChildMapping;
}

////////////////////////////////////////////////////////////////////////////////

export type ContextValue = {
	isMounting?: boolean;
};
