/**
 * Created by dmitri on 3/30/2017.
 */
'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
const expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Handler from '../src/handler/handler';
import PromiseHandler from '../src/handler/promise';
import Pipe from '../src/pipe';

describe('PromiseHandler', function()
{
  const pipe = new Pipe();
  const beg = new Handler();
  const end = new Handler();
  const prh = new PromiseHandler();
  pipe.addEnd(beg).addEnd(prh).addEnd(end);
  function simpleAcceptor(cntx, accept)
  {
    accept(cntx.process.message);
  }
  function complexAcceptor(cntx, accept)
  {
    if(!this.results)
      this.results = [];
    this.results.push(cntx.process.message);
    if(this.results.length == 2)
      accept(this.results);
  }
  it('inbound promise resolves on inbound process', function()
  {
    const msg = 'Foo';
    const promise = prh.newInboundPromise(simpleAcceptor, 'Inbound');
    pipe.processInbound(msg);
    //prh.delPromise('Inbound', msg);
    return expect(promise).to.eventually.equal(msg);
  });
  it('inbound promise doesn\'t resolve on outbound process', function()
  {
    const msg = 'Foo';
    const promise = prh.newInboundPromise(simpleAcceptor, 'Inbound');
    pipe.processOutbound(msg);
    prh.delPromise('Inbound', msg);
    return promise.should.be.rejectedWith(msg);
  });
  it('outbound promise resolves on outbound process', function()
  {
    const msg = 'Bar';
    const promise = prh.newOutboundPromise(simpleAcceptor, 'Outbound');
    pipe.processOutbound(msg);
    //prh.delPromise('Outbound', msg);
    return expect(promise).to.eventually.equal(msg);
  });
  it('outbound promise doesn\'t resolve on inbound process', function()
  {
    const msg = 'Bar';
    const promise = prh.newOutboundPromise(simpleAcceptor, 'Outbound');
    pipe.processInbound(msg);
    prh.delPromise('Outbound', msg);
    return promise.should.be.rejectedWith(msg);
  });
  it('unidirectional promise works', function()
  {
    const msgIn = 'Foo';
    const msgOut = 'Bar';
    const promise = prh.newPromise(complexAcceptor.bind({}));
    pipe.submitInbound(msgIn).submitOutbound(msgOut);
    return expect(promise).to.eventually.deep.equal([msgIn, msgOut]);
  });
});

