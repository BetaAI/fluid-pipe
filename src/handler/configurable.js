'use strict';

import { Handler } from 'handler/handler';

//******************************************************************************
export class
  ConfigurableHandler
extends
  Handler
{
//==============================================================================
inbound(process)
{
  const fn = this.config.inbound;
  if(fn instanceof Function)
    fn.call(this, process);
}
//==============================================================================
outbound(process)
{
  const fn = this.config.outbound;
  if(fn instanceof Function)
    fn.call(this, process);
}
//==============================================================================
}//Handler
//******************************************************************************