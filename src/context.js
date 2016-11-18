/**
 * Created by Dmitri on 4/24/2016.
 */
'use strict';

const PRIV = Symbol('priv');
const PROC = Symbol('proc');

function stkLast(stk)
{
  let len = stk !== null ? stk.length : 0;
  if(len === 0)
    return undefined;
  return stk[len - 1];
}

function getProcVars(cntx)
{
  if(!cntx.hasOwnProperty(PROC))
    cntx[PROC] = {prdStack:[{}], msgStack:[], prcDepth:0};
  return cntx[PROC];
}

class Context
{
  constructor(pipe = null)
  {
    let priv =
      {
        pipe:pipe,
        master:null
      };
    Reflect.defineProperty(this, priv, {configurable:false, writable:false, value:priv});
  }

  beginProcess(msg)
  {
    let proc = getProcVars(this);
    if(msg)
      proc.msgStack.push(msg);
    return ++proc.prcDepth;
  }

  endProcess(val = 0)
  {
    let proc = getProcVars(this);
    if(proc.prcDepth >= val)
      proc.prcDepth = val - 1;
    else if(val === 0)
      proc.prcDepth--;
    if(proc.prcDepth <= 0)
      delete this[PROC];
  }

  //===== GETTERS AND SETTERS =====================================================================
  get pipe()
  {
    return this[PRIV].pipe;
  }
  
  get master()
  {
    return this[PRIV].master;
  }

  set master(val)
  {
    if(val === this)
      throw new Error('Can not set master to yourself');
    if(val)
      this[PROC] = val[PROC];
    else
      delete this[PROC];
    this[PRIV].master = val;
  }

  get headMaster()
  {
    let result = this;
    let next = result.master;
    while(next)
    {
      result = next;
      next = result.master;
    }
    return result;
  }

  get processDepth()
  {
    if(!this.hasOwnProperty(PROC))
      return 0;
    return this[PROC].prcDepth;
  }

  //===== PROCESS DATA MANAGEMENT =================================================================
  get processData()
  {

    return stkLast(getProcVars(this).prdStack);
  }

  pushProcessData(data = {})
  {
    getProcVars(this).prdStack.push(data);
    return data;
  }

  popProcessData()
  {
    return getProcVars(this).prdStack.pop();
  }

  //===== MESSAGE DATA MANAGEMENT =================================================================
  get message()
  {
    return stkLast(getProcVars(this).msgStack);
  }

  pushMessage(data = {})
  {
    getProcVars(this).msgStack.push(data);
    return data;
  }

  popMessage()
  {
    return getProcVars(this).msgStack.pop();
  }
}

export default Context;