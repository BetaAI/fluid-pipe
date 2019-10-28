import { Handler, IHandlerConfig } from './handler';
import { Process } from '../process/process';
import { Pipe } from '../pipe/pipe';

//******************************************************************************
export interface IDelegateConfig extends IHandlerConfig
{
  toHead?: (prc: Process<any, any>) => void;
  toTail?: (prc: Process<any, any>) => void;
}
//******************************************************************************
export class
  DelegateHandler
extends
  Handler<IDelegateConfig>
{
//==============================================================================
toTail(prc: Process<any, any>): void
{
  if(typeof this.cfg.toTail === 'function')
    this.cfg.toTail(prc);
}
//==============================================================================
toHead(prc: Process<any, any>): void
{
  if(typeof this.cfg.toHead === 'function')
    this.cfg.toHead(prc);
}
//==============================================================================
onPipeAdd(_pipe: Pipe) {/* NO-OP */}
//==============================================================================
onPipeRem(_pipe: Pipe) {/* NO-OP */}
//==============================================================================
}// ConfigurableHandler
//******************************************************************************