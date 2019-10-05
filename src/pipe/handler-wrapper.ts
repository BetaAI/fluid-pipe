import { Handler } from '../handler/handler';

//******************************************************************************
export class
  HandlerWrapper
{
handler: Handler | undefined;
toTail: HandlerWrapper | undefined;
toHead: HandlerWrapper | undefined;
//==============================================================================
constructor(handler?: Handler)
{
  this.handler = handler;
  this.toTail = undefined;
  this.toHead = undefined;
}
//==============================================================================
}// HandlerWrapper
//******************************************************************************