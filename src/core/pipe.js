'use strict';

import { Source } from 'handler/source';
import { Handler } from 'handler/handler';
import { Process } from 'core/process';

/*
HEAD|BEG >>>> inbound  >>>> TAIL|END
HEAD|BEG <<<< outbound <<<< TAIL|END
*/
//******************************************************************************
class
  HandlerWrapper
{
//==============================================================================
constructor(handler)
{
  if(!(handler instanceof Handler))
    throw new Error(`Invalid handler: ${handler.toString()}`);
  this.handler = handler;
  this.outbound = null;
  this.inbound = null;
}
//==============================================================================
}//HandlerWrapper
//******************************************************************************
export class
  PipeIterator
{
//==============================================================================
constructor(pipe, cur)
{
  this.cur = cur;
  this.pipe = pipe;
}
//==============================================================================
current(inbound = true)
{
  if(this.cur === undefined)
    return inbound ? this.pipe._head : this.pipe._tail; 
  return this.cur;
}
//==============================================================================
next(inbound = true)
{
  const head = this.pipe._head;
  const tail = this.pipe._tail;
  if(this.cur === undefined)
  {
    this.cur = inbound ? head : tail;
    return {done: false, value: this.cur.handler};
  }
  do
  {
    this.cur = inbound ? this.cur.inbound : this.cur.outbound;
  }
  while(this.cur !== null && !this.cur.handler);
  const done = this.cur === null;
  return {done, value: done ? undefined : this.cur.handler}
}
//==============================================================================
[Symbol.iterator]()
{
  return this;
}
//==============================================================================
clone()
{
  return new PipeIterator(this.pipe, this.cur);
}
//==============================================================================
}//PipeIterator
//******************************************************************************
class
  PipeHead
extends
  Handler
{
//==============================================================================
outbound(process)
{
  if(process._cntxStack.length === 1)
  {
    process.endContext();
    const self = this.config.pipe;
    for(let pipe of self._pipes)
    {
      const cntx = pipe.getHandlerIterator(self);
      process.begContext(cntx);
      process.run();
    }
  }
}
//==============================================================================
}//PipeHead
//******************************************************************************
class
  PipeTail
extends
  Handler
{
//==============================================================================
inbound(process)
{
  if(process._cntxStack.length === 1)
  {
    process.endContext();
    const self = this.config.pipe;
    for(let pipe of self._pipes)
    {
      const cntx = pipe.getHandlerIterator(self);
      process.begContext(cntx);
      process.run();
    }
  }
}
//==============================================================================
}//PipeTail
//******************************************************************************
const HEAD = Symbol('HEAD');
const TAIL = Symbol('TAIL');
function defTimer(fn)
{
  return setTimeout(fn, 0);
}
//******************************************************************************
export class
  Pipe
