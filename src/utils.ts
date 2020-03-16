import React, { ReactElement, ReactNode } from 'react';
import { ChildMapping, TransitionGroupProps } from './types';

type MapFn = (child: ReactElement) => ReactElement;

export function getChildMapping(children: ReactNode, mapFn?: MapFn) {
  let result: ChildMapping = Object.create(null);
  if (children) {
    React.Children.forEach(children, child => {
      // run the map function here instead so that the key is the computed one
      if (child && React.isValidElement<any>(child)) {
        result[child.key!] = mapFn ? mapFn(child) : child;
      }
    });
  }
  return result;
}

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
    // return key in next ? next[key] : prev[key];
  }

  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  let nextKeysPending: { [key: string]: string[] } = Object.create(null);

  let pendingKeys: string[] = [];
  for (let prevKey in prev) {
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
  let childMapping: ChildMapping = {};
  for (let nextKey in next) {
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

function getProp(
  child: React.ReactElement<any>,
  prop: string,
  props: { [key: string]: any },
) {
  return props[prop] != null ? props[prop] : child.props[prop];
}

export function getInitialChildMapping(
  props: React.PropsWithChildren<TransitionGroupProps>,
  onExited: (child: React.ReactElement<any>, node: HTMLElement) => void,
) {
  return getChildMapping(props.children, child => {
    return React.cloneElement(child, {
      onExited: onExited.bind(null, child),
      in: true,
      appear: getProp(child, 'appear', props),
      enter: getProp(child, 'enter', props),
      exit: getProp(child, 'exit', props),
    });
  });
}

export function getNextChildMapping(
  nextProps: React.PropsWithChildren<TransitionGroupProps>,
  prevChildMapping: ChildMapping,
  onExited: (child: React.ReactElement<any>, node: HTMLElement) => void,
) {
  let nextChildMapping = getChildMapping(nextProps.children);
  let children = mergeChildMappings(prevChildMapping, nextChildMapping);

  Object.keys(children).forEach(key => {
    let child = children[key];

    if (!React.isValidElement<any>(child)) return;

    const hasPrev = key in prevChildMapping;
    const hasNext = key in nextChildMapping;

    const prevChild = prevChildMapping[key];
    const isLeaving =
      React.isValidElement<any>(prevChild) && !prevChild.props.in;

    // item is new (entering)
    if (hasNext && (!hasPrev || isLeaving)) {
      children[key] = React.cloneElement(child, {
        onExited: onExited.bind(null, child),
        in: true,
        exit: getProp(child, 'exit', nextProps),
        enter: getProp(child, 'enter', nextProps),
      });
    } else if (!hasNext && hasPrev && !isLeaving) {
      // item is old (exiting)
      children[key] = React.cloneElement(child, {
        in: false,
        unmountOnExit: true,
      });
    } else if (hasNext && hasPrev && React.isValidElement<any>(prevChild)) {
      // item hasn't changed transition states
      // copy over the last transition props;
      children[key] = React.cloneElement(child, {
        onExited: onExited.bind(null, child),
        in: prevChild.props.in,
        exit: getProp(child, 'exit', nextProps),
        enter: getProp(child, 'enter', nextProps),
      });
    }
  });

  return children;
}
