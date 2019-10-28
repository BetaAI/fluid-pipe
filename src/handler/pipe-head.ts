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
toTail(_prc: Process<any, any>): void {/* NO-OP */}
//==============================================================================
toHead(prc: Process<any, any>): void
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
}// PipeHead
//******************************************************************************