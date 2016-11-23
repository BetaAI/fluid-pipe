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
  it('has pipe, master, headMaster, and process', function()
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
    expect(cntx1.process).to.not.exist;
    const prc1 = cntx1._begPrc();
    expect()
  });
  it('process stack works', function()
  {
    expect(cntx1.process).to.not.exist;
    const prc1 = cntx1._begPrc();
    expect(cntx1.process).to.equal(prc1);
    const prc2 = cntx1._begPrc();
    expect(cntx1.process).to.equal(prc2);
    cntx1._endPrc(prc1);
    expect(cntx1.process).to.equal(prc2);
    const prc3 = cntx1._begPrc();
    expect(cntx1.process).to.equal(prc3);
    cntx1._endPrc(prc3);
    expect(cntx1.process).to.equal(prc2);
    cntx1._endPrc(prc2);
    expect(cntx1.process).to.not.exist;
  });
  it('message stack works', function()
  {
    const prc = cntx1._begPrc();
    expect(prc.message).to.exist;
    expect(prc.pushMsg(msg1)).to.equal(msg1);
    expect(prc.message).to.equal(msg1);
    expect(prc.pushMsg(msg2)).to.equal(msg2);
    expect(prc.message).to.equal(msg2);
    expect(prc.popMsg()).to.equal(msg2);
    expect(prc.message).to.equal(msg1);
  });
  it('processData stack works', function()
  {
    const prc = cntx1._begPrc();
    expect(prc.data).to.exist;
    expect(prc.pushData(msg1)).to.equal(msg1);
    expect(prc.data).to.equal(msg1);
    expect(prc.pushData(msg2)).to.equal(msg2);
    expect(prc.data).to.equal(msg2);
    expect(prc.getData(1)).to.equal(msg1);
    expect(prc.popData()).to.equal(msg2);
    expect(prc.data).to.equal(msg1);
  });
});