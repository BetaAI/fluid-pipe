/**
 * Created by Dmitri on 4/24/2016.
 */
'use strict';

class Process
{
  constructor(prd = {}, msg = {})
  {
    this._prdStack = Array.isArray(prd) ? [...prd] : [prd];
    this._msgStack = Array.isArray(msg) ? [...msg] : [msg];
    this._isAlive = true;
    Reflect.defineProperty(this, 'id', {value:Symbol()});
  }

  get isAlive()
  {
    return this._isAlive;
  }

  end()
  {
    this._isAlive = false;
  }

  get data()
  {
    const len = this._prdStack.length;
    return len ? this._prdStack[len - 1] : undefined;
  }

  getData(offset = 0)
  {
    const len = this._prdStack.length - offset;
    return len > 0 ? this._prdStack[len - 1] : undefined;
  }

  pushData(obj = {})
  {
    this._prdStack.push(obj);
    return obj;
  }

  popData()
  {
    return this._prdStack.pop();
  }

  get message()
  {
    const len = this._msgStack.length;
    return len ? this._msgStack[len - 1] : undefined;
  }

  getMsg(offset = 0)
  {
    const len = this._msgStack.length - offset;
    return len > 0 ? this._msgStack[len - 1] : undefined;
  }

  pushMsg(obj = {})
  {
    this._msgStack.push(obj);
    return obj;
  }

  popMsg()
  {
    return this._msgStack.pop();
  }
}

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
      prc = new Process(obj.data, obj.message);
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