import React from 'react';
// @ts-ignore
import { render, cleanup, waitFor } from '@testing-library/react';
import { Transition } from '../transition';

describe('Transition', () => {
  afterEach(cleanup);

  it('should not transition on mount', async () => {
    const { getByText } = render(
      <Transition
        in
        timeout={0}
        onEnter={() => {
          throw new Error('should not Enter');
        }}
      >
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    expect(getByText(/entered/i)).toBeInTheDocument();
  });

  it('should transition on mount with `appear`', async () => {
    const cb = jest.fn();

    const { getByText } = render(
      <Transition in appear timeout={200} onEnter={cb}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    expect(getByText(/entering/i)).toBeInTheDocument();
    expect(cb).toBeCalledTimes(1);
    await waitFor(() => expect(getByText(/entered/i)).toBeInTheDocument());
  });

  it('should pass filtered props to children', async () => {
    const ChildComponent = React.forwardRef((props, ref: any) => {
      return <div ref={ref}>{JSON.stringify(props)}</div>;
    });

    const { asFragment } = render(
      <Transition
        // @ts-ignore
        foo="foo"
        bar="bar"
        in
        mountOnEnter
        unmountOnExit
        appear
        enter
        exit
        timeout={0}
        addEndListener={() => {}}
        onEnter={() => {}}
        onEntering={() => {}}
        onEntered={() => {}}
        onExit={() => {}}
        onExiting={() => {}}
        onExited={() => {}}
      >
        <ChildComponent />
      </Transition>,
    );

    await waitFor(() =>
      expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          {"foo":"foo","bar":"bar"}
        </div>
      </DocumentFragment>
    `),
    );
  });

  it('should mount/unmount immediately if not have enter/exit timeout', async () => {
    const { getByText, rerender } = render(
      <Transition in={true} timeout={{}}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    expect(getByText(/entered/i)).toBeInTheDocument();

    let calledAfterTimeout = false;
    setTimeout(() => {
      calledAfterTimeout = true;
    }, 10);

    rerender(
      <Transition in={false} timeout={{}}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    await waitFor(() => {
      expect(getByText(/exited/i)).toBeInTheDocument();
      expect(calledAfterTimeout).toBe(false);
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('Appearing timeout', () => {
  afterEach(cleanup);

  it('should use enter timeout if appear not set', async () => {
    let calledBeforeEntered = false;
    setTimeout(() => {
      calledBeforeEntered = true;
    }, 10);

    const { getByText } = render(
      <Transition in={true} timeout={{ enter: 20, exit: 10 }} appear>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    await waitFor(() => {
      expect(getByText(/entered/i)).toBeInTheDocument();
      expect(calledBeforeEntered).toBe(true);
    });
  });

  it('should use appear timeout if appear is set', async () => {
    const { getByText } = render(
      <Transition in={true} timeout={{ enter: 20, exit: 10, appear: 5 }} appear>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    let isCausedLate = false;
    setTimeout(() => {
      isCausedLate = true;
    }, 15);

    await waitFor(() => {
      expect(getByText(/entered/i)).toBeInTheDocument();
      expect(isCausedLate).toBe(true);
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('Entering', () => {
  afterEach(cleanup);

  it('should fire callbacks', async () => {
    const { getByText, rerender } = render(
      <Transition timeout={10}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );
    expect(getByText(/exited/i)).toBeInTheDocument();

    let callOrder: string[] = [];
    let onEnter = jest.fn(() => callOrder.push('onEnter'));
    let onEntering = jest.fn(() => callOrder.push('onEntering'));

    rerender(
      <Transition
        in={true}
        timeout={10}
        onEnter={onEnter}
        onEntering={onEntering}
      >
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );
    expect(onEnter).toBeCalledTimes(1);
    expect(onEntering).toBeCalledTimes(1);
    expect(callOrder).toEqual(['onEnter', 'onEntering']);
  });

  it('should move to each transition state', async () => {
    const { getByText, rerender } = render(
      <Transition timeout={10}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );
    expect(getByText(/exited/i)).toBeInTheDocument();

    let count = 0;
    rerender(
      <Transition
        in={true}
        timeout={10}
        onEnter={() => count++}
        onEntering={() => count++}
        onEntered={() => count++}
      >
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    await waitFor(() => expect(getByText(/entering/i)).toBeInTheDocument());
    await waitFor(() => expect(getByText(/entered/i)).toBeInTheDocument());
    expect(count).toBe(3);
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('Exiting', () => {
  afterEach(cleanup);

  it('should fire callbacks', async () => {
    const { getByText, rerender } = render(
      <Transition in timeout={10}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );
    expect(getByText(/entered/i)).toBeInTheDocument();

    let callOrder: string[] = [];
    let onExit = jest.fn(() => callOrder.push('onExit'));
    let onExiting = jest.fn(() => callOrder.push('onExiting'));

    rerender(
      <Transition in={false} timeout={10} onExit={onExit} onExiting={onExiting}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );
    expect(onExit).toBeCalledTimes(1);
    expect(onExiting).toBeCalledTimes(1);
    expect(callOrder).toEqual(['onExit', 'onExiting']);
  });

  it('should move to each transition state', async () => {
    const { getByText, rerender } = render(
      <Transition in timeout={10}>
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );
    expect(getByText(/entered/i)).toBeInTheDocument();

    let count = 0;
    rerender(
      <Transition
        in={false}
        timeout={10}
        onExit={() => count++}
        onExiting={() => count++}
        onExited={() => count++}
      >
        {(state: any) => <span>{state}</span>}
      </Transition>,
    );

    await waitFor(() => expect(getByText(/exiting/i)).toBeInTheDocument());
    await waitFor(() => expect(getByText(/exited/i)).toBeInTheDocument());
    expect(count).toBe(3);
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('mountOnEnter', () => {
  afterEach(cleanup);

  const MountTransition: React.FC<any> = ({ initialIn, ...rest }) => {
    return (
      <Transition in={initialIn} mountOnEnter timeout={0} {...rest}>
        {(state: any) => <span>{state}</span>}
      </Transition>
    );
  };

  it('should mount when entering', async () => {
    const { getByText, asFragment, rerender } = render(
      <MountTransition initialIn={false} />,
    );
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);

    rerender(
      <MountTransition
        initialIn={true}
        onEnter={() => {
          expect(getByText(/exited/i)).toBeInTheDocument();
        }}
      />,
    );

    expect(getByText(/entering/i)).toBeInTheDocument();
    await waitFor(() => expect(getByText(/entered/i)).toBeInTheDocument());
  });

  it('should stay mounted after exiting', async () => {
    const { getByText, asFragment, rerender } = render(
      <MountTransition initialIn={false} />,
    );
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);

    rerender(<MountTransition initialIn={true} />);
    await waitFor(() => expect(getByText(/entered/i)).toBeInTheDocument());

    rerender(<MountTransition initialIn={false} />);
    await waitFor(() => expect(getByText(/exited/i)).toBeInTheDocument());
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('unmountOnExit', () => {
  afterEach(cleanup);

  const UnmountTransition: React.FC<any> = ({ initialIn, ...rest }) => {
    return (
      <Transition in={initialIn} unmountOnExit timeout={0} {...rest}>
        {(state: any) => <span>{state}</span>}
      </Transition>
    );
  };

  it('should mount when entering', async () => {
    const { getByText, asFragment, rerender } = render(
      <UnmountTransition initialIn={false} />,
    );
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);

    rerender(
      <UnmountTransition
        initialIn={true}
        onEnter={() => {
          expect(getByText(/exited/i)).toBeInTheDocument();
        }}
      />,
    );

    expect(getByText(/entering/i)).toBeInTheDocument();
    await waitFor(() => expect(getByText(/entered/i)).toBeInTheDocument());
  });

  it('should unmount after exiting', async () => {
    const { getByText, asFragment, rerender } = render(
      <UnmountTransition initialIn={false} />,
    );
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);

    rerender(<UnmountTransition initialIn={true} />);
    await waitFor(() => expect(getByText(/entered/i)).toBeInTheDocument());

    rerender(<UnmountTransition initialIn={false} />);
    await waitFor(() => expect(getByText(/exited/i)).toBeInTheDocument());
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);
  });
});
