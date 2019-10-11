import { IterationContext } from '../pipe/context';
import { Pipe } from '../pipe/pipe';
import { Handler } from '../handler/handler';
import { ProcessFactory } from '../process/factory';

//******************************************************************************
export enum ProcessStatus {RUNNING, SUSPENDED, STOPPED, CANCELED, SCHEDULED};
export enum ProcessDirection {TOTAIL, TOHEAD};
//******************************************************************************
export interface IProcessState
{
  mStack?: any[];
  dStack?: any[];
  cStack?: IterationContext[];
  dir?: ProcessDirection;
}
//------------------------------------------------------------------------------
export interface IProcessConfig extends IProcessState
{
  id: any;
  factory: ProcessFactory;
}
//------------------------------------------------------------------------------
export class
  Process
{
readonly id: any;
readonly factory: ProcessFactory;
protected mStack: any[];
protected dStack: any[];
protected cStack: IterationContext[];
protected dir: ProcessDirection;
protected status: ProcessStatus;
//==============================================================================
constructor(cfg: IProcessConfig)
{
  this.id = cfg.id;
  this.factory = cfg.factory;
  this.mStack = cfg.mStack || [];
  this.dStack = cfg.dStack || [];
  this.cStack = cfg.cStack || [];
  this.dir = cfg.dir || ProcessDirection.TOTAIL;
  this.status = this.cStack.length > 0 ?
    ProcessStatus.SUSPENDED : ProcessStatus.STOPPED;
}
//==============================================================================
getProcessState(): IProcessState
{
  return {
    mStack: this.mStack,
    dStack: this.dStack,
    cStack: this.cStack,
    dir: this.dir,
  };
}
//==============================================================================
clone(): Process
{
  return this.factory.clone(this);
}
//=== CONTEXT MANAGEMENT =======================================================
cntxDepth(): number
{
  return this.cStack.length;
}
//------------------------------------------------------------------------------
pipeCur(): Pipe | undefined
{
  const len = this.cStack.length;
  return len > 0 ? this.cStack[len - 1].pipe() : undefined;
}
//------------------------------------------------------------------------------
handlerCur(): Handler | undefined
{
  const len = this.cStack.length;
  return len > 0 ? this.cStack[len - 1].current().value : undefined;
}
//------------------------------------------------------------------------------
begContext(cntx: IterationContext): Process
{
  this.cStack.push(cntx);
  return this;
}
//------------------------------------------------------------------------------
endContext(): Process
{
  this.cStack.pop();
  return this;
}
//=== STACK MANAGEMENT HELPERS =================================================
protected getStk(stk: any[], idx: number): any
{
  const len: number = stk.length;
  const i: number = idx < 0 ? len + idx : idx;
  return i >= 0 && i < len ? stk[i] : undefined;
}
//------------------------------------------------------------------------------
protected setStk(stk: any[], val: any, idx: number): any
{
  const len: number = Math.max(1, stk.length);
  const i: number = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    throw new Error(`Index ${idx} is out of bounds`);
  const result: any = stk[i];
  stk[i] = val;
  return result;
}
//=== MESSAGE MANAGEMENT =======================================================
getMessage(idx: number = -1): any
{
  return this.getStk(this.mStack, idx);
}
//------------------------------------------------------------------------------
setMessage(val: any, idx: number = -1): any
{
  return this.setStk(this.mStack, val, idx);
}
//------------------------------------------------------------------------------
pushMessage(val: any): void
{
  this.mStack.push(val);
}
//------------------------------------------------------------------------------
popMessage(): any
{
  return this.mStack.pop();
}
//=== DATA MANAGEMENT ==========================================================
getData(idx: number = -1): any
{
  return this.getStk(this.dStack, idx);
}
//------------------------------------------------------------------------------
setData(val: any, idx: number = -1): any
{
  return this.setStk(this.dStack, val, idx);
}
//------------------------------------------------------------------------------
pushData(val: any): void
{
  this.dStack.push(val);
}
//------------------------------------------------------------------------------
popData(): any
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
setDir(val: ProcessDirection): Process
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
startAsync(delay: number = 0): Promise<Process>
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