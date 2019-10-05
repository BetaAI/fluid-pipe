import { Pipe } from '../../src/pipe/pipe';
import { DelegateHandler } from '../../src/handler/delegate';
import { Handler } from '../../src/handler/handler';

//******************************************************************************
describe('Pipe Handler Manipulation', () => {
  const pipe = new Pipe({});
  const handlers = [
    new DelegateHandler({id: 0}),
    new DelegateHandler({id: 1}),
    new DelegateHandler({id: 2}),
  ];
  beforeEach(() => pipe.removeAll());
  //----------------------------------------------------------------------------
  test('addHead', () => {
    for(const h of handlers)
    {
      pipe.addHead(h);
    }
    const actual = pipe.getHandlerArray().reverse();
    expect(actual).toEqual(handlers);
  });
  //----------------------------------------------------------------------------
  test('addTail', () => {
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    const actual = pipe.getHandlerArray();
    expect(actual).toEqual(handlers);
  });
  //----------------------------------------------------------------------------
  test('addBefore', () => {
    const start = new DelegateHandler({id: 'start'});
    pipe.addHead(start);
    for(const h of handlers)
    {
      pipe.addBefore(h, start);
    }
    const actual = pipe.getHandlerArray();
    expect(actual).toEqual([...handlers, start]);
  });
  //----------------------------------------------------------------------------
  test('addAfter', () => {
    const start = new DelegateHandler({id: 'start'});
    pipe.addHead(start);
    for(const h of handlers)
    {
      pipe.addAfter(h, start);
    }
    const actual = pipe.getHandlerArray();
    expect(actual).toEqual([...handlers, start].reverse());
  });
  //----------------------------------------------------------------------------
  test('removeHead', () => {
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    const actual: (Handler | undefined)[] = [];
    for(let i = handlers.length; --i >= 0;)
    {
      actual.push(pipe.removeHead());
    }
    expect(actual).toEqual(handlers);
  });
  //----------------------------------------------------------------------------
  test('removeTail', () => {
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    const actual: (Handler | undefined)[] = [];
    for(let i = handlers.length; --i >= 0;)
    {
      actual.push(pipe.removeTail());
    }
    expect(actual.reverse()).toEqual(handlers);
  });
  //----------------------------------------------------------------------------
  test('removeBefore', () => {
    const ref = new DelegateHandler({id: 'ref'});
    pipe.addTail(ref);
    for(const h of handlers)
    {
      pipe.addHead(h);
    }
    const actual: (Handler | undefined)[] = [];
    for(let i = handlers.length; --i >= 0;)
    {
      actual.push(pipe.removeBefore(ref));
    }
    expect(actual).toEqual(handlers);
  });
  //----------------------------------------------------------------------------
  test('removeAfter', () => {
    const ref = new DelegateHandler({id: 'ref'});
    pipe.addTail(ref);
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    const actual: (Handler | undefined)[] = [];
    for(let i = handlers.length; --i >= 0;)
    {
      actual.push(pipe.removeAfter(ref));
    }
    expect(actual).toEqual(handlers);
  });
  //----------------------------------------------------------------------------
  test('getHandler', () => {
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    for(const h of handlers)
    {
      expect(pipe.getHandler(h.id)).toStrictEqual(h);
    }
  });
  //----------------------------------------------------------------------------
  test('getHandlerBefore', () => {
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    expect(pipe.getHandlerBefore(0)).toBe(undefined);
    expect(pipe.getHandlerBefore(1)).toBe(handlers[0]);
    expect(pipe.getHandlerBefore(2)).toBe(handlers[1]);
    expect(pipe.getHandlerBefore(2, -1)).toBe(handlers[1]);
    expect(pipe.getHandlerBefore(2, 1)).toBe(handlers[0]);
    expect(pipe.getHandlerBefore(2, 2)).toBe(undefined);
  });
  //----------------------------------------------------------------------------
  test('getHandlerAfter', () => {
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
    expect(pipe.getHandlerAfter(0)).toBe(handlers[1]);
    expect(pipe.getHandlerAfter(1)).toBe(handlers[2]);
    expect(pipe.getHandlerAfter(2)).toBe(undefined);
    expect(pipe.getHandlerAfter(0, -1)).toBe(handlers[1]);
    expect(pipe.getHandlerAfter(0, 1)).toBe(handlers[2]);
    expect(pipe.getHandlerAfter(0, 2)).toBe(undefined);
  });
});
//******************************************************************************