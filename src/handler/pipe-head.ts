import { IHandlerConfig } from '../handler/handler';
import { Process } from '../process/process';
import { Pipe } from '../pipe/pipe';
import { Source } from '../handler/source';

//******************************************************************************
export class
  PipeHead
extends
  Source<IHandlerConfig>
{
//==============================================================================
toTail(_prc: Process): void {/* NO-OP */}
//==============================================================================
toHead(prc: Process): void
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
}// PipeHead
//******************************************************************************