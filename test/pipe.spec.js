/**
 * Created by Dmitri on 11/18/2016.
 */
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
const expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Handler from '../src/handler/handler';
import Pipe from '../src/pipe';
import Constants from '../src/const';

function validateOrder(pipe, order)
{
  for(let i = 0; i < order.length; i++)
  {
    let cur = pipe._getWrapper(order[i]);
    expect(cur.handler).to.equal(order[i]);
    expect(cur.beg).to.exist;
    expect(cur.end).to.exist;
    if(i > 0)
      expect(cur.beg.handler).to.equal(order[i - 1]);
    if(i < order.length - 1)
      expect(cur.end.handler).to.equal(order[i + 1]);
  }
}

function validateSpies(called = [], notCalled = [], testFn = 'calledOnce')
{
  const test = typeof testFn === 'string' ?
    (spy) => {return spy[testFn];} :
    testFn;
  for(let i = called.length; --i > 0;)
  {
    const testVal = test(called[i]);
    expect(test(called[i])).to.be.true;
    expect(called[i].calledAfter(called[i - 1]));
  }
  if(called.length)
    expect(test(called[0])).to.be.true;
  for(let i = notCalled.length; --i >= 0;)
  {
    expect(notCalled[i].called).to.be.false;
  }
}

class TestHandler extends Handler
{
  inbound(cntx)
  {
    // console.log(this.id, 'inbound');
    expect(cntx.process.dir).to.equal(Constants.INBOUND);
    if(this.config.reflectIn && !cntx[this.id])
    {
      cntx[this.id] = this;
      cntx.process.end();
      cntx.pipe.processOutbound({}, this, 1);
    }
    if(this.config.inject)
    {
      const inject = this.config.inject;
      delete this.config.inject;
      cntx.pipe.addAfter(inject, this);
    }
  }

  outbound(cntx)
  {
    // console.log(this.id, 'outbound');
    expect(cntx.process.dir).to.equal(Constants.OUTBOUND);
    if(this.config.reflectOut && !cntx[this.id])
    {
      cntx[this.id] = this;
      cntx.process.end();
      cntx.pipe.processInbound({}, this, 1);
    }
    if(this.config.inject)
    {
      const inject = this.config.inject;
      delete this.config.inject;
      cntx.pipe.addBefore(inject, this);
    }
  }
}

