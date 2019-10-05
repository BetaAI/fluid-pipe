import { Handler, IHandlerConfig } from './handler';
import { Process } from '../process/process';
import { Pipe } from '../pipe/pipe';

//******************************************************************************
export interface IDelegateConfig extends IHandlerConfig
{
  toHead?: (prc: Process) => void;
  toTail?: (prc: Process) => void;
}
//******************************************************************************
export class
  DelegateHandler
extends
  Handler<IDelegateConfig>
{
//==============================================================================
toTail(prc: Process): void
{
  if(typeof this.cfg.toTail === 'function')
    this.cfg.toTail(prc);
}
//==============================================================================
toHead(prc: Process): void
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