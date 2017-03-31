/**
 * Created by Dmitri on 11/18/2016.
 */
'use strict';

import chai from 'chai';
const expect = chai.expect;
chai.should();

import Source from '../src/handler/source';

describe('Source', function()
{
  const src = new Source();
  it('has pipe map', function()
  {
    expect(src._pipeMap).to.exist;
  });
  it('pipe map property is immutable', function()
  {
    expect(()=>{delete src._pipeMap;}).to.throw(Error);
    expect(()=>{src._pipeMap = {};}).to.throw(Error);
  });
  it('pipeline registration works', function()
  {
    const fauxCntx1 = {pipe:{id:Symbol()}};
    const fauxCntx2 = {pipe:{id:Symbol()}};
    src.onAdd(fauxCntx1);
    expect(src._pipeMap.size).to.equal(1);
    expect(src._pipeMap.get(fauxCntx1.pipe.id)).to.equal(fauxCntx1.pipe);
    expect(src._pipeMap.get(fauxCntx2.pipe.id)).to.not.exist;
    src.onAdd(fauxCntx2);
    expect(src._pipeMap.size).to.equal(2);
    expect(src._pipeMap.get(fauxCntx1.pipe.id)).to.equal(fauxCntx1.pipe);
    expect(src._pipeMap.get(fauxCntx2.pipe.id)).to.equal(fauxCntx2.pipe);
    src.onRemove(fauxCntx1);
    expect(src._pipeMap.size).to.equal(1);
    expect(src._pipeMap.get(fauxCntx2.pipe.id)).to.equal(fauxCntx2.pipe);
    expect(src._pipeMap.get(fauxCntx1.pipe.id)).to.not.exist;
  });
});