describe('Pipe', function()
{
  describe('Handler management', function()
  {
    let pipe;
    let h1 = new Handler({id:'h1'});
    let h2 = new Handler({id:'h2'});
    let h3 = new Handler({id:'h3'});
    beforeEach(function()
    {
      pipe = new Pipe();
    });
    it('addBeg works', function()
    {
      pipe.addBeg(h1).addBeg(h2).addBeg(h3);
      validateOrder(pipe, [h3, h2, h1]);
    });
    it('addEnd works', function()
    {
      pipe.addEnd(h1).addEnd(h2).addEnd(h3);
      validateOrder(pipe, [h1, h2, h3]);
    });
    it('addBefore works', function()
    {
      pipe.addBeg(h1).addBefore(h2, h1).addBefore(h3, h1);
      validateOrder(pipe, [h2, h3, h1]);
    });
    it('addAfter works', function()
    {
      pipe.addBeg(h1).addAfter(h2, h1).addAfter(h3, h1);
      validateOrder(pipe, [h1, h3, h2]);
    });
    it('handler can only be added once', function()
    {
      pipe.addBeg(h1);
      expect(()=>{pipe.addBeg(h1);}).to.throw(Error);
    });
    it('removeBeg works', function()
    {
      pipe.addEnd(h1).addEnd(h2).addEnd(h3).removeBeg();
      validateOrder(pipe, [h2, h3]);
      pipe.removeBeg();
      validateOrder(pipe, [h3]);
    });
    it('removeEnd works', function()
    {
      pipe.addEnd(h1).addEnd(h2).addEnd(h3).removeEnd();
      validateOrder(pipe, [h1, h2]);
      pipe.removeEnd();
      validateOrder(pipe, [h1]);
    });
    it('remove works', function()
    {
      pipe.addEnd(h1).addEnd(h2).addEnd(h3).remove(h2);
      validateOrder(pipe, [h1, h3]);
      pipe.remove('foo').remove(h1);
      validateOrder(pipe, [h3]);
    });
    it('removeBefore works', function()
    {
      pipe.addEnd(h1).addEnd(h2).addEnd(h3).removeBefore(h1);
      validateOrder(pipe, [h1, h2, h3]);
      pipe.removeBefore('foo').removeBefore(h3);
      validateOrder(pipe, [h1, h3]);
    });
    it('removeAfter works', function()
    {
      pipe.addEnd(h1).addEnd(h2).addEnd(h3).removeAfter(h3);
      validateOrder(pipe, [h1, h2, h3]);
      pipe.removeAfter('foo').removeAfter(h1);
      validateOrder(pipe, [h1, h3]);
    });
  });
  describe('Message Propagation', function()
  {
    let p1 = new Pipe({id:'p1'});
    let p2 = new Pipe({id:'p2'});
    let p1h1 = new TestHandler({id:'p1h1'});
    let p1h2 = new TestHandler({id:'p1h2'});
    let p1h3 = new TestHandler({id:'p1h3'});
    p1.addEnd(p1h1).addEnd(p1h2).addEnd(p2).addEnd(p1h3);
    let p2h1 = new TestHandler({id:'p2h1'});
    let p2h2 = new TestHandler({id:'p2h2'});
    let p2h3 = new TestHandler({id:'p2h3'});
    p2.addEnd(p2h1).addEnd(p2h2).addEnd(p2h3);

    let s11i = sinon.spy(p1h1, 'inbound');
    let s11o = sinon.spy(p1h1, 'outbound');
    let s12i = sinon.spy(p1h2, 'inbound');
    let s12o = sinon.spy(p1h2, 'outbound');
    let s13i = sinon.spy(p1h3, 'inbound');
    let s13o = sinon.spy(p1h3, 'outbound');
    let s21i = sinon.spy(p2h1, 'inbound');
    let s21o = sinon.spy(p2h1, 'outbound');
    let s22i = sinon.spy(p2h2, 'inbound');
    let s22o = sinon.spy(p2h2, 'outbound');
    let s23i = sinon.spy(p2h3, 'inbound');
    let s23o = sinon.spy(p2h3, 'outbound');
    let s2i = sinon.spy(p2, 'inbound');
    let s2o = sinon.spy(p2, 'outbound');
    const spies = [s11i, s11o, s12i, s12o, s13i, s13o, s21i, s21o, s22i, s22o, s23i, s23o, s2i, s2o];
    const inboundSpies = [s11i, s12i, s2i, s21i, s22i, s23i, s13i];
    const outboundSpies = [s11o, s12o, s2o, s21o, s22o, s23o, s13o];
    beforeEach(function()
    {
      for(let i = spies.length; --i >= 0;)
      {
        spies[i].reset();
      }
    });
    it('inbound propagation works', function()
    {
      p1.processInbound();
      validateSpies(inboundSpies, outboundSpies);
    });
    it('outbound propagation works', function()
    {
      p1.processOutbound();
      validateSpies(outboundSpies, inboundSpies);
    });
    it('pipe modification during message propagation works', function()
    {
      const inject = new Handler({id:'injectable'});
      inject.inbound = (cntx) =>
      {
        cntx.pipe.remove(inject);
      };
      const injectSpy = sinon.spy(inject, 'inbound');
      p1h1.config.inject = inject;
      p2h2.config.inject = inject;
      p1.processInbound();
      validateSpies(inboundSpies, outboundSpies);
      expect(injectSpy.calledTwice).to.be.true;
      expect(p1.getHandler(inject)).to.not.exist;
      expect(p2.getHandler(inject)).to.not.exist;
      // delete p1h1.config.inject;
      // delete p2h2.config.inject;
    });
    it('handler onAdd/onRemove can push messages into pipe', function()
    {
      const inject = new Handler({id:'injectable'});
      inject.onAdd = (cntx) =>
      {
        cntx.pipe.processOutbound();
      };
      inject.onRemove = (cntx) =>
      {
        cntx.pipe.processOutbound();
      };
      const injectAddSpy = sinon.spy(inject, 'onAdd');
      const injectRemSpy = sinon.spy(inject, 'onRemove');
      p1.addBeg(inject);
      p1.remove(inject);
      validateSpies(outboundSpies, inboundSpies, 'calledTwice');
      expect(injectAddSpy.calledOnce).to.be.true;
      expect(injectRemSpy.calledOnce).to.be.true;
    });
    it('process nesting works', function()
    {
      p1h1.config.reflectOut = true;
      p2h3.config.reflectIn = true;
      p1.processInbound();
      expect(s11i.calledOnce).to.be.true;
      expect(s12i.calledTwice).to.be.true;
      expect(s21i.calledTwice).to.be.true;
      expect(s22i.calledTwice).to.be.true;
      expect(s23i.calledTwice).to.be.true;
      expect(s13i.calledOnce).to.be.true;

      expect(s11o.calledOnce).to.be.true;
      expect(s12o.calledOnce).to.be.true;
      expect(s21o.calledOnce).to.be.true;
      expect(s22o.calledOnce).to.be.true;
      expect(s23o.called).to.be.false;
      expect(s13o.called).to.be.false;
      p1h1.config.reflectOut = false;
      p2h3.config.reflectIn = false;
    });
    it('submit works', function(){
      const promise = new Promise((resolve) =>
      {
        const resolver = new Handler();
        resolver.inbound = (cntx) =>
        {
          cntx.pipe.remove(resolver);
          resolve();
        };
        p1.addEnd(resolver);
        p1.submitInbound();
      });
      return expect(promise).to.be.fulfilled;
    });
  });
});