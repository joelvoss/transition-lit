import { forwardRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup } from 'vitest-browser-react';

import { Transition } from '../src/transition';

describe('Transition', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should not transition on mount', async () => {
		const screen = await render(
			<Transition
				in
				timeout={0}
				onEnter={() => {
					throw new Error('should not Enter');
				}}
			>
				{(state: string) => <span>{state}</span>}
			</Transition>,
		);

		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});

	it('should transition on mount with `appear`', async () => {
		const cb = vi.fn();

		const screen = await render(
			<Transition in appear timeout={200} onEnter={cb}>
				{(state: string) => <span>{state}</span>}
			</Transition>,
		);

		await expect.element(screen.getByText(/entering/i)).toBeInTheDocument();
		expect(cb).toBeCalledTimes(1);
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});

	it('should pass filtered props to children', async () => {
		const ChildComponent = forwardRef<HTMLDivElement, Record<string, unknown>>(
			(props, ref) => {
				return <div ref={ref}>{JSON.stringify(props)}</div>;
			},
		);

		const screen = await render(
			<Transition
				foo="foo"
				bar="bar"
				in
				mountOnEnter
				unmountOnExit
				appear
				enter
				exit
				timeout={0}
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

		await expect.element(screen.getByText(/"foo":"foo"/)).toBeInTheDocument();
		await expect.element(screen.getByText(/"bar":"bar"/)).toBeInTheDocument();
	});

	it('should mount/unmount immediately if not have enter/exit timeout', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>toggle</button>
					<Transition in={inProp} timeout={{}}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();

		await screen.getByText('toggle').click();
		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();
	});

	it('should jump to entered when enter=false', async () => {
		const onEnter = vi.fn();

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition in={inProp} enter={false} timeout={200} onEnter={onEnter}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();

		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
		expect(onEnter).not.toHaveBeenCalled();
	});

	it('should jump to exited when exit=false', async () => {
		const onExit = vi.fn();

		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<Transition in={inProp} exit={false} timeout={200} onExit={onExit}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();

		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();
		expect(onExit).not.toHaveBeenCalled();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Appearing timeout', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should use enter timeout if appear not set', async () => {
		const screen = await render(
			<Transition in={true} timeout={{ enter: 20, exit: 10 }} appear>
				{(state: string) => <span>{state}</span>}
			</Transition>,
		);

		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});

	it('should use appear timeout if appear is set', async () => {
		const screen = await render(
			<Transition
				in={true}
				timeout={{ enter: 200, exit: 100, appear: 50 }}
				appear
			>
				{(state: string) => <span>{state}</span>}
			</Transition>,
		);

		// Should still be entering shortly after mount
		await expect.element(screen.getByText(/entering/i)).toBeInTheDocument();
		// Eventually reaches entered
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Entering', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should fire callbacks', async () => {
		const callOrder: string[] = [];
		const onEnter = vi.fn(() => callOrder.push('onEnter'));
		const onEntering = vi.fn(() => callOrder.push('onEntering'));

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition
						in={inProp}
						timeout={10}
						onEnter={onEnter}
						onEntering={onEntering}
					>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();

		await screen.getByText('enter').click();
		await expect.element(screen.getByText(/entering/i)).toBeInTheDocument();
		// Wait for effects to flush
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(onEnter).toBeCalledTimes(1);
		expect(onEntering).toBeCalledTimes(1);
		expect(callOrder).toEqual(['onEnter', 'onEntering']);
	});

	it('should move to each transition state', async () => {
		let count = 0;

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition
						in={inProp}
						timeout={10}
						onEnter={() => count++}
						onEntering={() => count++}
						onEntered={() => count++}
					>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();

		await expect.element(screen.getByText(/entering/i)).toBeInTheDocument();
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
		expect(count).toBe(3);
	});

	it('should fire onEntered callback with correct node', async () => {
		const onEntered = vi.fn();

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition in={inProp} timeout={10} onEntered={onEntered}>
						{(state: string) => <span data-testid="node">{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();

		expect(onEntered).toBeCalledTimes(1);
		expect(onEntered.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Exiting', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should fire callbacks', async () => {
		const callOrder: string[] = [];
		const onExit = vi.fn(() => callOrder.push('onExit'));
		const onExiting = vi.fn(() => callOrder.push('onExiting'));

		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<Transition
						in={inProp}
						timeout={10}
						onExit={onExit}
						onExiting={onExiting}
					>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();

		await screen.getByText('exit').click();
		await expect.element(screen.getByText(/exiting/i)).toBeInTheDocument();
		// Wait for effects to flush
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(onExit).toBeCalledTimes(1);
		expect(onExiting).toBeCalledTimes(1);
		expect(callOrder).toEqual(['onExit', 'onExiting']);
	});

	it('should move to each transition state', async () => {
		let count = 0;

		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<Transition
						in={inProp}
						timeout={10}
						onExit={() => count++}
						onExiting={() => count++}
						onExited={() => count++}
					>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();

		await expect.element(screen.getByText(/exiting/i)).toBeInTheDocument();
		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();
		expect(count).toBe(3);
	});

	it('should fire onExited callback with correct node', async () => {
		const onExited = vi.fn();

		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<Transition in={inProp} timeout={10} onExited={onExited}>
						{(state: string) => <span data-testid="node">{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();
		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();

		expect(onExited).toBeCalledTimes(1);
		expect(onExited.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('mountOnEnter', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should mount when entering', async () => {
		function MountTransition({ initialIn }: { initialIn: boolean }) {
			const [inProp, setInProp] = useState(initialIn);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition in={inProp} mountOnEnter timeout={0}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<MountTransition initialIn={false} />);
		// Not yet mounted - no state text visible
		expect(screen.baseElement.textContent).not.toMatch(
			/exited|entering|entered/,
		);

		await screen.getByText('enter').click();
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});

	it('should stay mounted after exiting', async () => {
		function MountTransition() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp((v) => !v)}>toggle</button>
					<Transition in={inProp} mountOnEnter timeout={0}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<MountTransition />);
		await screen.getByText('toggle').click();
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();

		await screen.getByText('toggle').click();
		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('unmountOnExit', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should mount when entering', async () => {
		function UnmountTransition({ initialIn }: { initialIn: boolean }) {
			const [inProp, setInProp] = useState(initialIn);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition in={inProp} unmountOnExit timeout={0}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<UnmountTransition initialIn={false} />);
		expect(screen.baseElement.textContent).not.toMatch(
			/exited|entering|entered/,
		);

		await screen.getByText('enter').click();
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});

	it('should unmount after exiting', async () => {
		function UnmountTransition() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp((v) => !v)}>toggle</button>
					<Transition in={inProp} unmountOnExit timeout={0}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<UnmountTransition />);
		await screen.getByText('toggle').click();
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();

		await screen.getByText('toggle').click();
		await expect.element(screen.getByText(/entered/i)).not.toBeInTheDocument();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Interruption', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should go to entered if in=true is set while entering', async () => {
		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<Transition in={inProp} timeout={500}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();
		await expect.element(screen.getByText(/entering/i)).toBeInTheDocument();
		// Should eventually settle on entered without needing to click again
		await expect.element(screen.getByText(/entered/i)).toBeInTheDocument();
	});

	it('should go to exited if in=false is set while exiting', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<Transition in={inProp} timeout={500}>
						{(state: string) => <span>{state}</span>}
					</Transition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();
		await expect.element(screen.getByText(/exiting/i)).toBeInTheDocument();
		await expect.element(screen.getByText(/exited/i)).toBeInTheDocument();
	});
});
