import {
	Children,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react';

import type { ChildMapping, TransitionGroupProps } from './types';

////////////////////////////////////////////////////////////////////////////////

type MapFn = (child: ReactElement) => ReactElement;

/**
 * Given `this.props.children`, return an object mapping key to child. The
 * argument `mapFn` is optional and allows you to map the children before they
 * are stored. This is useful if you want to modify a child before it's used.
 * The argument `mapFn` will only be called if the child is a valid
 * ReactElement. Otherwise, the child will be passed through unmodified.
 */
export function getChildMapping(children: ReactNode, mapFn?: MapFn) {
	const result: ChildMapping = Object.create(null);
	if (children) {
		Children.forEach(children, (child) => {
			if (child && isValidElement<{ key?: string | null }>(child)) {
				result[child.key!] = mapFn ? mapFn(child as ReactElement) : child;
			}
		});
	}
	return result;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Given the previous and next children, return a merged list of children,
 * preserving the keys of `prev` and inserting any new keys in `next` in their
 * correct positions. The `onExited` function provided to each child will be
 * called once that child has fully exited. The `onExited` functions will be
 * called in a deterministic order, (consistent with the order of keys in the
 * merged result).
 * Note that `onExited` will only be provided to transitioning components, so
 * any non-transitioning items in the merged list will not receive an `onExited`
 * prop.
 */
export function mergeChildMappings(
	prev: ChildMapping | undefined,
	next: ChildMapping | undefined,
) {
	prev = prev || {};
	next = next || {};

	function getValueForKey(key: string) {
		if (next && key in next) {
			return next[key];
		}
		if (prev && key in prev) {
			return prev[key];
		} else {
			return undefined;
		}
	}

	// For each key of `next`, the list of keys to insert before that key in
	// the combined list
	const nextKeysPending: { [key: string]: string[] } = Object.create(null);

	let pendingKeys: string[] = [];
	for (const prevKey in prev) {
		if (prevKey in next) {
			if (pendingKeys.length) {
				nextKeysPending[prevKey] = pendingKeys;
				pendingKeys = [];
			}
		} else {
			pendingKeys.push(prevKey);
		}
	}

	let i;
	const childMapping: ChildMapping = {};
	for (const nextKey in next) {
		if (nextKeysPending[nextKey]) {
			for (i = 0; i < nextKeysPending[nextKey].length; i++) {
				childMapping[nextKeysPending[nextKey][i]] = getValueForKey(
					nextKeysPending[nextKey][i],
				);
			}
		}
		childMapping[nextKey] = getValueForKey(nextKey);
	}

	// Finally, add the keys which didn't appear before any key in `next`
	for (i = 0; i < pendingKeys.length; i++) {
		childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
	}

	return childMapping;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Return the value of the prop provided, or the default value of the prop if
 * the prop is not provided. The argument `props` is used to check for the
 * default value of the prop, and is usually the props of the TransitionGroup
 * component. The argument `child` is used to check for the value of the prop on
 * the child, and is usually a child of the TransitionGroup component.
 * Note that this function returns the value of the prop on `child` if it is
 * provided, even if a default value is provided on `props`. This allows a
 * default value to be provided on TransitionGroup which can be overridden on a
 * per-child basis.
 */
function getProp(
	child: ReactElement<Record<string, unknown>>,
	prop: string,
	props: Record<string, unknown>,
) {
	return props[prop] != null ? props[prop] : child.props[prop];
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Given `this.props.children`, return an object mapping key to child, where the
 * children are the result of cloning `this.props.children` and adding the
 * specified props. The `onExited` function provided to each child will be
 * called once that child has fully exited.
 * Note that `onExited` will only be provided to transitioning components, so
 * any non-transitioning items in the merged list will not receive an `onExited`
 * prop.
 */
export function getInitialChildMapping(
	props: TransitionGroupProps & { children?: ReactNode },
	onExited: (child: ReactElement, node: HTMLElement) => void,
) {
	return getChildMapping(props.children, (child) => {
		return cloneElement(child as ReactElement<Record<string, unknown>>, {
			onExited: onExited.bind(null, child),
			in: true,
			appear: getProp(
				child as ReactElement<Record<string, unknown>>,
				'appear',
				props as Record<string, unknown>,
			),
			enter: getProp(
				child as ReactElement<Record<string, unknown>>,
				'enter',
				props as Record<string, unknown>,
			),
			exit: getProp(
				child as ReactElement<Record<string, unknown>>,
				'exit',
				props as Record<string, unknown>,
			),
		});
	});
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Given the previous and next children, return an object mapping key to child,
 * where the children are the result of cloning `nextChildren` and adding the
 * specified props. The `onExited` function provided to each child will be
 * called once that child has fully exited.
 * Note that `onExited` will only be provided to transitioning components, so
 * any non-transitioning items in the merged list will not receive an `onExited`
 * prop. Also, `getNextChildMapping` will only add `onExited` to children which
 * are present in `nextChildren`, but will add `in: false` and `unmountOnExit:
 * true` to children which are present in `prevChildren` but not
 * `nextChildren`. This ensures that transitioning components which are leaving
 * have the correct props to finish their transition, even if they don't have
 * an `onExited` prop. This also means that if a child is removed from
 * `nextChildren`, but is still present in `prevChildren`, that child will be
 * treated as leaving, even if it is still present in `nextChildren` with a
 * different key. (i.e. if you change the key of a child, it will be treated as
 * leaving and entering, even if it is still present in `nextChildren`).
 */
export function getNextChildMapping(
	nextProps: TransitionGroupProps & { children?: ReactNode },
	prevChildMapping: ChildMapping,
	onExited: (child: ReactElement, node: HTMLElement) => void,
) {
	const nextChildMapping = getChildMapping(nextProps.children);
	const children = mergeChildMappings(prevChildMapping, nextChildMapping);

	Object.keys(children).forEach((key) => {
		const child = children[key];

		if (!isValidElement<Record<string, unknown>>(child)) return;

		const hasPrev = key in prevChildMapping;
		const hasNext = key in nextChildMapping;

		const prevChild = prevChildMapping[key];
		const isLeaving =
			isValidElement<{ in?: boolean }>(prevChild) && !prevChild.props.in;

		// item is new (entering)
		if (hasNext && (!hasPrev || isLeaving)) {
			children[key] = cloneElement(child, {
				onExited: onExited.bind(null, child),
				in: true,
				exit: getProp(child, 'exit', nextProps as Record<string, unknown>),
				enter: getProp(child, 'enter', nextProps as Record<string, unknown>),
			});
		} else if (!hasNext && hasPrev && !isLeaving) {
			// item is old (exiting)
			children[key] = cloneElement(child, {
				in: false,
				unmountOnExit: true,
			});
		} else if (
			hasNext &&
			hasPrev &&
			isValidElement<Record<string, unknown>>(prevChild)
		) {
			// item hasn't changed transition states
			// copy over the last transition props
			children[key] = cloneElement(child, {
				onExited: onExited.bind(null, child),
				in: (prevChild as ReactElement<{ in?: boolean }>).props.in,
				exit: getProp(child, 'exit', nextProps as Record<string, unknown>),
				enter: getProp(child, 'enter', nextProps as Record<string, unknown>),
			});
		}
	});

	return children;
}