extends
  Source
{
//==============================================================================
constructor(config)
{
  super(config);
  this._hreg = new Map();
  const HeadCLS = this.config.headClass || PipeHead;
  const TailCLS = this.config.tailClass || PipeTail;
  this._head = new HandlerWrapper(new HeadCLS({id: HEAD, pipe: this}));
  this._tail = new HandlerWrapper(new TailCLS({id: TAIL, pipe: this}));
  this._head.inbound = this._tail;
  this._tail.outbound = this._head;
  this._queue = [];
  this._timer = this.config.timer || defTimer;
  this._timerFunc = this._consumeQueue.bind(this);
  this._timerNext = undefined;
  this.data = {};
}
//==============================================================================
_register(handler)
{
  if(handler === this || !(handler instanceof Handler))
    throw new Error(`Can't register handler: ${handler.toString()}`);
  const id = handler.id;
  if(this._hreg.has(id))
    throw new Error(`Handler with id ${id.toString()} already registered`);
  const wrapper = new HandlerWrapper(handler);
  this._hreg.set(id, wrapper);
  return wrapper;
}
//==============================================================================
_toWrapper(obj)
{
  if(obj instanceof HandlerWrapper)
    return obj;
  if(obj instanceof Handler)
    return this._hreg.get(obj.id);
  return this._hreg.get(obj);
}
//==============================================================================
getHandler(id)
{
  const wrapper = this._toWrapper(id);
  return wrapper ? wrapper.handler : undefined;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getHandlerBefore(ref, offset = 0)
{
  let wrapper = this._toWrapper(ref);
  if(!wrapper)
    return undefined;
  do
  {
    wrapper = wrapper.outbound;
  }
  while(--offset >= 0
    && wrapper !== null
    && wrapper !== this._head);
  return wrapper === this._head ? undefined : wrapper.handler;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getHandlerAfter(ref, offset = 0)
{
  let wrapper = this._toWrapper(ref);
  if(!wrapper)
    return undefined;
  do
  {
    wrapper = wrapper.inbound;
  }
  while(--offset >= 0
    && wrapper !== null
    && wrapper !== this._tail);
  return wrapper === this._tail ? undefined : wrapper.handler;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getHandlerArray()
{
  const result = [];
  let wrapper = this._head.inbound;
  while(wrapper !== this._tail)
  {
    result.push(wrapper.handler);
    wrapper = wrapper.inbound;
  }
  return result;
}
//==============================================================================
_add(handler, tail)
{
  const head = tail.outbound;
  const wrapper = this._register(handler);
  wrapper.outbound = head;
  wrapper.inbound = tail;
  head.inbound = wrapper;
  tail.outbound = wrapper;
  handler.onAdd(this);
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
addHead(handler)
{
  return this._add(handler, this._head.inbound);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
addTail(handler)
{
  return this._add(handler, this._tail);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
addBefore(handler, ref)
{
  const wrapper = this._toWrapper(ref);
  if(!wrapper)
    throw new Error(`Could not find ${ref.toString()} handler`);
  return this._add(handler, wrapper);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
addAfter(handler, ref)
{
  const wrapper = this._toWrapper(ref);
  if(!wrapper)
    throw new Error(`Could not find ${ref.toString()} handler`);
  return this._add(handler, wrapper.inbound);
}
//==============================================================================
_remove(wrapper)
{
  const handler = wrapper.handler;
  const id = handler.id;
  const head = wrapper.outbound;
  const tail = wrapper.inbound;
  handler.onRemove(this);
  this._hreg.delete(id);
  head.inbound = tail;
  tail.outbound = head;
  wrapper.handler = undefined;
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
remove(obj)
{
  const wrapper = this._toWrapper(obj);
  if(!wrapper)
    return this;
  return this._remove(wrapper);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
removeHead()
{
  if(this._head.inbound !== this._tail)
    return this._remove(this._head.inbound);
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
removeTail()
{
  if(this._tail.outbound !== this._head)
    return this._remove(this._tail.outbound);
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
removeBefore(ref)
{
  const wrapper = this._toWrapper(ref);
  if(!wrapper)
    throw new Error(`Could not find ${ref.toString()} handler`);
  if(wrapper.outbound === this._head)
    return this;
  return this._remove(wrapper.outbound);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
removeAfter(ref)
{
  const wrapper = this._toWrapper(ref);
  if(!wrapper)
    throw new Error(`Could not find ${ref.toString()} handler`);
  if(wrapper.inbound === this._tail)
    return this;
  return this._remove(wrapper.inbound);
}
//==============================================================================
getHandlerIterator(ref)
{
  if(ref === this._head || ref === this._tail)
    return new PipeIterator(this);
  return new PipeIterator(this, this._toWrapper(ref));
}
//==============================================================================
inbound(process)
{
  process.begContext(this);
}
//==============================================================================
outbound(process)
{
  process.begContext(this);
}
//==============================================================================
process(process)
{
  if(process.pipe !== this)
  {
    process.begContext(this);
    if(!process.active)
      process.run();
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
processInbound(message = {}, data = {}, ref = this._head)
{
  const cntx = this.getHandlerIterator(ref);
  const process = new Process([message], [data], [cntx]);
  process.run();
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
processOutbound(message = {}, data = {}, ref = this._tail)
{
  const cntx = this.getHandlerIterator(ref);
  const process = new Process([message], [data], [cntx], false);
  process.run();
}
//==============================================================================
_consumeQueue()
{
  const queue = this._queue;
  this._queue = [];
  this._timerNext = undefined;
  for(let process of queue)
  {
    process.run();
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
submitInbound(message = {}, data = {}, ref = this._head)
{
  const cntx = this.getHandlerIterator(ref);
  const process = new Process([message], [data], [cntx], true);
  this._queue.push(process);
  if(this._timerNext === undefined)
    this._timerNext = this._timer(this._timerFunc);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
submitOutbound(message = {}, data = {}, ref = this._tail)
{
  const cntx = this.getHandlerIterator(ref);
  const process = new Process([message], [data], [cntx], false);
  this._queue.push(process);
  if(this._timerNext === undefined)
    this._timerNext = this._timer(this._timerFunc);
}
//==============================================================================
}//Pipe
//******************************************************************************