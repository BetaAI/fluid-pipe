/**
 * Created by Dmitri on 4/24/2016.
 */
'use strict';

class Handler
{
  constructor(config)
  {
    Reflect.defineProperty(this, 'config',
      {
        configurable:false, writable:false,
        value:Object.assign({id:Symbol()}, config)
      });
    Reflect.defineProperty(this.config, 'id', {configurable:false, writable:false});
  }
  
  get id()
  {
    return this.config.id;
  }
}

export default Handler;