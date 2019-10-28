import { Process, ProcessDirection, ProcessStatus } from '../../src/process/process';
import { DefaultFactory } from '../../src/process/factory';
import { Pipe } from '../../src/pipe/pipe';
import { DelegateHandler } from '../../src/handler/delegate';
import { Handler } from '../../src/handler/handler';

//******************************************************************************
interface IExeTestData
{
  trace: string[],
}
//******************************************************************************
describe('Process', () => {
  describe('State Management', () => {
    const prc: Process<symbol, symbol> = DefaultFactory.newInstance();
    const data = [Symbol('D-0'), Symbol('D-1'), Symbol('D-2'), Symbol('D-3')];
    //--------------------------------------------------------------------------
    test('Data Manipulation', () => {
      expect(prc.getData()).toBe(undefined);
      expect(prc.setData(data[0])).toBe(undefined);
      expect(prc.getData()).toBe(data[0]);
      expect(prc.setData(data[1], 1)).toBe(undefined);
      expect(prc.getData()).toBe(data[1]);
      expect(prc.getData(0)).toBe(data[0]);
      prc.pushData(data[2]);
      expect(() => prc.setData(data[0], -10)).toThrow();
      expect(prc.getData(-10)).toBe(undefined);
      expect(prc.getData(10)).toBe(undefined);
      expect(prc.popData()).toBe(data[2]);
      expect(prc.setData(data[4])).toBe(data[1]);
    });
    //--------------------------------------------------------------------------
    test('Message Manipulation', () => {
      expect(prc.getMessage()).toBe(undefined);
      expect(prc.setMessage(data[0])).toBe(undefined);
      expect(prc.getMessage()).toBe(data[0]);
      expect(prc.setMessage(data[1], 1)).toBe(undefined);
      expect(prc.getMessage()).toBe(data[1]);
      expect(prc.getMessage(0)).toBe(data[0]);
      prc.pushMessage(data[2]);
      expect(() => prc.setMessage(data[0], -10)).toThrow();
      expect(prc.getMessage(-10)).toBe(undefined);
      expect(prc.getMessage(10)).toBe(undefined);
      expect(prc.popMessage()).toBe(data[2]);
      expect(prc.setMessage(data[4])).toBe(data[1]);
    });
  });
  //============================================================================
  describe('Simple Execution', () => {
    const oPipe = new Pipe();
    const iPipe = new Pipe();
    const fn = (dir: string) => (prc: Process<IExeTestData, any>) => {
      const data: IExeTestData = prc.getData() || {trace: []};
      const handler = prc.handlerCur() as Handler;
      data.trace.push(`${dir}-${handler.id}`);
    }
    beforeEach(() => {
      iPipe.removeAll();
      oPipe.removeAll();
      iPipe
        .addTail(new DelegateHandler({id: 'IP0', toHead: fn('HEAD'), toTail: fn('TAIL')}))
        .addTail(new DelegateHandler({id: 'IP1', toHead: fn('HEAD'), toTail: fn('TAIL')}))
        .addTail(new DelegateHandler({id: 'IP2', toHead: fn('HEAD'), toTail: fn('TAIL')}))
        .addTail(new DelegateHandler({id: 'IP3', toHead: fn('HEAD'), toTail: fn('TAIL')}));
      oPipe
        .addTail(new DelegateHandler({id: 'OP0', toHead: fn('HEAD'), toTail: fn('TAIL')}))
        .addTail(new DelegateHandler({id: 'OP1', toHead: fn('HEAD'), toTail: fn('TAIL')}))
        .addTail(iPipe)
        .addTail(new DelegateHandler({id: 'OP2', toHead: fn('HEAD'), toTail: fn('TAIL')}))
        .addTail(new DelegateHandler({id: 'OP3', toHead: fn('HEAD'), toTail: fn('TAIL')}));
    });
    //--------------------------------------------------------------------------
    test('ToTail', () => {
      const prc: Process<IExeTestData, any> = DefaultFactory.newInstance();
      prc.pushData({trace: []});
      prc
        .setDir(ProcessDirection.TOTAIL)
        .begContext(oPipe.getContext())
        .start();
      const data: IExeTestData = prc.getData() || {trace: []};
      expect(data.trace).toEqual([
        'TAIL-OP0', 'TAIL-OP1',
        'TAIL-IP0', 'TAIL-IP1', 'TAIL-IP2', 'TAIL-IP3',
        'TAIL-OP2', 'TAIL-OP3',
      ]);
    });
    //--------------------------------------------------------------------------
    test('ToHead', () => {
      const prc: Process<IExeTestData, any> = DefaultFactory.newInstance();
      prc.pushData({trace: []});
      prc
        .setDir(ProcessDirection.TOHEAD)
        .begContext(oPipe.getContext())
        .start();
      const data: IExeTestData = prc.getData() || {trace: []};
      expect(data.trace).toEqual([
        'HEAD-OP3', 'HEAD-OP2',
        'HEAD-IP3', 'HEAD-IP2', 'HEAD-IP1', 'HEAD-IP0',
        'HEAD-OP1', 'HEAD-OP0',
      ]);
    });
    //--------------------------------------------------------------------------
    test('Direction Change', () => {
      const prc: Process<IExeTestData, any> = DefaultFactory.newInstance();
      const dirChanger = new DelegateHandler({toTail: (prc: Process<IExeTestData, any>) => prc.setDir(ProcessDirection.TOHEAD)}); 
      iPipe.addBefore(dirChanger, 'IP3');
      prc.pushData({trace: []});
      prc
        .setDir(ProcessDirection.TOTAIL)
        .begContext(oPipe.getContext())
        .start();
      const data: IExeTestData = prc.getData() || {trace: []};
      expect(data.trace).toEqual([
        'TAIL-OP0', 'TAIL-OP1',
        'TAIL-IP0', 'TAIL-IP1', 'TAIL-IP2',
        'HEAD-IP2', 'HEAD-IP1', 'HEAD-IP0',
        'HEAD-OP1', 'HEAD-OP0',
      ]);
    });
    //--------------------------------------------------------------------------
    test('Context end', () => {
      const prc: Process<IExeTestData, any> = DefaultFactory.newInstance();
      const excape = new DelegateHandler({toTail: (prc: Process<IExeTestData, any>) => prc.endContext()}); 
      iPipe.addBefore(excape, 'IP2');
      prc.pushData({trace: []});
      prc
        .setDir(ProcessDirection.TOTAIL)
        .begContext(oPipe.getContext())
        .start();
      const data: IExeTestData = prc.getData() || {trace: []};
      expect(data.trace).toEqual([
        'TAIL-OP0', 'TAIL-OP1',
        'TAIL-IP0', 'TAIL-IP1',
        'TAIL-OP2', 'TAIL-OP3',
      ]);
    });
    //--------------------------------------------------------------------------
    test('ToTail async', async () => {
      expect.assertions(2);
      const prc: Process<IExeTestData, any> = DefaultFactory.newInstance();
      prc.pushData({trace: []});
      const res = await prc
        .setDir(ProcessDirection.TOTAIL)
        .begContext(oPipe.getContext())
        .startAsync(10);
      expect(res).toBe(prc);
      const data: IExeTestData = prc.getData() || {trace: []};
      expect(data.trace).toEqual([
        'TAIL-OP0', 'TAIL-OP1',
        'TAIL-IP0', 'TAIL-IP1', 'TAIL-IP2', 'TAIL-IP3',
        'TAIL-OP2', 'TAIL-OP3',
      ]);
    });
    //--------------------------------------------------------------------------
    test('Cancel async', async () => {
      expect.assertions(3);
      const prc: Process<IExeTestData, any> = DefaultFactory.newInstance();
      prc.pushData({trace: []});
      const prom = prc
        .setDir(ProcessDirection.TOTAIL)
        .begContext(oPipe.getContext())
        .startAsync(100);
      prc.cancel();
      const res = await prom;
      expect(res).toBe(prc);
      expect(prc.getStatus()).toBe(ProcessStatus.CANCELED);
      const data: IExeTestData = prc.getData() || {trace: []};
      expect(data.trace).toEqual([]);
    });
  });
  //============================================================================
  describe('Complex Execution', () => {
    const oPipe0 = new Pipe();
    const oPipe1 = new Pipe();
    const iPipe0 = new Pipe();
    const iPipe1 = new Pipe();
    const traces: string[] = [];
    const fn = (tag: string) => () => traces.push(tag);
    iPipe0
      .addTail(new DelegateHandler({id: '0', toTail: fn('iP0-0'), toHead: fn('iP0-0')}))
      .addTail(new DelegateHandler({id: '1', toTail: fn('iP0-1'), toHead: fn('iP0-1')}))
      .addTail(new DelegateHandler({id: '2', toTail: fn('iP0-2'), toHead: fn('iP0-2')}));
    iPipe1
      .addTail(new DelegateHandler({id: '0', toTail: fn('iP1-0'), toHead: fn('iP1-0')}))
      .addTail(new DelegateHandler({id: '1', toTail: fn('iP1-1'), toHead: fn('iP1-1')}))
      .addTail(new DelegateHandler({id: '2', toTail: fn('iP1-2'), toHead: fn('iP1-2')}));
    oPipe0.addTail(iPipe0)
      .addTail(new DelegateHandler({id: '0', toTail: fn('oP0-0'), toHead: fn('oP0-0')}))
      .addTail(new DelegateHandler({id: '1', toTail: fn('oP0-1'), toHead: fn('oP0-1')}))
      .addTail(new DelegateHandler({id: '2', toTail: fn('oP0-2'), toHead: fn('oP0-2')}))
      .addTail(iPipe1);
    oPipe1.addTail(iPipe0)
      .addTail(new DelegateHandler({id: '0', toTail: fn('oP1-0'), toHead: fn('oP1-0')}))
      .addTail(new DelegateHandler({id: '1', toTail: fn('oP1-1'), toHead: fn('oP1-1')}))
      .addTail(new DelegateHandler({id: '2', toTail: fn('oP1-2'), toHead: fn('oP1-2')}))
      .addTail(iPipe1);
    beforeEach(() => traces.length = 0);
    //--------------------------------------------------------------------------
    test('ToTail', () => {
      const prc: Process<any, any> = DefaultFactory.newInstance();
      prc.setDir(ProcessDirection.TOTAIL)
        .begContext(iPipe0.getContext())
        .start();
      expect(traces).toEqual([
        'iP0-0', 'iP0-1', 'iP0-2', //traces from iPipe0
        'oP0-0', 'oP0-1', 'oP0-2', 'iP1-0', 'iP1-1', 'iP1-2', // traces from oPipe0 process clone 
        'oP1-0', 'oP1-1', 'oP1-2', 'iP1-0', 'iP1-1', 'iP1-2', // traces from oPipe1 process clone 
      ]);
    });
    //--------------------------------------------------------------------------
    test('ToHead', () => {
      const prc: Process<any, any> = DefaultFactory.newInstance();
      prc.setDir(ProcessDirection.TOHEAD)
        .begContext(iPipe1.getContext())
        .start();
      expect(traces).toEqual([
        'iP1-2', 'iP1-1', 'iP1-0', //traces from iPipe1
        'oP0-2', 'oP0-1', 'oP0-0', 'iP0-2', 'iP0-1', 'iP0-0', // traces from oPipe0 process clone 
        'oP1-2', 'oP1-1', 'oP1-0', 'iP0-2', 'iP0-1', 'iP0-0', // traces from oPipe1 process clone 
      ]);
    });
    //--------------------------------------------------------------------------
    test('Suspend | Resume', () => {
      const prc: Process<any, any> = DefaultFactory.newInstance();
      let suspendedPrc: Process<any, any> | undefined;
      const suspender: DelegateHandler = new DelegateHandler({
        id: 'SUSPEND',
        toTail: (prc: Process<any, any>) => {
          suspendedPrc = prc;
          prc.suspend();
          const pipe = prc.pipeCur();
          if(pipe !== undefined)
            pipe.removeHandler('SUSPEND');
        }
      });
      oPipe0.addAfter(suspender, '0');
      prc.setDir(ProcessDirection.TOTAIL)
        .begContext(iPipe0.getContext())
        .start();
      expect(traces).toEqual([
        'iP0-0', 'iP0-1', 'iP0-2', //traces from iPipe0
        'oP0-0', // traces from oPipe0 process clone suspended after 
        'oP1-0', 'oP1-1', 'oP1-2', 'iP1-0', 'iP1-1', 'iP1-2', // traces from oPipe1 process clone 
      ]);
      expect(prc.getStatus()).toStrictEqual(ProcessStatus.STOPPED);
      expect(suspendedPrc).not.toBe(undefined);
      if(suspendedPrc === undefined)
        return;
      expect(suspendedPrc.id).not.toStrictEqual(prc.id);
      expect(suspendedPrc.getStatus()).toStrictEqual(ProcessStatus.SUSPENDED);
      traces.length = 0;
      suspendedPrc.start();
      expect(traces).toEqual([
        'oP0-1', 'oP0-2', 'iP1-0', 'iP1-1', 'iP1-2', // traces from resumed oPipe0 process clone
      ]);
    });
    //--------------------------------------------------------------------------
  });
});
//******************************************************************************