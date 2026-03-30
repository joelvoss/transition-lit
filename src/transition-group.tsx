import { useEffect, useRef, useState, type ReactNode } from 'react';

import TransitionGroupContext from './transition-group-context';
import type {
	ChildMapping,
	TransitionGroupProps,
	TransitionGroupState,
} from './types';
import {
	getChildMapping,
	getInitialChildMapping,
	getNextChildMapping,
} from './utils';

////////////////////////////////////////////////////////////////////////////////

/**
 * A component that manages a set of transition components (like `<Transition>`
 * and `<CSSTransition>`) in a list. It is used to orchestrate the mounting and
 * unmounting of components over time.
 */
export function TransitionGroup({
	childFactory = (child: ReactNode) => child,
	children,
	appear,
	enter,
	exit,
}: TransitionGroupProps) {
	const mounted = useRef<boolean | null>(null);

	const props = { children, appear, enter, exit, childFactory };

	// handleExited ref so it can be used without being a dep
	const handleExitedRef = useRef<
		(
			child: {
				key?: string | null;
				props: { onExited?: (node: HTMLElement) => void };
			},
			node: HTMLElement,
		) => void
	>(null!);

	const [state, setState] = useState<TransitionGroupState>(() => {
		const handleExited = (
			child: {
				key?: string | null;
				props: { onExited?: (node: HTMLElement) => void };
			},
			node: HTMLElement,
		) => {
			if (handleExitedRef.current) {
				handleExitedRef.current(child, node);
			}
		};

		return {
			contextValue: { isMounting: true },
			children: getInitialChildMapping(
				props,
				handleExited as Parameters<typeof getInitialChildMapping>[1],
			),
		};
	});

	// Update handleExited each render so it has access to current children/state
	handleExitedRef.current = (child, node) => {
		const currentChildMapping = getChildMapping(children);

		if (child.key! in currentChildMapping) return;

		if (child.props.onExited) {
			child.props.onExited(node);
		}

		if (mounted.current) {
			setState((ps) => {
				const updatedChildren: ChildMapping = { ...ps.children };
				delete updatedChildren[child.key!];
				return {
					...ps,
					children: updatedChildren,
				};
			});
		}
	};

	// Set the context value for this group of transitions on mount.
	useEffect(() => {
		mounted.current = true;
		setState((ps) => ({
			...ps,
			contextValue: { isMounting: false },
		}));

		return () => {
			mounted.current = false;
		};
	}, []);

	// Whenever children change, calculate the next child mapping to render.
	const prevChildrenRef = useRef(children);
	if (prevChildrenRef.current !== children) {
		prevChildrenRef.current = children;
		const handleExited = (
			child: {
				key?: string | null;
				props: { onExited?: (node: HTMLElement) => void };
			},
			node: HTMLElement,
		) => {
			if (handleExitedRef.current) {
				handleExitedRef.current(child, node);
			}
		};

		setState((ps) => ({
			...ps,
			children: getNextChildMapping(
				props,
				ps.children,
				handleExited as Parameters<typeof getNextChildMapping>[2],
			),
		}));
	}

	// Since childFactory has a default, we are safe to assume it exists.
	const renderedChildren = Object.values(state.children).map(childFactory);

	return (
		<TransitionGroupContext.Provider value={state.contextValue}>
			{renderedChildren}
		</TransitionGroupContext.Provider>
	);
}
