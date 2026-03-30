import {
	Children,
	cloneElement,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactElement,
} from 'react';

import TransitionGroupContext from './transition-group-context';
import {
	ENTERED,
	ENTERING,
	EXITED,
	EXITING,
	UNMOUNTED,
	type TransitionProps,
	type TransitionStatus,
} from './types';

////////////////////////////////////////////////////////////////////////////////

function noop() {}

////////////////////////////////////////////////////////////////////////////////

/**
 * A component that manages the mounting and unmounting of a component over
 * time. It's used to describe a transition from one component state to another
 * over time with a simple declarative API. It's the basis for animations, but
 * doesn't prescribe how they should be implemented. You can use it to create
 * basic CSS transitions, or more complex animations using libraries like React
 * Transition Group.
 */
export function Transition(props: TransitionProps) {
	const {
		children,
		in: inProp = false,
		mountOnEnter = false,
		unmountOnExit = false,
		appear = false,
		enter = true,
		exit = true,
		onEnter = noop,
		onEntering = noop,
		onEntered = noop,
		onExit = noop,
		onExiting = noop,
		onExited = noop,
		timeout,
	} = props;

	// Use refs for callbacks to avoid stale closures while keeping
	// the effect deps simple.
	const onEnterRef = useRef(onEnter);
	const onEnteringRef = useRef(onEntering);
	const onEnteredRef = useRef(onEntered);
	const onExitRef = useRef(onExit);
	const onExitingRef = useRef(onExiting);
	const onExitedRef = useRef(onExited);
	onEnterRef.current = onEnter;
	onEnteringRef.current = onEntering;
	onEnteredRef.current = onEntered;
	onExitRef.current = onExit;
	onExitingRef.current = onExiting;
	onExitedRef.current = onExited;

	let nodeRef = useRef<HTMLElement>(null);

	const context = useContext(TransitionGroupContext);
	// In the context of a TransitionGroup all enters are really appears
	const appearResolved = context && !context.isMounting ? enter : appear;

	let initialStatus: TransitionStatus;
	if (inProp) {
		if (appearResolved) {
			initialStatus = EXITED;
		} else {
			initialStatus = ENTERED;
		}
	} else {
		if (unmountOnExit || mountOnEnter) {
			initialStatus = UNMOUNTED;
		} else {
			initialStatus = EXITED;
		}
	}

	const [state, setState] = useState<{
		status: TransitionStatus;
		node?: HTMLElement | null;
		nextTimeout?: number;
		appearing?: boolean;
	}>({
		status: initialStatus,
	});

	// getDerivedStateFromProps
	if (inProp && state.status === UNMOUNTED) {
		setState({ status: EXITED });
	}

	useEffect(() => {
		const { status, node, nextTimeout, appearing } = state;
		let timeoutID: ReturnType<typeof setTimeout>;

		// Set node to the current nodeRef element
		const currentNode = node || nodeRef.current;

		const onTransitionEnd = (cb: () => void) => {
			if (!currentNode || nextTimeout == null) {
				timeoutID = setTimeout(cb, 0);
				return;
			}
			timeoutID = setTimeout(cb, nextTimeout);
		};

		switch (status) {
			case ENTERING: {
				onEnteringRef.current(currentNode!, appearing);

				onTransitionEnd(() => {
					setState({ status: ENTERED, node: currentNode, appearing });
				});
				break;
			}
			case ENTERED: {
				onEnteredRef.current(currentNode!, appearing);
				break;
			}
			case EXITING: {
				onExitingRef.current(currentNode!);

				onTransitionEnd(() => {
					setState({ status: EXITED, node: currentNode });
				});
				break;
			}
			case EXITED: {
				onExitedRef.current(currentNode!);
				break;
			}
		}

		return () => {
			clearTimeout(timeoutID);
		};
	}, [state]);

	/**
	 * getTimeouts parses the timeout prop and returns an object containing
	 * `exit`, `enter` and `appear` timeouts.
	 */
	const getTimeouts = useCallback(() => {
		let exitT, enterT, appearT;

		if (timeout != null && typeof timeout !== 'number') {
			exitT = timeout.exit;
			enterT = timeout.enter;
			appearT = timeout.appear !== undefined ? timeout.appear : enterT;
		} else {
			exitT = enterT = appearT = timeout;
		}
		return { exit: exitT, enter: enterT, appear: appearT };
	}, [timeout]);

	/**
	 * Perform the enter transition:
	 * onEnter -> onEntering -> onEntered
	 */
	const performEnter = useCallback(
		(node: HTMLElement, mounting: boolean) => {
			// Skip right into ENTERED if the enter animation is disabled
			// If we are mounting and running this it means appear _must_ be set
			if (!mounting && !enter) {
				setState({
					status: ENTERED,
					node,
					nextTimeout: undefined,
					appearing: undefined,
				});
				return;
			}

			const timeouts = getTimeouts();
			const appearing = context ? context.isMounting : mounting;
			const nextTimeout = appearing ? timeouts.appear : timeouts.enter;

			onEnterRef.current(node, appearing);
			setState({ status: ENTERING, node, nextTimeout, appearing });
		},
		[context, enter, getTimeouts],
	);

	/**
	 * Perform the exit transition:
	 * onExit -> onExiting -> onExited
	 */
	const performExit = useCallback(
		(node: HTMLElement) => {
			// Skip right into EXITED if the exit animation is disabled
			if (!exit) {
				setState({
					status: EXITED,
					node,
					nextTimeout: undefined,
					appearing: undefined,
				});
				return;
			}

			const timeouts = getTimeouts();

			onExitRef.current(node);
			setState({
				status: EXITING,
				node,
				nextTimeout: timeouts.exit,
				appearing: undefined,
			});
		},
		[exit, getTimeouts],
	);

	//////////////////////////////////////////////////////////////////////////////

	// Update the current transition status
	const updateStatus = useCallback(
		(mounting = false, nextStatus: TransitionStatus | null) => {
			if (nextStatus !== null) {
				// nextStatus will always be ENTERING or EXITING.
				const node = nodeRef.current as HTMLElement;

				if (nextStatus === ENTERING) {
					performEnter(node, mounting);
				} else {
					performExit(node);
				}
			} else if (unmountOnExit && state.status === EXITED) {
				setState({ status: UNMOUNTED });
			}
		},
		[performEnter, performExit, unmountOnExit, state.status],
	);

	const mounted = useRef<boolean>(false);
	useEffect(() => {
		let nextStatus: TransitionStatus | null = null;
		const { status } = state;

		if (inProp) {
			if (status !== ENTERING && status !== ENTERED) {
				nextStatus = ENTERING;
			}
		} else {
			if (status === ENTERING || status === ENTERED) {
				nextStatus = EXITING;
			}
		}
		updateStatus(!mounted.current, nextStatus);
		mounted.current = true;
	}, [state, inProp, updateStatus]);

	if (state.status === UNMOUNTED) {
		return null;
	}

	// filter out all transition-specific props before passing to child
	const {
		in: _in,
		mountOnEnter: _mountOnEnter,
		unmountOnExit: _unmountOnExit,
		appear: _appear,
		enter: _enter,
		exit: _exit,
		timeout: _timeout,
		onEnter: _onEnter,
		onEntering: _onEntering,
		onEntered: _onEntered,
		onExit: _onExit,
		onExiting: _onExiting,
		onExited: _onExited,
		children: _children,
		...filteredChildProps
	} = props as Record<string, unknown>;

	const child =
		typeof children === 'function'
			? (children(state.status) as ReactElement)
			: (Children.only(children) as ReactElement);

	nodeRef = (child as ReactElement & { ref?: typeof nodeRef }).ref || nodeRef;
	return (
		// allows for nested Transitions
		<TransitionGroupContext.Provider value={null}>
			{cloneElement(child as ReactElement<Record<string, unknown>>, {
				...filteredChildProps,
				ref: nodeRef,
			})}
		</TransitionGroupContext.Provider>
	);
}
