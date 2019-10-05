import { Pipe } from '../../src/pipe/pipe';
import { DelegateHandler } from '../../src/handler/delegate';
import { ProcessDirection } from '../../src/process/process';

//******************************************************************************
describe('Process Context', () => {
  const pipe: Pipe = new Pipe({});
  const handlers = [
    new DelegateHandler({id: 0}),
    new DelegateHandler({id: 1}),
    new DelegateHandler({id: 2}),
  ];
  beforeEach(() => {
    pipe.removeAll();
    for(const h of handlers)
    {
      pipe.addTail(h);
    }
  });
  //----------------------------------------------------------------------------
  test('Iteraton toTail', () => {
    const cntx = pipe.getContext().setDir(ProcessDirection.TOTAIL);
    const actual = [...cntx];
    const expected = [pipe['head'].handler, ...handlers, pipe['tail'].handler];
    expect(actual).toEqual(expected);
    const next = cntx.next();
    expect(next.done).toBe(true);
    expect(next.value).toBe(undefined);
  });
  //----------------------------------------------------------------------------
  test('Iteraton toHead', () => {
    const cntx = pipe.getContext().setDir(ProcessDirection.TOHEAD);
    const actual = [...cntx];
    const expected = [pipe['head'].handler, ...handlers, pipe['tail'].handler].reverse();
    expect(actual).toEqual(expected);
    const next = cntx.next();
    expect(next.done).toBe(true);
    expect(next.value).toBe(undefined);
  });
  //----------------------------------------------------------------------------
  test('Iteraton with removal', () => {
    const cntx = pipe.getContext().setDir(ProcessDirection.TOTAIL);
    expect(cntx.next().value).toBe(pipe['head'].handler);
    expect(cntx.next().value).toBe(handlers[0]);
    pipe.removeHandler(handlers[0]);
    expect(cntx.next().value).toBe(handlers[1]);
    pipe.removeHandler(handlers[1]);
    pipe.addBefore(handlers[1], handlers[2]);
    expect(cntx.next().value).toBe(handlers[2]);
    pipe.addAfter(handlers[0], handlers[2]);
    pipe.removeHandler(handlers[2]);
    expect(cntx.next().value).toBe(handlers[0]);
    expect(cntx.next().value).toBe(pipe['tail'].handler);
    expect(cntx.next().value).toBe(undefined);
  });
  //----------------------------------------------------------------------------
  test('Clone', () => {
    const cntx = pipe.getContext().setDir(ProcessDirection.TOHEAD);
    const clone0 = cntx.clone();
    expect(cntx.next()).toStrictEqual(clone0.next());
    const clone1 = clone0.clone();
    expect(cntx.next()).toStrictEqual(clone1.next());
  });
});
//******************************************************************************