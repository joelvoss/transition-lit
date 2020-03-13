import React from 'react';
// @ts-ignore
import { render, cleanup, waitFor } from '@testing-library/react';
import { Transition } from '../transition';
import { TransitionGroup } from '../transition-group';

describe(`TransitionGroup`, () => {
  let log: string[], TransitionComponent: React.FC<any>;

  beforeEach(() => {
    log = [];
    TransitionComponent = ({ id, ...props }) => {
      return (
        <Transition
          timeout={0}
          {...props}
          onEnter={(_: any, m: any) =>
            log.push(m ? `${id}-appear` : `${id}-enter`)
          }
          onEntering={(_: any, m: any) =>
            log.push(m ? `${id}-appearing` : `${id}-entering`)
          }
          onEntered={(_: any, m: any) =>
            log.push(m ? `${id}-appeared` : `${id}-entered`)
          }
          onExit={() => log.push(`${id}-exit`)}
          onExiting={() => log.push(`${id}-exiting`)}
          onExited={() => log.push(`${id}-exited`)}
        >
          <span />
        </Transition>
      );
    };
  });

  afterEach(cleanup);

  it(`should allow callback refs`, () => {
    const ref = jest.fn();

    const Child = React.forwardRef<any>((_, ref) => <span ref={ref} />);

    render(
      <TransitionGroup>
        <Child key="0" ref={ref} />
      </TransitionGroup>,
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should work with no children', () => {
    const { asFragment } = render(<TransitionGroup />);
    expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);
  });

  it(`should handle transitioning correctly`, async () => {
    function Parent({ count = 1 }) {
      let children = [];
      for (let i = 0; i < count; i++)
        children.push(<TransitionComponent key={i} id={i} />);
      return (
        <TransitionGroup appear enter exit>
          {children}
        </TransitionGroup>
      );
    }

    const { rerender } = render(<Parent />);
    await waitFor(() =>
      expect(log).toEqual([
        '0-exited',
        '0-appear',
        '0-appearing',
        '0-appeared',
      ]),
    );

    log = [];
    rerender(<Parent count={2} />);
    await waitFor(() =>
      expect(log).toEqual([
        '0-appeared',
        '1-exited',
        '1-enter',
        '1-entering',
        '1-entered',
      ]),
    );

    log = [];
    rerender(<Parent count={1} />);
    await waitFor(() =>
      expect(log).toEqual([
        '0-appeared',
        '1-entered',
        '1-exit',
        '1-exiting',
        '1-exited',
      ]),
    );
  });
});
