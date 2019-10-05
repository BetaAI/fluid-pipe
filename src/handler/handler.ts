import { Pipe } from '../pipe/pipe';
import { Process } from '../process/process';

//******************************************************************************
export interface IHandlerConfig
{
  id?: any;
  [key: string] : any;
}
//------------------------------------------------------------------------------
export abstract class
  Handler<T extends IHandlerConfig = IHandlerConfig>
{
readonly id: any;
protected readonly cfg: T;
//==============================================================================
constructor(config?: T)
{
  this.cfg = Object.assign({}, config);
  this.id = (this.cfg.id !== null && this.cfg.id !== undefined) ?
    this.cfg.id : Symbol();
}
//==============================================================================
abstract toTail(prc: Process): void;
//==============================================================================
abstract toHead(prc: Process): void;
//==============================================================================
abstract onPipeAdd(pipe: Pipe): void;
//==============================================================================
abstract onPipeRem(pipe: Pipe): void;
//==============================================================================
}// Handler
//******************************************************************************