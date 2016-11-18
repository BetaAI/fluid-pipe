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
        value:config || {id: Symbol()}
      });
    if(!this.config.hasOwnProperty('id'))
      this.config.id = Symbol();
    Reflect.defineProperty(this.config, 'id', {configurable:false, writable:false});
  }
  
  get id()
  {
    return this.config.id;
  }
}

export default Handler;