/**
 * Created by Dmitri on 11/18/2016.
 */
'use strict';

import chai from 'chai';
const expect = chai.expect;
chai.should();

import Context from '../src/context';

describe('Context', function()
{
  const fauxPipe1 = {id:Symbol()};
  const fauxPipe2 = {id:Symbol()};
  const fauxPipe3 = {id:Symbol()};
  const msg1 = Symbol();
  const msg2 = Symbol();
  let cntx1;
  let cntx2;
  let cntx3;
  beforeEach(function()
  {
    cntx1 = new Context(fauxPipe1);
    cntx2 = new Context(fauxPipe2);
    cntx3 = new Context(fauxPipe3);
  });
  it('has pipe, master, and headMaster', function()
  {
    expect(cntx2.pipe).to.equal(fauxPipe2);
    expect(cntx2.master).to.be.null;
    expect(cntx2.headMaster).to.be.null;
    cntx2.master = cntx1;
    expect(cntx2.master).to.equal(cntx1);
    expect(cntx2.headMaster).to.equal(cntx1);
    cntx3.master = cntx2;
    expect(cntx3.master).to.equal(cntx2);
    expect(cntx3.headMaster).to.equal(cntx1);
  });
  it('message stack works', function()
  {
    expect(cntx1.message).to.not.exist;
    expect(cntx1.pushMessage(msg1)).to.equal(msg1);
    expect(cntx1.message).to.equal(msg1);
    expect(cntx1.pushMessage(msg2)).to.equal(msg2);
    expect(cntx1.message).to.equal(msg2);
    expect(cntx1.popMessage()).to.equal(msg2);
    expect(cntx1.message).to.equal(msg1);
  });
  it('processData stack works', function()
  {
    expect(cntx1.processData).to.exist;
    expect(cntx1.pushProcessData(msg1)).to.equal(msg1);
    expect(cntx1.processData).to.equal(msg1);
    expect(cntx1.pushProcessData(msg2)).to.equal(msg2);
    expect(cntx1.processData).to.equal(msg2);
    expect(cntx1.popProcessData()).to.equal(msg2);
    expect(cntx1.processData).to.equal(msg1);
  });
  it('process start and end work', function()
  {
    cntx2.master = cntx1;
    expect(cntx2.processDepth).to.equal(cntx1.processDepth);
    const p1 = cntx1.beginProcess(msg1);
    expect(cntx2.processDepth).to.equal(p1);
    expect(cntx2.message).to.equal(msg1);
    const p2 = cntx2.beginProcess(msg2);
    expect(cntx1.processDepth).to.equal(p2);
    expect(cntx1.message).to.equal(msg2);
    cntx2.endProcess();
    expect(cntx2.processDepth).to.equal(p1);
    cntx1.endProcess(p2);
    expect(cntx2.processDepth).to.equal(p1);
  });
});