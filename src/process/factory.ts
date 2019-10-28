import { ProcessDirection, Process, IProcessState, IProcessConfig } from '../process/process';
import { IterationContext } from '../pipe/context';
import { ProcessRunner } from '../process/async-runner';

//******************************************************************************
export type IdFn = () => any;
export const dfltId: IdFn = () => Symbol();
//------------------------------------------------------------------------------
export type ClonerFn = (data: any[]) => any[];
export const dfltCloner:ClonerFn = (data) =>
{
  const result: any[] = [];
  for(let cur of data)
  {
    if(cur !== null && typeof cur === 'object')
      result.push(Object.assign({}, cur));
    else
      result.push(cur);
  }
  return result;
};
//------------------------------------------------------------------------------
export type CntxClonerFn = (data: IterationContext[]) => IterationContext[];
const dfltCntxCloner: CntxClonerFn = (data) =>
{
  const result: IterationContext[] = [];
  for(const cur of data)
  {
    result.push(cur.clone());
  }
  return result;
}
//------------------------------------------------------------------------------
const dfltRunner: ProcessRunner<any, any> = new ProcessRunner();
//******************************************************************************
export interface IProcessFactoryConfig<D, M>
{
  idFn?: IdFn;
  dataCloner?: ClonerFn;
  messageCloner?: ClonerFn;
  cntxCloner?: CntxClonerFn;
  runner?: ProcessRunner<D, M>;
  dir?: ProcessDirection;
  state?: IProcessState<D, M>;
}
//------------------------------------------------------------------------------
export class
  ProcessFactory<D, M>
{
idFn: IdFn;
dataCloner: ClonerFn;
messageCloner: ClonerFn;
cntxCloner: CntxClonerFn;
runner: ProcessRunner<D, M>;
dir: ProcessDirection;
dfltState: IProcessState<D, M>;
//==============================================================================
constructor(cfg: IProcessFactoryConfig<D, M>)
{
  this.idFn = cfg.idFn || dfltId;
  this.dataCloner = cfg.dataCloner || dfltCloner;
  this.messageCloner = cfg.messageCloner || dfltCloner;
  this.cntxCloner = cfg.cntxCloner || dfltCntxCloner;
  this.runner = cfg.runner || dfltRunner;
  this.dir = cfg.dir || ProcessDirection.TOTAIL;
  this.dfltState = cfg.state || {}
}
//==============================================================================
newInstance(state: IProcessState<D, M> = {}): Process<D, M>
{
  const cfg: IProcessConfig<D, M> = {
    id: this.idFn(),
    factory: this,
    mStack: this.messageCloner(state.mStack || this.dfltState.mStack || []),
    dStack: this.dataCloner(state.dStack || this.dfltState.dStack || []),
    cStack: dfltCntxCloner(state.cStack || this.dfltState.cStack || []),
    dir: state.dir || this.dfltState.dir,
  };
  return new Process(cfg);
}
//==============================================================================
clone(src: Process<D, M>): Process<D, M>
{
  const cfg: IProcessConfig<D, M> = {
    id: this.idFn(),
    factory: this,
    mStack: this.messageCloner(src['mStack'] || []),
    dStack: this.dataCloner(src['dStack'] || []),
    cStack: this.cntxCloner(src['cStack'] || []),
    dir: src['dir'],
  };
  return new Process(cfg);
}
//==============================================================================
}// ProcessFactory
//******************************************************************************
export const DefaultFactory: ProcessFactory<any, any> = new ProcessFactory({});
//******************************************************************************