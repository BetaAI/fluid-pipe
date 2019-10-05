import { Handler, IHandlerConfig } from '../handler/handler';
import { Pipe } from '../pipe/pipe';

//******************************************************************************
export abstract class
  Source<T extends IHandlerConfig = IHandlerConfig>
extends
  Handler<T>
{
protected pipes: Set<Pipe>;
//==============================================================================
constructor(config?: T)
{
  super(config);
  this.pipes = new Set();
}
//==============================================================================
onPipeAdd(pipe: Pipe): void
{
  this.pipes.add(pipe);
}
//==============================================================================
onPipeRem(pipe: Pipe): void
{
  this.pipes.delete(pipe);
}
//==============================================================================
}// Source
//******************************************************************************