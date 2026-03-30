import { describe, expect, it, beforeEach } from 'vitest';

import { getChildMapping, mergeChildMappings } from '../src/utils';

describe('getChildMapping', () => {
	it('should resolve the correct child mapping', () => {
		const oneone = <div key="oneone" />;
		const onetwo = <div key="onetwo" />;
		const one = (
			<div key="one">
				{oneone}
				{onetwo}
			</div>
		);
		const two = <div key="two">two</div>;
		const component = (
			<div>
				{one}
				{two}
			</div>
		);

		const mapping = getChildMapping(component.props.children);

		expect(mapping['one']).toEqual(one);
		expect(mapping['two']).toEqual(two);
	});
});

describe('mergeChildMappings', () => {
	let Component: React.FC<Record<string, unknown>>;

	beforeEach(() => {
		Component = () => {
			return <div />;
		};
	});

	it('should merge mappings with added keys', () => {
		const prev = {
			one: <Component first />,
			two: <Component second />,
		};
		const next = {
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
		};

		expect(mergeChildMappings(prev, next)).toEqual({
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
		});
	});

	it('should merge mappings with removed keys', () => {
		const prev = {
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
		};
		const next = {
			one: <Component first />,
			two: <Component second />,
		};

		expect(mergeChildMappings(prev, next)).toEqual({
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
		});
	});

	it('should merge mappings with added and removed keys', () => {
		const prev = {
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
		};
		const next = {
			one: <Component first />,
			two: <Component second />,
			four: <Component fourth />,
		};

		expect(mergeChildMappings(prev, next)).toEqual({
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
			four: <Component fourth />,
		});
	});

	it('should reconcile overlapping insertions and deletions', () => {
		const prev = {
			one: <Component first />,
			two: <Component second />,
			four: <Component fourth />,
			five: <Component fifth />,
		};
		const next = {
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
			five: <Component fifth />,
		};

		expect(mergeChildMappings(prev, next)).toEqual({
			one: <Component first />,
			two: <Component second />,
			three: <Component third />,
			four: <Component fourth />,
			five: <Component fifth />,
		});
	});

	it('should handle undefined inputs', () => {
		let prev: Record<string, React.ReactNode> | undefined = {
			one: <Component first />,
			two: <Component second />,
		};
		let next: Record<string, React.ReactNode> | undefined;

		expect(mergeChildMappings(prev, next)).toEqual({
			one: <Component first />,
			two: <Component second />,
		});

		prev = undefined;

		next = {
			three: <Component third />,
			four: <Component fourth />,
		};

		expect(mergeChildMappings(prev, next)).toEqual({
			three: <Component third />,
			four: <Component fourth />,
		});
	});
});
