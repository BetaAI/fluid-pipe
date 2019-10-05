import { Process } from '../process/process';

//******************************************************************************
export class
  ProcessRunner
{
//==============================================================================
startAsync(prc: Process, delay: number = 0): Promise<Process>
{
  const promise: Promise<Process> = new Promise((resolve) =>
  {
    setTimeout(() =>
    {
      prc.start();
      resolve(prc);
    }, delay);
  });
  return promise;
}
//==============================================================================
}// ProcessRunner
//******************************************************************************