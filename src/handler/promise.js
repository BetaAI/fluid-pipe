/**
 * Created by Dmitri on 3/29/2017.
 */
'use strict';

import Handler from './handler';

const DEFAULT = Symbol('Default');

const DIR_IN = 0;
const DIR_OUT = 1;

class PromiseHandler extends Handler
{
  constructor(config)
  {
    super(config);
    this.config.prMap = new Map();
  }

  _process(cntx, dir)
  {
    for(let arr of this.config.prMap.values())
    {
      const obj = arr[dir];
      if(obj)
        obj.filter(cntx, obj.accept, obj.reject);
    }
  }

  _createPromise(filter, id, ...dirs)
  {
    const prObj = {};
    prObj.filter = filter;
    prObj.promise = new Promise((accept, reject) =>
    {
      prObj.accept = accept;
      prObj.reject = reject;
    });
    const arr = this.config.prMap.get(id) || [];
    for(let i = arr.length; --i >= 0;)
    {
      if(arr[i])
        arr[i].reject(`Promise ${id} deleted`);
      arr[i] = undefined;
    }
    for(let dir of dirs)
    {
      arr[dir] = prObj;
    }
    this.config.prMap.set(id, arr);
    return prObj.promise;
  }

  inbound(cntx)
  {
    this._process(cntx, DIR_IN)
  }

  outbound(cntx)
  {
    this._process(cntx, DIR_OUT)
  }

  getPromise(id)
  {
    const arr = this.config.prMap.get(id);
    if(!arr)
      return undefined;
    const obj = arr[DIR_IN] || arr[DIR_OUT];
    return obj ? obj.promise : undefined;
  }

  get promise()
  {
    return this.getPromise(DEFAULT);
  }

  newPromise(filter, id = DEFAULT)
  {
    return this._createPromise(filter, id, DIR_IN, DIR_OUT);
  }

  newInboundPromise(filter, id = DEFAULT)
  {
    return this._createPromise(filter, id, DIR_IN);
  }

  newOutboundPromise(filter, id = DEFAULT)
  {
    return this._createPromise(filter, id, DIR_OUT);
  }

  delPromise(id, reason)
  {
    const arr = this.config.prMap.get(id);
    if(!arr)
      return;
    const obj = arr[DIR_IN] || arr[DIR_OUT];
    obj.reject(reason);
    this.config.prMap.delete(id);
  }
}

export default PromiseHandler;
