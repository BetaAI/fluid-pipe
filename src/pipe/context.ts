import { Handler } from '../handler/handler';
import { Pipe } from './pipe';
import { HandlerWrapper } from './handler-wrapper';
import { ProcessDirection } from '../process/process';

//******************************************************************************
export interface IProcessContextConfig
{
  pipe: Pipe;
  head: HandlerWrapper;
  tail: HandlerWrapper;
  defDir?: ProcessDirection;
}
//******************************************************************************
const BEG: HandlerWrapper = new HandlerWrapper();
const END: HandlerWrapper = new HandlerWrapper();
//------------------------------------------------------------------------------
export class
  IterationContext
implements
  IterableIterator<Handler | undefined>
{
protected readonly cfg: IProcessContextConfig;
protected cur: HandlerWrapper;
//==============================================================================
constructor(config: IProcessContextConfig, cur?: HandlerWrapper)
{
  this.cfg = Object.assign({}, config);
  this.cur = cur || BEG;
}
//==============================================================================
[Symbol.iterator]() {return this;}
//==============================================================================
next(dir?: ProcessDirection): IteratorResult<Handler | undefined>
{
  if(dir === undefined)
    dir = this.cfg.defDir
  while(this.cur !== END)
  {
    switch(dir)
    {
      case ProcessDirection.TOHEAD:
        if(this.cur === BEG)
          this.cur = this.cfg.tail;
        else
          this.cur = this.cur.toHead || END;
        break;
      case ProcessDirection.TOTAIL:
        if(this.cur === BEG)
          this.cur = this.cfg.head;
        else
          this.cur = this.cur.toTail || END;
        break;
      default:
        throw new Error(`Unknown ProcessDirection ${String(dir)}`);
    }
    if(this.cur.handler !== undefined)
      break;
  }
  return {
    done: this.cur === END,
    value: this.cur !== BEG && this.cur !== END ?
      this.cur.handler : undefined,
  };
}
//==============================================================================
current(): IteratorResult<Handler | undefined>
{
  return {
    done: this.cur === END,
    value: this.cur !== BEG && this.cur !== END ?
      this.cur.handler : undefined,
  };
}
//==============================================================================
getDir(): ProcessDirection | undefined
{
  return this.cfg.defDir;
}
//==============================================================================
setDir(dir: ProcessDirection): IterationContext
{
  this.cfg.defDir = dir;
  return this;
}
//==============================================================================
clone(): IterationContext
{
  return new IterationContext(this.cfg, this.cur);
}
//==============================================================================
pipe(): Pipe
{
  return this.cfg.pipe;
}
//==============================================================================
}// IterationContext
//******************************************************************************