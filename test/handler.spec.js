/**
 * Created by Dmitri on 11/18/2016.
 */
'use strict';

import chai from 'chai';
const expect = chai.expect;
chai.should();

import Handler from '../src/handler';

describe('Handler', function()
{
  const def = new Handler();
  const config1 = {definedId:false};
  const config2 = {definedId:true, id:Symbol()};
  const custom1 = new Handler(config1);
  const custom2 = new Handler(config2);
  it('always has config', function()
  {
    expect(def.config).to.exist;
    expect(custom1.config).to.exist;
    expect(custom2.config).to.exist;
  });
  it('config has existing or generated id', function()
  {
    expect(def.config.id).to.exist;
    expect(custom1.config.id).to.exist;
    expect(custom2.config.id).to.exist;
    expect(custom2.config.id).to.equal(config2.id);
  });
  it('config property is immutable', function()
  {
    expect(()=>{delete def.config;}).to.throw(Error);
    expect(()=>{def.config = config1;}).to.throw(Error);
  });
  it('config id property is immutable', function()
  {
    expect(()=>{delete def.config.id;}).to.throw(Error);
    expect(()=>{def.config.id = Symbol();}).to.throw(Error);
  });
  it('id getter works', function()
  {
    expect(def.config.id).to.equal(def.id);
    expect(custom2.id).to.equal(config2.id);
  });
  it('config object is mutable', function()
  {
    const foo = 'foo';
    expect(()=>{def.config.foo = foo;}).to.not.throw(Error);
    expect(def.config.foo).to.equal(foo);
    expect(()=>{delete def.config.foo;}).to.not.throw(Error);
    expect(def.config.foo).to.not.exist;
  });
});

