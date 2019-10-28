import { IHandlerConfig } from '../handler/handler';
import { Process } from '../process/process';
import { Pipe } from '../pipe/pipe';
import { Source } from '../handler/source';

//******************************************************************************
export class
  PipeTail
extends
  Source<IHandlerConfig>
{
//==============================================================================
toTail(prc: Process<any, any>): void
{
  if(prc.cntxDepth() > 1)
    return;
  const pipe: Pipe = prc.pipeCur() as Pipe;
  prc.endContext();
  for(const p of this.pipes)
  {
    const clone: Process<any, any> = prc.factory.clone(prc);
    clone.begContext(p.getContext(pipe)).start();
  }
}
//==============================================================================
toHead(_prc: Process<any, any>): void {/* NO-OP */}
//==============================================================================
}// PipeTail
//******************************************************************************