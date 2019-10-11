import { Process } from '../process/process';

//******************************************************************************
export class
  ProcessRunner
{
protected cancelMap: Map<any, () => void> = new Map();
//==============================================================================
startAsync(prc: Process, delay: number = 0): Promise<Process>
{
  if(this.cancelMap.has(prc.id))
    throw new Error(`Process ${String(prc.id)} is already scheduled`);
  const promise: Promise<Process> = new Promise((res) =>
  {
    const to = setTimeout(() =>
    {
      this.cancelMap.delete(prc.id);
      prc.start();
      res(prc);
    }, delay);
    const cancel = () =>
    {
      clearTimeout(to);
      prc.cancel();
      res(prc);
    };
    this.cancelMap.set(prc.id, cancel);
  });
  return promise;
}
//==============================================================================
cancelAsync(id: any): void
{
  const cancel = this.cancelMap.get(id);
  if(cancel !== undefined)
  {
    this.cancelMap.delete(id);
    cancel();
  }
}
//==============================================================================
}// ProcessRunner
//******************************************************************************