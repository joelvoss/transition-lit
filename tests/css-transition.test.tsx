import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup } from 'vitest-browser-react';

import { CSSTransition } from '../src/css-transition';

describe('CSSTransition', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should apply enter class before enter-active on transition', async () => {
		const onEnter = vi.fn((node: HTMLElement) => {
			expect(node.classList.contains('test-enter')).toEqual(true);
			expect(node.classList.contains('test-enter-active')).toEqual(false);
		});

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<CSSTransition
						in={inProp}
						timeout={100}
						classNames="test"
						onEnter={onEnter}
					>
						<span data-testid="element" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		expect(
			screen.getByTestId('element').element().classList.contains('test-enter'),
		).toEqual(false);

		await screen.getByText('enter').click();
		expect(onEnter).toBeCalledTimes(1);
	});
});

describe('entering', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should apply classes at each transition state', async () => {
		let count = 0;

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<CSSTransition
						in={inProp}
						timeout={100}
						classNames="test"
						onEnter={(node) => {
							count++;
							expect(node.className).toEqual('test-enter');
						}}
						onEntering={() => {
							count++;
						}}
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('test-enter', 'test-enter-active');

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('test-enter-done');

		expect(count).toEqual(2);
	});

	it('should apply custom classNames names', async () => {
		let count = 0;

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<CSSTransition
						in={inProp}
						timeout={100}
						classNames={{
							enter: 'custom',
							enterActive: 'custom-super-active',
							enterDone: 'custom-super-done',
						}}
						onEnter={(node) => {
							count++;
							expect(node.className).toEqual('custom');
						}}
						onEntering={() => {
							count++;
						}}
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('custom', 'custom-super-active');

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('custom-super-done');

		expect(count).toEqual(2);
	});
});

describe('appearing', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should apply appear classes at each transition state', async () => {
		let count = 0;

		const screen = await render(
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
				onEntering={(_node, isAppearing) => {
					count++;
					expect(isAppearing).toEqual(true);
				}}
				onEntered={(_node, isAppearing) => {
					expect(isAppearing).toEqual(true);
				}}
			>
				<span data-testid="example" />
			</CSSTransition>,
		);

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('appear-test-appear', 'appear-test-appear-active');

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('appear-test-appear-done', 'appear-test-enter-done');

		expect(count).toEqual(2);
	});

	it('should lose the "*-appear-done" class after leaving and entering again', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp((v) => !v)}>toggle</button>
					<CSSTransition
						in={inProp}
						appear
						timeout={10}
						classNames="appear-test"
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('appear-test-appear-done', 'appear-test-enter-done');

		// exit
		await screen.getByText('toggle').click();
		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('appear-test-exit-done');

		// enter again
		await screen.getByText('toggle').click();
		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('appear-test-enter-done');

		// should NOT have appear-done class
		expect(
			screen
				.getByTestId('example')
				.element()
				.classList.contains('appear-test-appear-done'),
		).toBe(false);
	});

	it('should not be appearing in normal enter mode', async () => {
		let count = 0;

		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<CSSTransition
						in={inProp}
						appear
						timeout={500}
						classNames="not-appear-test"
						onEnter={(node, isAppearing) => {
							count++;
							expect(isAppearing).toEqual(false);
							expect(node.className).toEqual('not-appear-test-enter');
						}}
						onEntering={(_node, isAppearing) => {
							count++;
							expect(isAppearing).toEqual(false);
						}}
						onEntered={(_node, isAppearing) => {
							expect(isAppearing).toEqual(false);
						}}
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('not-appear-test-enter', 'not-appear-test-enter-active');

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('not-appear-test-enter-done');

		expect(count).toEqual(2);
	});

	it('should not enter the transition states when appear=false', async () => {
		let count = 0;
		const screen = await render(
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

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('appear-fail-test-enter-done');

		expect(count).toBe(0);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('exiting', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should apply exit classes at each transition state', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<CSSTransition in={inProp} timeout={100} classNames="test">
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('test-exit', 'test-exit-active');

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('test-exit-done');
	});

	it('should remove exit classes when re-entering', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp((v) => !v)}>toggle</button>
					<CSSTransition in={inProp} timeout={10} classNames="test">
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);

		// exit
		await screen.getByText('toggle').click();
		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('test-exit-done');

		// re-enter
		await screen.getByText('toggle').click();
		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('test-enter-done');

		expect(
			screen
				.getByTestId('example')
				.element()
				.classList.contains('test-exit-done'),
		).toBe(false);
		expect(
			screen.getByTestId('example').element().classList.contains('test-exit'),
		).toBe(false);
	});

	it('should apply custom object classNames for exit', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<CSSTransition
						in={inProp}
						timeout={100}
						classNames={{
							exit: 'my-exit',
							exitActive: 'my-exit-active',
							exitDone: 'my-exit-done',
						}}
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('my-exit', 'my-exit-active');

		await expect
			.element(screen.getByTestId('example'))
			.toHaveClass('my-exit-done');
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('enter/exit disabled', () => {
	afterEach(async () => {
		await cleanup();
	});

	it('should skip enter classes when enter=false', async () => {
		function App() {
			const [inProp, setInProp] = useState(false);
			return (
				<>
					<button onClick={() => setInProp(true)}>enter</button>
					<CSSTransition
						in={inProp}
						enter={false}
						timeout={200}
						classNames="test"
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('enter').click();

		// Should land in entered state without any enter classes having been applied
		await expect
			.element(screen.getByTestId('example'))
			.not.toHaveClass('test-enter');
	});

	it('should skip exit classes when exit=false', async () => {
		function App() {
			const [inProp, setInProp] = useState(true);
			return (
				<>
					<button onClick={() => setInProp(false)}>exit</button>
					<CSSTransition
						in={inProp}
						exit={false}
						timeout={200}
						classNames="test"
					>
						<span data-testid="example" />
					</CSSTransition>
				</>
			);
		}

		const screen = await render(<App />);
		await screen.getByText('exit').click();

		await expect
			.element(screen.getByTestId('example'))
			.not.toHaveClass('test-exit');
	});
});
