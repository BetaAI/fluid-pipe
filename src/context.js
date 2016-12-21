/**
 * Created by Dmitri on 4/24/2016.
 */
'use strict';

import Process from './process';

class Context
{
  constructor(pipe = null)
  {
    const priv =
      {
        pipe:pipe,
        master:null,
        prcStack:[],
      };
    Reflect.defineProperty(this, '_priv', {value:priv});
  }

  //===== GETTERS AND SETTERS =====================================================================
  get pipe()
  {
    return this._priv.pipe;
  }

  get process()
  {
    const stack = this._priv.prcStack;
    const len = stack.length;
    return len ? stack[len - 1] : undefined;
  }
  
  get master()
  {
    return this._priv.master;
  }

  set master(cntx)
  {
    if(cntx === this)
      throw new Error('Can not set master to yourself');
    this._priv.master = cntx;
  }

  get headMaster()
  {
    let result = null;
    let next = this.master;
    while(next)
    {
      result = next;
      next = result.master;
    }
    return result;
  }

  //===== PRIVATE METHODS =========================================================================
  _begPrc(obj = {})
  {
    let prc;
    if(obj instanceof Process)
      prc = obj;
    else
      prc = new Process(obj);
    this._priv.prcStack.push(prc);
    return prc;
  }

  _endPrc(prc)
  {
    const stack = this._priv.prcStack;
    const idx = stack.indexOf(prc);
    if(idx >= 0)
      stack.splice(idx, 1);
  }
}

export default Context;