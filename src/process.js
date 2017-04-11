/**
 * Created by dmitri on 12/21/2016.
 */
'use strict';

class Process
{
  constructor(obj = {})
  {
    const prd = obj.data || {};
    const msg = obj.message || obj;
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

  clone()
  {
    return new Process({data:this._prdStack, message:this._msgStack});
  }
}

export default Process;