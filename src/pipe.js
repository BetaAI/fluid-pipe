/**
 * Created by Dmitri on 4/24/2016.
 */
'use strict';

import Source from './handler/source';
import Handler from './handler/handler';
import Context from './context';

const HEAD = Symbol('HEAD');
const TAIL = Symbol('TAIL');

const BEG = 'beg';
const END = 'end';

class HandlerWrapper
{
  constructor(handler, cntx)
  {
    if(!handler || !cntx)
      throw new Error(`Invalid handler: ${handler} or context: ${cntx}`);
    if(handler.onAdd)
      handler.onAdd(cntx);
    this.handler = handler;
    this.cntx = cntx;
    this.beg = null;
    this.end = null;
  }
  
  destroy()
  {
    if(this.handler.onRemove)
      this.handler.onRemove(this.cntx);
    this.cntx = null;
    this.handler = null;
  }
}

class Pipe extends Source
{
  constructor(config)
  {
    super(config);
    let priv =
    {
      cntx: new Context(this),
      registry: new Map(),
      queue: [],
      timer: null,
      externPrc: new Set()
    };
    Reflect.defineProperty(this, '_priv', {configurable:false, writable:false, value:priv});

    let head = new Handler({id:HEAD});
    let tail = new Handler({id:TAIL});
    head.outbound = (cntx) => {this._onExit(BEG, cntx)};
    tail.inbound = (cntx) => {this._onExit(END, cntx)};
    head = this._register(head);
    tail = this._register(tail);
    head.end = tail;
    tail.beg = head;
  }

  //===== PUBLIC METHODS ==========================================================================
  getHandler(obj)
  {
    const wrapper = this._getWrapper(obj);
    return wrapper !== null ? wrapper.handler : null;
  }

  addBeg(obj)
  {
    return this._add(obj, HEAD, true);
  }

  addEnd(obj)
  {
    return this._add(obj, TAIL);
  }

  addBefore(obj, ref)
  {
    return this._add(obj, ref);
  }

  addAfter(obj, ref)
  {
    return this._add(obj, ref, true);
  }

  remove(obj)
  {
    obj = this._getWrapper(obj);
    if(!obj)
      return this;
    const id = obj.handler.id;
    return id !== HEAD && id !== TAIL ? this._remove(obj) : this;
  }

  removeBeg()
  {
    const obj = this._getWrapper(HEAD).end;
    return obj.handler.id !== TAIL ? this._remove(obj) : this;
  }

  removeEnd()
  {
    const obj = this._getWrapper(TAIL).beg;
    return obj.handler.id !== HEAD ? this._remove(obj) : this;
  }

  removeBefore(obj)
  {
    obj = this._getWrapper(obj);
    if(!obj)
      return this;
    obj = obj.beg;
    return obj.handler.id !== HEAD ? this._remove(obj) : this;
  }

  removeAfter(obj)
  {
    obj = this._getWrapper(obj);
    if(!obj)
      return this;
    obj = obj.end;
    return obj.handler.id !== TAIL ? this._remove(obj) : this;
  }

  processInbound(obj = {}, start = HEAD, offset = 0)
  {
    this._process(obj, END, start, offset);
    return this;
  }

  processOutbound(obj ={}, start = TAIL, offset = 0)
  {
    this._process(obj, BEG, start, offset);
    return this;
  }

  submitInbound(msg = {}, start = HEAD, offset = 0)
  {
    this._submit(msg, END, start, offset);
    return this;
  }

  submitOutbound(msg = {}, start = TAIL, offset = 0)
  {
    this._submit(msg, BEG, start, offset);
    return this;
  }

  //===== HANDLER METHODS =========================================================================
  inbound(cntx)
  {
    this._processExtern(cntx, END, HEAD);
  }

  outbound(cntx)
  {
    this._processExtern(cntx, BEG, TAIL);
  }

