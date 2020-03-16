import React from 'react';
// @ts-ignore
import { render, cleanup, waitFor } from '@testing-library/react';
import { CSSTransition } from '../css-transition';

describe('CSSTransition', () => {
  afterEach(cleanup);

  it('should flush new props to the DOM before initiating a transition', async done => {
    const { getByTestId, rerender } = render(
      <CSSTransition in={false} timeout={0} classNames="test">
        <span data-testid="element" />
      </CSSTransition>,
    );

    expect(getByTestId('element').classList.contains('test-class')).toEqual(
      false,
    );

    rerender(
      <CSSTransition
        in={true}
        timeout={0}
        classNames="test"
        className="test-class"
        onEnter={node => {
          expect(node.classList.contains('test-class')).toEqual(true);
          expect(node.classList.contains('test-enter')).toEqual(true);
          expect(node.classList.contains('test-enter-active')).toEqual(false);
          done();
        }}
      >
        <span data-testid="element" />
      </CSSTransition>,
    );
  });
});

describe('entering', () => {
  afterEach(cleanup);

  it('should apply classes at each transition state', async () => {
    let count = 0;

    const { getByTestId, rerender } = render(
      <CSSTransition timeout={10} classNames="test">
        <span />
      </CSSTransition>,
    );

    rerender(
      <CSSTransition
        in={true}
        timeout={100}
        classNames="test"
        onEnter={node => {
          count++;
          expect(node.className).toEqual('test-enter');
        }}
        onEntering={() => {
          count++;
        }}
      >
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'test-enter test-enter-active',
      );
    });

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual('test-enter-done');
      expect(count).toEqual(2);
    });
  });

  it('should apply custom classNames names', async () => {
    let count = 0;

    const { getByTestId, rerender } = render(
      <CSSTransition
        timeout={10}
        classNames={{
          enter: 'custom',
          enterActive: 'custom-super-active',
          enterDone: 'custom-super-done',
        }}
      >
        <span />
      </CSSTransition>,
    );

    rerender(
      <CSSTransition
        in={true}
        timeout={100}
        classNames={{
          enter: 'custom',
          enterActive: 'custom-super-active',
          enterDone: 'custom-super-done',
        }}
        onEnter={node => {
          count++;
          expect(node.className).toEqual('custom');
        }}
        onEntering={() => {
          count++;
        }}
      >
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'custom custom-super-active',
      );
    });

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual('custom-super-done');
      expect(count).toEqual(2);
    });
  });
});

describe('appearing', () => {
  it('should apply appear classes at each transition state', async () => {
    let count = 0;

    const { getByTestId } = render(
      <CSSTransition
        in={true}
        appear
        timeout={10}
        classNames="appear-test"
        onEnter={(node, isAppearing) => {
          count++;
          expect(isAppearing).toEqual(true);
          expect(node.className).toEqual('appear-test-appear');
        }}
        onEntering={(_, isAppearing) => {
          count++;
          expect(isAppearing).toEqual(true);
        }}
        onEntered={(_, isAppearing) => {
          expect(isAppearing).toEqual(true);
        }}
      >
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'appear-test-appear appear-test-appear-active',
      );
    });

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'appear-test-appear-done appear-test-enter-done',
      );
      expect(count).toEqual(2);
    });
  });

  it('should lose the "*-appear-done" class after leaving and entering again', async () => {
    const { getByTestId, rerender } = render(
      <CSSTransition in={true} appear timeout={10} classNames="appear-test">
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'appear-test-appear-done appear-test-enter-done',
      );
    });

    rerender(
      <CSSTransition in={false} appear timeout={10} classNames="appear-test">
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual('appear-test-exit-done');
    });

    rerender(
      <CSSTransition in={true} appear timeout={10} classNames="appear-test">
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'appear-test-enter-done',
      );
    });
  });

  it('should not be appearing in normal enter mode', async () => {
    let count = 0;

    const { getByTestId, rerender } = render(
      <CSSTransition appear timeout={10} classNames="not-appear-test">
        <span data-testid="example" />
      </CSSTransition>,
    );

    rerender(
      <CSSTransition
        in={true}
        appear
        timeout={10}
        classNames="not-appear-test"
        onEnter={(node, isAppearing) => {
          count++;
          expect(isAppearing).toEqual(false);
          expect(node.className).toEqual('not-appear-test-enter');
        }}
        onEntering={(_, isAppearing) => {
          count++;
          expect(isAppearing).toEqual(false);
        }}
        onEntered={(_, isAppearing) => {
          expect(isAppearing).toEqual(false);
        }}
      >
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'not-appear-test-enter not-appear-test-enter-active',
      );
    });

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'not-appear-test-enter-done',
      );
      expect(count).toEqual(2);
    });
  });

  it('should not enter the transition states when appear=false', async () => {
    let count = 0;
    const { getByTestId } = render(
      <CSSTransition
        in={true}
        appear={false}
        timeout={10}
        classNames="appear-fail-test"
        onEnter={() => {
          count++;
          throw Error('Enter called!');
        }}
        onEntering={() => {
          count++;
          throw Error('Entering called!');
        }}
      >
        <span data-testid="example" />
      </CSSTransition>,
    );

    await waitFor(() => {
      expect(getByTestId('example').className).toEqual(
        'appear-fail-test-enter-done',
      );
      expect(count).toBe(0);
    });
  });
});
