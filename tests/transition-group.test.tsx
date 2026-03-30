import {
	cloneElement,
	forwardRef,
	isValidElement,
	useState,
	type FC,
	type ReactNode,
} from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup } from 'vitest-browser-react';

import { Transition } from '../src/transition';
import { TransitionGroup } from '../src/transition-group';

describe('TransitionGroup', () => {
	let log: string[];
	let TransitionComponent: FC<{ id: number | string; [key: string]: unknown }>;

	beforeEach(() => {
		log = [];
		TransitionComponent = ({ id, ...props }) => {
			return (
				<Transition
					timeout={0}
					{...props}
					onEnter={(_: HTMLElement, m?: boolean) =>
						log.push(m ? `${id}-appear` : `${id}-enter`)
					}
					onEntering={(_: HTMLElement, m?: boolean) =>
						log.push(m ? `${id}-appearing` : `${id}-entering`)
					}
					onEntered={(_: HTMLElement, m?: boolean) =>
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

	afterEach(async () => {
		await cleanup();
	});

	it('should allow callback refs', async () => {
		const ref = vi.fn();

		const Child = forwardRef<HTMLSpanElement>((_, ref) => <span ref={ref} />);

		await render(
			<TransitionGroup>
				<Child key="0" ref={ref} />
			</TransitionGroup>,
		);

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(ref).toHaveBeenCalled();
	});

	it('should work with no children', async () => {
		const screen = await render(<TransitionGroup />);
		// Should render an empty provider with no visible children
		expect(screen.baseElement.querySelectorAll('span').length).toBe(0);
	});

	it('should handle transitioning correctly', async () => {
		function Parent({ count = 1 }: { count?: number }) {
			const children = [];
			for (let i = 0; i < count; i++) {
				children.push(<TransitionComponent key={i} id={i} />);
			}
			return (
				<TransitionGroup appear enter exit>
					{children}
				</TransitionGroup>
			);
		}

		function App() {
			const [count, setCount] = useState(1);
			return (
				<>
					<button onClick={() => setCount(2)}>add</button>
					<button onClick={() => setCount(1)}>remove</button>
					<Parent count={count} />
				</>
			);
		}

		const screen = await render(<App />);

		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(log).toContain('0-appear');
		expect(log).toContain('0-appearing');
		expect(log).toContain('0-appeared');

		log = [];
		await screen.getByText('add').click();

		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(log).toContain('1-enter');
		expect(log).toContain('1-entering');
		expect(log).toContain('1-entered');

		log = [];
		await screen.getByText('remove').click();

		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(log).toContain('1-exit');
		expect(log).toContain('1-exiting');
		expect(log).toContain('1-exited');
	});

	it('should keep removed child in the DOM until exit completes', async () => {
		function App() {
			const [show, setShow] = useState(true);
			return (
				<>
					<button onClick={() => setShow(false)}>remove</button>
					<TransitionGroup>
						{
							(show ? (
								<Transition key="item" timeout={100} exit>
									<span data-testid="item">item</span>
								</Transition>
							) : undefined) as React.ReactElement<
								import('../src/types').TransitionProps
							>
						}
					</TransitionGroup>
				</>
			);
		}

		const screen = await render(<App />);
		await expect.element(screen.getByTestId('item')).toBeInTheDocument();

		await screen.getByText('remove').click();
		// Still present during exit animation
		await expect.element(screen.getByTestId('item')).toBeInTheDocument();

		// Gone once exit finishes
		await expect.element(screen.getByTestId('item')).not.toBeInTheDocument();
	});

	it('should disable enter transitions when enter=false on group', async () => {
		function App() {
			const [count, setCount] = useState(1);
			const children = [];
			for (let i = 0; i < count; i++) {
				children.push(<TransitionComponent key={i} id={i} />);
			}
			return (
				<>
					<button onClick={() => setCount(2)}>add</button>
					<TransitionGroup enter={false}>{children}</TransitionGroup>
				</>
			);
		}

		const screen = await render(<App />);
		log = [];
		await screen.getByText('add').click();
		await new Promise((resolve) => setTimeout(resolve, 100));

		// The intermediate entering phase should be skipped; it jumps straight to entered
		expect(log).not.toContain('1-enter');
		expect(log).not.toContain('1-entering');
		expect(log).toContain('1-entered');
	});

	it('should disable exit transitions when exit=false on group', async () => {
		function App() {
			const [count, setCount] = useState(2);
			const children = [];
			for (let i = 0; i < count; i++) {
				children.push(<TransitionComponent key={i} id={i} />);
			}
			return (
				<>
					<button onClick={() => setCount(1)}>remove</button>
					<TransitionGroup exit={false}>{children}</TransitionGroup>
				</>
			);
		}

		const screen = await render(<App />);
		await new Promise((resolve) => setTimeout(resolve, 50));
		log = [];
		await screen.getByText('remove').click();
		await new Promise((resolve) => setTimeout(resolve, 100));

		// The intermediate exiting phase should be skipped; it jumps straight to exited
		expect(log).not.toContain('1-exit');
		expect(log).not.toContain('1-exiting');
		expect(log).toContain('1-exited');
	});

	it('should apply childFactory to each rendered child', async () => {
		const childFactory = vi.fn((child: ReactNode) =>
			isValidElement(child)
				? cloneElement(child as React.ReactElement<Record<string, unknown>>, {
						'data-wrapped': 'true',
					})
				: child,
		);

		await render(
			<TransitionGroup childFactory={childFactory}>
				<TransitionComponent key="a" id="a" />
			</TransitionGroup>,
		);

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(childFactory).toHaveBeenCalled();
	});
});
