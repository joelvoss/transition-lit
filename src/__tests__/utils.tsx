import React from 'react';
import { getChildMapping, mergeChildMappings } from '../utils';

describe(`getChildMapping`, () => {
  it(`should resolve the correct child mapping`, () => {
    let oneone = <div key="oneone" />;
    let onetwo = <div key="onetwo" />;
    let one = (
      <div key="one">
        {oneone}
        {onetwo}
      </div>
    );
    let two = <div key="two">two</div>;
    let component = (
      <div>
        {one}
        {two}
      </div>
    );

    let mapping = getChildMapping(component.props.children);

    expect(mapping['one']).toEqual(one);
    expect(mapping['two']).toEqual(two);
  });
});

describe(`mergeChildMappings`, () => {
  let Component: React.FC<any>;

  beforeEach(() => {
    Component = () => {
      return <div />;
    };
  });

  it(`should merge mappings with added keys`, () => {
    let prev = {
      one: <Component first />,
      two: <Component second />,
    };
    let next = {
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

  it(`should merge mappings with removed keys`, () => {
    let prev = {
      one: <Component first />,
      two: <Component second />,
      three: <Component third />,
    };
    let next = {
      one: <Component first />,
      two: <Component second />,
    };

    expect(mergeChildMappings(prev, next)).toEqual({
      one: <Component first />,
      two: <Component second />,
      three: <Component third />,
    });
  });

  it(`should merge mappings with added and removed keys`, () => {
    let prev = {
      one: <Component first />,
      two: <Component second />,
      three: <Component third />,
    };
    let next = {
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

  it(`should reconcile overlapping insertions and deletions`, () => {
    let prev = {
      one: <Component first />,
      two: <Component second />,
      four: <Component fourth />,
      five: <Component fifth />,
    };
    let next = {
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

  it(`should handle undefined inputs`, () => {
    let prev: any = {
      one: <Component first />,
      two: <Component second />,
    };
    let next;

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