  //===== PRIVATE METHODS =========================================================================
  _register(handler)
  {
    if(!handler || handler === this)
      throw new Error(`Cannot register ${handler}`);
    const hId = handler.id;
    if(!hId)
      throw new Error(`Handler with invalid id ${hId}`);
    const reg = this._priv.registry;
    if(reg.has(hId))
      throw new Error(`Handler with id ${hId} already registered`);
    const wrapper = new HandlerWrapper(handler, this._priv.cntx);
    reg.set(hId, wrapper);
    return wrapper;
  }

  _getWrapper(obj)
  {
    if(obj instanceof HandlerWrapper)
      return obj.cntx === this._priv.cntx ? obj : null;
    return this._priv.registry.get(obj.id || obj) || null;
  }

  _add(obj, ref, after = false)
  {
    let refWrp = this._getWrapper(ref);
    if(refWrp === null)
      throw new Error(`Could not find ${ref} handler in this pipe`);
    if(after)
      refWrp = refWrp.end;
    const objWrp = this._register(obj);
    objWrp.beg = refWrp.beg;
    objWrp.end = refWrp;
    refWrp.beg.end = objWrp;
    refWrp.beg = objWrp;
    return this;
  }

  _remove(obj)
  {
    const wrapper = this._getWrapper(obj);
    if(wrapper === null)
      throw new Error(`Could not find ${obj} handler in this pipe`);
    const id = wrapper.handler.id;
    if(id === HEAD || id === TAIL)
      throw new Error(`Attempting to remove ${id}. This should never happen!`);
    wrapper.beg.end = wrapper.end;
    wrapper.end.beg = wrapper.beg;
    this._priv.registry.delete(wrapper.handler.id);
    wrapper.destroy();
    return this;
  }

  _process(obj, ...rest)
  {
    const cntx = this._priv.cntx;
    const prc = cntx._begPrc(obj);
    this._execute(...rest);
    cntx._endPrc(prc);
  }

  _execute(dir, start, offset = 0)
  {
    const method = dir === END ? 'inbound' : 'outbound';
    const cntx = this._priv.cntx;
    const prc = cntx.process;
    if(prc)
    {
      let wrapper = this._getWrapper(start);
      while (wrapper !== null && prc.isAlive)
      {
        if(--offset < 0)
        {
          const handler = wrapper.handler;
          if (handler && handler[method] instanceof Function)
            handler[method](cntx);
        }
        wrapper = wrapper[dir];
      }
    }
  }

  _consumeQueue(max = Number.MAX_SAFE_INTEGER)
  {
    max = Math.min(max, this.config.queueLenMax || Number.MAX_SAFE_INTEGER);
    const priv = this._priv;
    const batch = priv.queue.splice(0, max);
    for(let i = 0; i < batch.length; i++)
    {
      const cur = batch[i];
      this._process(...cur.args);
    }
    priv.timer = priv.queue.length ? setTimeout(this._consumeQueue.bind(this), 0) : null;
  }

  _submit(prc, dir, start, offset = 0)
  {
    const priv = this._priv;
    priv.queue.push({args:[prc, dir, start, offset]});
    if(priv.timer === null)
      priv.timer = setTimeout(this._consumeQueue.bind(this), 0);
  }

  _processExtern(cntx, dir, start)
  {
    const priv = this._priv;
    priv.cntx.master = cntx;
    const prc = cntx.process;
    priv.externPrc.add(prc);
    this._process(prc, dir, start);
    priv.externPrc.delete(prc);
    if(!priv.externPrc.size)
      priv.cntx.master = null; //TODO: not sure this is right.
  }

  _onExit(dir, cntx)
  {
    const prc = cntx.process;
    if(!this._priv.externPrc.has(prc))
    {
      let master;
      if(master = cntx.master)
        master.pipe._process(prc, dir, this, 1);
      else
      {
        for(let target of this._pipeMap.values())
        {
          target._submit(prc, dir, this, 1);
        }
      }
    }
  }
}

export default Pipe;