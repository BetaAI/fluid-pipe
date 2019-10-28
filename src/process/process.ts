import { IterationContext } from '../pipe/context';
import { Pipe } from '../pipe/pipe';
import { Handler } from '../handler/handler';
import { ProcessFactory } from '../process/factory';

//******************************************************************************
export enum ProcessStatus {RUNNING, SUSPENDED, STOPPED, CANCELED, SCHEDULED};
export enum ProcessDirection {TOTAIL, TOHEAD};
//******************************************************************************
export interface IProcessState<D, M>
{
  cStack?: IterationContext[];
  dStack?: D[];
  mStack?: M[];
  dir?: ProcessDirection;
}
//------------------------------------------------------------------------------
export interface IProcessConfig<D, M> extends IProcessState<D, M>
{
  id: any;
  factory: ProcessFactory<D, M>;
}
//------------------------------------------------------------------------------
export class
  Process<D, M>
{
readonly id: any;
readonly factory: ProcessFactory<D, M>;
protected cStack: IterationContext[];
protected dStack: D[];
protected mStack: M[];
protected dir: ProcessDirection;
protected status: ProcessStatus;
//==============================================================================
constructor(cfg: IProcessConfig<D, M>)
{
  this.id = cfg.id;
  this.factory = cfg.factory;
  this.cStack = cfg.cStack || [];
  this.dStack = cfg.dStack || [];
  this.mStack = cfg.mStack || [];
  this.dir = cfg.dir || ProcessDirection.TOTAIL;
  this.status = this.cStack.length > 0 ?
    ProcessStatus.SUSPENDED : ProcessStatus.STOPPED;
}
//==============================================================================
getProcessState(): IProcessState<D, M>
{
  return {
    mStack: this.mStack,
    dStack: this.dStack,
    cStack: this.cStack,
    dir: this.dir,
  };
}
//==============================================================================
clone(): Process<D, M>
{
  return this.factory.clone(this);
}
//=== CONTEXT MANAGEMENT =======================================================
cntxDepth(): number
{
  return this.cStack.length;
}
//------------------------------------------------------------------------------
getPipe(idx: number = -1): Pipe | undefined
{
  const len: number = this.cStack.length;
  const i: number = idx < 0 ? len + idx : idx;
  const cntx: IterationContext = this.cStack[i]
  return cntx !== undefined ? cntx.pipe() : undefined;
}
//------------------------------------------------------------------------------
pipeCur(): Pipe
{
  const result: Pipe | undefined = this.getPipe();
  if(result === undefined)
    throw new Error('No current pipe');
  return result;
}
//------------------------------------------------------------------------------
getHandler(cntxIdx: number = -1): Handler | undefined
{
  const len: number = this.cStack.length;
  const i: number = cntxIdx < 0 ? len + cntxIdx : cntxIdx;
  const cntx: IterationContext = this.cStack[i]
  return cntx !== undefined ? cntx.current().value : undefined;
}
//------------------------------------------------------------------------------
handlerCur(): Handler
{
  const result: Handler | undefined = this.getHandler();
  if(result === undefined)
    throw new Error('No current handler');
  return result;
}
//------------------------------------------------------------------------------
begContext(cntx: IterationContext): Process<D, M>
{
  this.cStack.push(cntx);
  return this;
}
//------------------------------------------------------------------------------
endContext(): Process<D, M>
{
  this.cStack.pop();
  return this;
}
//=== MESSAGE MANAGEMENT =======================================================
getMessage(idx: number = -1): M | undefined
{
  const stk = this.mStack;
  const len: number = stk.length;
  const i: number = idx < 0 ? len + idx : idx;
  return i >= 0 && i < len ? stk[i] : undefined;
}
//------------------------------------------------------------------------------
setMessage(val: M, idx: number = -1): M | undefined
{
  const stk = this.mStack;
  const len: number = Math.max(1, stk.length);
  const i: number = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    throw new Error(`Index ${idx} is out of bounds`);
  const result: M = stk[i];
  stk[i] = val;
  return result;
}
//------------------------------------------------------------------------------
messageCur(): M
{
  const result: M | undefined = this.getMessage(-1);
  if(result === undefined)
    throw new Error('Undefined message');
  return result;
}
//------------------------------------------------------------------------------
pushMessage(val: M): void
{
  this.mStack.push(val);
}
//------------------------------------------------------------------------------
popMessage(): M | undefined
{
  return this.mStack.pop();
}
//=== DATA MANAGEMENT ==========================================================
getData(idx: number = -1): D | undefined
{
  const stk = this.dStack;
  const len: number = stk.length;
  const i: number = idx < 0 ? len + idx : idx;
  return i >= 0 && i < len ? stk[i] : undefined;
}
//------------------------------------------------------------------------------
setData(val: D, idx: number = -1): D | undefined
{
  const stk = this.dStack;
  const len: number = Math.max(1, stk.length);
  const i: number = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    throw new Error(`Index ${idx} is out of bounds`);
  const result: D = stk[i];
  stk[i] = val;
  return result;
}
//------------------------------------------------------------------------------
dataCur(): D
{
  const result: D | undefined = this.getData(-1);
  if(result === undefined)
    throw new Error('Undefined data');
  return result;
}
//------------------------------------------------------------------------------
pushData(val: D): void
{
  this.dStack.push(val);
}
//------------------------------------------------------------------------------
popData(): D | undefined
{
  return this.dStack.pop();
}
//=== EXECUTION MANAGEMENT =====================================================
protected _nextHandler(): Handler | undefined
{
  let result: Handler | undefined = undefined;
  const stack: IterationContext[] = this.cStack;
  while(stack.length > 0 && result === undefined)
  {
    const next = stack[stack.length - 1].next(this.dir);
    if(next.done)
      stack.pop();
    else
      result = next.value;
  }
  return result;
}
//------------------------------------------------------------------------------
getDir(): ProcessDirection
{
  return this.dir;
}
//------------------------------------------------------------------------------
setDir(val: ProcessDirection): Process<D, M>
{
  this.dir = val;
  return this;
}
//------------------------------------------------------------------------------
getStatus(): ProcessStatus
{
  return this.status;
}
//------------------------------------------------------------------------------
start(): void
{
  this.status = ProcessStatus.RUNNING;
  while(this.status === ProcessStatus.RUNNING)
  {
    const handler: Handler | undefined = this._nextHandler();
    if(handler === undefined)
    {
      this.status = ProcessStatus.STOPPED;
      break;
    }
    this.dir === ProcessDirection.TOTAIL ?
      handler.toTail(this) : handler.toHead(this);
  }
}
//------------------------------------------------------------------------------
startAsync(delay: number = 0): Promise<Process<D, M>>
{
  this.status = ProcessStatus.SCHEDULED;
  return this.factory.runner.startAsync(this, delay);
}
//------------------------------------------------------------------------------
suspend(): void
{
  this.status = ProcessStatus.SUSPENDED;
}
//------------------------------------------------------------------------------
cancel(): void
{
  this.status = ProcessStatus.CANCELED;
  this.factory.runner.cancelAsync(this.id);
}
//------------------------------------------------------------------------------
stop(): void
{
  this.status = ProcessStatus.STOPPED;
  this.cStack.length = 0;
}
//==============================================================================
}// Process
//******************************************************************************