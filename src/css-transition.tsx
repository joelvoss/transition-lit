import React from 'react';
import addOneClass from 'dom-helpers/addClass';
import removeOneClass from 'dom-helpers/removeClass';
import { CSSTransitionProps, EnterFn, ExitFn } from './types';
import { Transition } from './transition';

const addClassToNode = (node: HTMLElement, classes: string) =>
  node && classes && classes.split(' ').forEach(c => addOneClass(node, c));
const removeClassFromNode = (node: HTMLElement, classes: string) =>
  node && classes && classes.split(' ').forEach(c => removeOneClass(node, c));

export const CSSTransition: React.FC<CSSTransitionProps> = ({
  classNames = '',
  ...props
}) => {
  const appliedClasses = React.useRef<{ [key: string]: any }>({
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

  const onEnter: EnterFn = (node, appearing) => {
    removeClasses(node, 'exit');
    addClass(node, appearing ? 'appear' : 'enter', 'base');

    if (props.onEnter) {
      props.onEnter(node, appearing);
    }
  };

  const onEntering: EnterFn = (node, appearing) => {
    const type = appearing ? 'appear' : 'enter';
    addClass(node, type, 'active');

    if (props.onEntering) {
      props.onEntering(node, appearing);
    }
  };

  const onEntered: EnterFn = (node, appearing) => {
    const type = appearing ? 'appear' : 'enter';
    removeClasses(node, type);
    addClass(node, type, 'done');

    if (props.onEntered) {
      props.onEntered(node, appearing);
    }
  };

  const onExit: ExitFn = node => {
    removeClasses(node, 'appear');
    removeClasses(node, 'enter');
    addClass(node, 'exit', 'base');

    if (props.onExit) {
      props.onExit(node);
    }
  };

  const onExiting: ExitFn = node => {
    addClass(node, 'exit', 'active');

    if (props.onExiting) {
      props.onExiting(node);
    }
  };

  const onExited: ExitFn = node => {
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
};
