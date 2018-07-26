'use strict';

import {Pipe, PipeIterator} from 'src/pipe';

//******************************************************************************
const BIT_ACTIVE = 0;
const BIT_DIR = 1;

const MASK_ACTIVE = 1 << BIT_ACTIVE;
const MASK_DIR = 1 << BIT_DIR;
//******************************************************************************
export class
  Process
{
//==============================================================================
constructor(msg = [], data = [], cntx = [], inbound = true)
{
  this._msgStack = msg.length > 0 ? [...msg] : [{}];
  this._dataStack = data.length > 0 ? [...data] : [{}];
  this._cntxStack = [...cntx];
  this._flags = ((inbound&1) << BIT_DIR);
  this.id = Symbol();
}
//==============================================================================
get inbound()
{
  return !!(this._flags & MASK_DIR);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
set inbound(val)
{
  this._flags = this._flags & ~MASK_DIR | ((val & 1) << BIT_DIR);
}
//==============================================================================
get alive()
{
  return this._cntxStack.length > 0;
}
//==============================================================================
get running()
{
  return !!(this._flags & MASK_ACTIVE);
}
//==============================================================================
get data()
{
  return this._dataStack[this._dataStack.length - 1];
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
set data(val)
{
  this._dataStack[this._dataStack.length - 1] = val;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getData(idx = -1)
{
  const len = this._dataStack.length;
  const i = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    return undefined;
  return this._dataStack[i];
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
setData(val, idx = -1)
{
  const len = this._dataStack.length;
  const i = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    throw new Error(`Index ${idx} is out of bounds`);
  this._dataStack[i] = val;
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
pushData(val)
{
  this._dataStack.push(val);
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
popData()
{
  const result = this._dataStack.pop();
  if(this._dataStack.length === 0)
    this._dataStack[0] = {}
  return result;
}
//==============================================================================
get message()
{
  return this._msgStack[this._msgStack.length - 1];
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
set message(val)
{
  this._msgStack[this._msgStack.length - 1] = val;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getMessage(idx = -1)
{
  const len = this._msgStack.length;
  const i = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    return undefined;
  return this._msgStack[i];
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
setMessage(val = {}, idx = -1)
{
  const len = this._msgStack.length;
  const i = idx < 0 ? len + idx : idx;
  if(i < 0 || i > len)
    throw new Error(`Index ${idx} is out of bounds`);
  this._msgStack[i] = val;
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
pushMessage(val)
{
  this._msgStack.push(val);
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
popMessage(val)
{
  const result = this._msgStack.pop();
  if(this._msgStack.length === 0)
    this._msgStack[0] = {}
  return result;
}
//==============================================================================
get pipe()
{
  const len = this._cntxStack.length;
  return len > 0 ? this._cntxStack[len - 1].pipe : undefined;
}
//==============================================================================
_nextHandler()
{
  let result = undefined;
  const stack = this._cntxStack;
  while(stack.length > 0 && result === undefined)
  {
    const next = stack[stack.length - 1].next(this.inbound);
    if(next.done)
      stack.pop();
    else
      result = next.value;
  }
  return result;
}
//==============================================================================
begContext(cntx)
{
  if(cntx instanceof PipeIterator)
    this._cntxStack.push(cntx);
  else if(cntx instanceof Pipe)
    this._cntxStack.push(cntx.getHandlerIterator());
  else
    throw new Error('beginContext illegal argument!');
}
//==============================================================================
endContext()
{
  this._cntxStack.pop();
}
//==============================================================================
run()
{
  this._flags |= MASK_ACTIVE;
  while(this.running)
  {
    const handler = this._nextHandler();
    if(handler === undefined)
      break;
    this.inbound ? handler.inbound(this) : handler.outbound(this);
  }
  this._flags &= ~MASK_ACTIVE;
}
//==============================================================================
pause()
{
  this._flags &= ~MASK_ACTIVE;
}
//==============================================================================
terminate()
{
  this._flags &= ~MASK_ACTIVE;
  this._cntxStack.length = 0;
}
//==============================================================================
}//Process
//******************************************************************************