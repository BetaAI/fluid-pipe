/**
 * Created by dmitri on 12/23/2016.
 */
'use strict';

import Handler from './handler/handler';
import Source from './handler/source';

function toBound(func, that)
{
  if(func instanceof Function && func.hasOwnProperty('prototype'))
    func = func.bind(that);
  return func;
}

function genResult(obj, inbound, outbound)
{
  if(inbound)
    obj.inbound = toBound(inbound, obj);
  if(outbound)
    obj.outbound = toBound(outbound, obj);
  return obj;
}

class Util
{
  static newHandler(inbound, outbound = inbound)
  {
    return genResult(new Handler(), inbound, outbound);
  }

  static newInboundHandler(func)
  {
    return genResult(new Handler(), func, null);
  }

  static newOutboundHandler(func)
  {
    return genResult(new Handler(), null, func);
  }

  static newSource(inbound, outbound = inbound)
  {
    return genResult(new Source(), inbound, outbound);
  }

  static newInboundSource(func)
  {
    return genResult(new Source(), func, null);
  }

  static newOutboundSource(func)
  {
    return genResult(new Source(), null, func);
  }
}

export default Util;