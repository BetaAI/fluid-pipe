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
toTail(prc: Process): void
{
  if(prc.cntxDepth() > 1)
    return;
  const pipe: Pipe = prc.pipeCur() as Pipe;
  prc.endContext();
  for(const p of this.pipes)
  {
    const clone: Process = prc.factory.clone(prc);
    clone.begContext(p.getContext(pipe)).start();
  }
}
//==============================================================================
toHead(_prc: Process): void {/* NO-OP */}
//==============================================================================
}// PipeTail
//******************************************************************************