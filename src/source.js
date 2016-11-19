/**
 * Created by Dmitri on 11/15/2016.
 */
'use strict';

import Handler from './handler';

class Source extends Handler
{
  constructor(config)
  {
    super(config);
    Reflect.defineProperty(this, '_pipeMap', {configurable:false, writable:false, value: new Map()});
  }

  onAdd(cntx)
  {
    this._pipeMap.set(cntx.pipe.id, cntx.pipe);
  }

  onRemove(cntx)
  {
    this._pipeMap.delete(cntx.pipe.id);
  }
}

export default Source;

