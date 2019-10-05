import { Handler, IHandlerConfig } from '../handler/handler';
import { HandlerWrapper } from '../pipe/handler-wrapper';
import { PipeHead } from '../handler/pipe-head';
import { PipeTail } from '../handler/pipe-tail';
import { Process } from '../process/process';
import { IterationContext } from './context';
import { Source } from '../handler/source';

//******************************************************************************
type HandlerFactory<T extends IHandlerConfig = IHandlerConfig> = (config: T) => Handler<T>;
const defHeadFactory: HandlerFactory = (cfg) => new PipeHead(cfg);
const defTailFactory: HandlerFactory = (cfg) => new PipeTail(cfg);
const HEAD: Symbol = Symbol('HEAD');
const TAIL: Symbol = Symbol('TAIL');
//******************************************************************************
export interface IPipeConfig extends IHandlerConfig
{
  headFactory?: HandlerFactory;
  tailFactory?: HandlerFactory;
}
//******************************************************************************
export class
  Pipe<T extends IPipeConfig = IPipeConfig>
extends
  Handler<T>
{
protected hreg: Map<any, HandlerWrapper>;
protected head: HandlerWrapper;
protected tail: HandlerWrapper;
data: any;
//==============================================================================
constructor(config?: T)
{
  super(config);
  this.hreg = new Map();
  const headFactory: HandlerFactory = this.cfg.headFactory || defHeadFactory;
  const tailFactory: HandlerFactory = this.cfg.tailFactory || defTailFactory;
  this.head = new HandlerWrapper(headFactory({id: HEAD}));
  this.tail = new HandlerWrapper(tailFactory({id: TAIL}));
  this.head.toTail = this.tail;
  this.tail.toHead = this.head;
  this.data = {};
}
//=== HANDLER MANAGEMENT =======================================================
protected wrap(handler: Handler): HandlerWrapper
{
  if(handler === this)
    throw new Error(`Can't register self`);
  const id: any = handler.id;
  if(this.hreg.has(id))
    throw new Error(`Handler ${id.toString()} already registered`);
  const wrapper: HandlerWrapper = new HandlerWrapper(handler);
  this.hreg.set(id, wrapper);
  return wrapper;
}
//==============================================================================
protected getWrapper(obj: any): HandlerWrapper | undefined
{
  if(obj instanceof HandlerWrapper)
    return obj;
  if(obj instanceof Handler)
    return this.hreg.get(obj.id);
  return this.hreg.get(obj);
}
//==============================================================================
getHandler(id: any): Handler | undefined
{
  const wrapper = this.getWrapper(id);
  return wrapper !== undefined ? wrapper.handler : undefined;
}
//------------------------------------------------------------------------------
getHandlerBefore(id: any, offset: number = 0): Handler | undefined
{
  let wrapper = this.getWrapper(id);
  if(wrapper === undefined)
    return undefined;
  do
  {
    wrapper = wrapper.toHead;
  }
  while(--offset >= 0 && wrapper && wrapper !== this.head)
  return wrapper && wrapper !== this.head ? wrapper.handler : undefined;
}
//------------------------------------------------------------------------------
getHandlerAfter(id: any, offset: number = 0): Handler | undefined
{
  let wrapper = this.getWrapper(id);
  if(wrapper === undefined)
    return undefined;
  do
  {
    wrapper = wrapper.toTail;
  }
  while(--offset >= 0 && wrapper && wrapper !== this.tail)
  return wrapper && wrapper !== this.tail ? wrapper.handler : undefined;
}
//------------------------------------------------------------------------------
getHandlerArray(): Handler[]
{
  const result: Handler[] = [];
  let cur = this.head.toTail;
  while(cur !== undefined && cur !== this.tail)
  {
    if(cur.handler !== undefined)
      result.push(cur.handler);
    cur = cur.toTail;
  }
  return result;
}
//==============================================================================
protected add(handler: Handler, tail: HandlerWrapper): Pipe
{
  const head: HandlerWrapper = tail.toHead as HandlerWrapper;
  const wrapper = this.wrap(handler);
  wrapper.toHead = head;
  wrapper.toTail = tail;
  head.toTail = wrapper;
  tail.toHead = wrapper;
  handler.onPipeAdd(this);
  return this;
}
//------------------------------------------------------------------------------
addHead(handler: Handler): Pipe
{
  return this.add(handler, this.head.toTail as HandlerWrapper);
}
//------------------------------------------------------------------------------
addTail(handler: Handler): Pipe
{
  return this.add(handler, this.tail);
}
//------------------------------------------------------------------------------
addBefore(handler: Handler, ref: any): Pipe
{
  const wrapper = this.getWrapper(ref);
  if(wrapper === undefined)
    throw new Error(`Could not find reference handler ${ref.toString()}`);
  return this.add(handler, wrapper);
}
//------------------------------------------------------------------------------
addAfter(handler: Handler, ref: any): Pipe
{
  const wrapper = this.getWrapper(ref);
  if(wrapper === undefined)
    throw new Error(`Could not find reference handler ${ref.toString()}`);
  return this.add(handler, wrapper.toTail as HandlerWrapper);
}
//==============================================================================
protected remove(wrapper: HandlerWrapper): Handler | undefined
{
  const handler = wrapper.handler;
  if(handler === undefined)
    return undefined;
  const head: HandlerWrapper = wrapper.toHead as HandlerWrapper;
  const tail: HandlerWrapper = wrapper.toTail as HandlerWrapper;
  handler.onPipeRem(this);
  this.hreg.delete(handler.id);
  head.toTail = tail;
  tail.toHead = head;
  wrapper.handler = undefined;
  return handler;
}
//------------------------------------------------------------------------------
removeHead(): Handler | undefined
{
  return this.head.toTail !== this.tail ?
    this.remove(this.head.toTail as HandlerWrapper) : undefined;
}
//------------------------------------------------------------------------------
removeTail(): Handler | undefined
{
  return this.tail.toHead !== this.head ?
    this.remove(this.tail.toHead as HandlerWrapper) : undefined;
}
//------------------------------------------------------------------------------
removeBefore(ref: any): Handler | undefined
{
  const wrapper = this.getWrapper(ref);
  if(wrapper === undefined)
    throw new Error(`Could not find reference handler ${ref.toString()}`);
  return wrapper.toHead !== this.head ?
    this.remove(wrapper.toHead as HandlerWrapper) : undefined;
}
//------------------------------------------------------------------------------
removeAfter(ref: any): Handler | undefined
{
  const wrapper = this.getWrapper(ref);
  if(wrapper === undefined)
    throw new Error(`Could not find reference handler ${ref.toString()}`);
  return wrapper.toTail !== this.tail ?
    this.remove(wrapper.toTail as HandlerWrapper) : undefined;
}
//------------------------------------------------------------------------------
removeHandler(id: any): Handler | undefined
{
  const wrapper = this.getWrapper(id);
  if(wrapper === undefined)
    throw new Error(`Could not find handler ${id.toString()}`);
  return this.remove(wrapper);
}
//------------------------------------------------------------------------------
removeAll(): Handler[]
{
  const result: Handler[] = [];
  this.hreg.clear();
  let cur = this.head.toTail;
  while(cur !== undefined && cur !== this.tail)
  {
    if(cur.handler !== undefined)
    {
      cur.handler.onPipeRem(this);
      result.push(cur.handler);
    }
    cur = cur.toTail;
  }
  this.head.toTail = this.tail;
  this.tail.toHead = this.head;
  return result;
}
//=== HANDLER METHODS ==========================================================
toHead(prc: Process): void
{
  prc.begContext(this.getContext());
}
//==============================================================================
toTail(prc: Process): void
{
  prc.begContext(this.getContext());
}
//==============================================================================
onPipeAdd(pipe: Pipe): void
{
  if(this.head.handler instanceof Source)
    this.head.handler.onPipeAdd(pipe);
  if(this.tail.handler instanceof Source)
    this.tail.handler.onPipeAdd(pipe);
}
//==============================================================================
onPipeRem(pipe: Pipe): void
{
  if(this.head.handler instanceof Source)
    this.head.handler.onPipeRem(pipe);
  if(this.tail.handler instanceof Source)
    this.tail.handler.onPipeRem(pipe);
}
//=== PROCESS MANAGEMENT =======================================================
getContext(cur?: any): IterationContext
{
  return new IterationContext({
    pipe: this,
    head: this.head,
    tail: this.tail,
  }, this.getWrapper(cur));
}
//==============================================================================
}// Pipe
//******************************************************************************