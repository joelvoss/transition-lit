import { useRef } from 'react';

import { Transition } from './transition';
import type { CSSTransitionProps, EnterHandler, ExitHandler } from './types';

////////////////////////////////////////////////////////////////////////////////

/**
 * Helper function to add classes to a DOM node. This is used by the
 * `CSSTransition` component to apply class names at each stage of the
 * transition.
 */
const addClassToNode = (node: HTMLElement, classes: string) => {
	if (node && classes) {
		classes.split(' ').forEach((c) => node.classList.add(c));
	}
};

/**
 * Helper function to remove classes from a DOM node. This is used by the
 * `CSSTransition` component to clean up class names after a transition is
 * complete.
 */
const removeClassFromNode = (node: HTMLElement, classes: string) => {
	if (node && classes) {
		classes.split(' ').forEach((c) => node.classList.remove(c));
	}
};

////////////////////////////////////////////////////////////////////////////////

/**
 * A component that extends `<Transition>` to add CSS transition effects. It
 * does this by adding specific class names to the DOM node at each stage of
 * the transition, which you can then style with CSS. The `classNames` prop
 * determines the class names that are applied during the transition, and you
 * can use the `onEnter`, `onEntering`, `onEntered`, `onExit`, `onExiting`, and
 * `onExited` callbacks to perform additional actions at each stage of the
 * transition.
 */
export function CSSTransition({
	classNames = '',
	...props
}: CSSTransitionProps) {
	const appliedClasses = useRef<{ [key: string]: Record<string, string> }>({
		appear: {},
		enter: {},
		exit: {},
	});

	const getClassNames = (type: string): { [key: string]: string } => {
		const prefix =
			typeof classNames === 'string' && classNames ? `${classNames}-` : '';

		const base =
			typeof classNames === 'string' ? `${prefix}${type}` : classNames[type];
		const active =
			typeof classNames === 'string'
				? `${base}-active`
				: classNames[`${type}Active`];
		const done =
			typeof classNames === 'string'
				? `${base}-done`
				: classNames[`${type}Done`];

		return {
			base,
			active,
			done,
		};
	};

	const addClass = (node: HTMLElement, type: string, phase: string) => {
		let className = getClassNames(type)[phase];

		if (type === 'appear' && phase === 'done') {
			className += ` ${getClassNames('enter').done}`;
		}

		// This hack forces a repaint.
		// @see https://gist.github.com/paulirish/5d52fb081b3570c81e3a
		// This is necessary in order to transition styles when adding a classname.
		if (phase === 'active') {
			// eslint-disable-next-line no-unused-expressions
			node && node.scrollTop;
		}

		appliedClasses.current[type][phase] = className;
		addClassToNode(node, className);
	};

	const removeClasses = (node: HTMLElement, type: string) => {
		const { base, active, done } = appliedClasses.current[type];
		appliedClasses.current[type] = {};

		if (base) {
			removeClassFromNode(node, base);
		}
		if (active) {
			removeClassFromNode(node, active);
		}
		if (done) {
			removeClassFromNode(node, done);
		}
	};

	const onEnter: EnterHandler = (node, appearing) => {
		removeClasses(node, 'exit');
		addClass(node, appearing ? 'appear' : 'enter', 'base');

		if (props.onEnter) {
			props.onEnter(node, appearing);
		}
	};

	const onEntering: EnterHandler = (node, appearing) => {
		const type = appearing ? 'appear' : 'enter';
		addClass(node, type, 'active');

		if (props.onEntering) {
			props.onEntering(node, appearing);
		}
	};

	const onEntered: EnterHandler = (node, appearing) => {
		const type = appearing ? 'appear' : 'enter';
		removeClasses(node, type);
		addClass(node, type, 'done');

		if (props.onEntered) {
			props.onEntered(node, appearing);
		}
	};

	const onExit: ExitHandler = (node) => {
		removeClasses(node, 'appear');
		removeClasses(node, 'enter');
		addClass(node, 'exit', 'base');

		if (props.onExit) {
			props.onExit(node);
		}
	};

	const onExiting: ExitHandler = (node) => {
		addClass(node, 'exit', 'active');

		if (props.onExiting) {
			props.onExiting(node);
		}
	};

	const onExited: ExitHandler = (node) => {
		removeClasses(node, 'exit');
		addClass(node, 'exit', 'done');

		if (props.onExited) {
			props.onExited(node);
		}
	};

	return (
		<Transition
			{...props}
			onEnter={onEnter}
			onEntered={onEntered}
			onEntering={onEntering}
			onExit={onExit}
			onExiting={onExiting}
			onExited={onExited}
		/>
	);
}
