'use strict';

import chai from 'chai';
import sinon from 'sinon';

import { Process, Pipe, Handler, ConfigurableHandler } from 'index';

//******************************************************************************
const expect = chai.expect;

describe('Process', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  describe('Data Management', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('get|set data', () => {
      const prc = new Process();
      let data = prc.data;
      expect(data).to.be.empty;
      prc.data.foo = 'bar';
      expect(data).to.be.not.empty;
      prc.data = {foo: 'bar'};
      expect(prc.data).to.not.equal(data);
      expect(prc.data).to.deep.equal(data);
    });//get|set data
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('pushData|popData', () => {
      const prc = new Process();
      const data = [1,2,3,4];
      prc.data = 0;
      for(let i of data)
        prc.pushData(i);
      data.reverse();
      data.push(0);
      for(let i of data)
        expect(prc.popData()).to.equal(i);
      expect(prc.data).to.be.empty;
    });//pushData|popData
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('getData|setData', () => {
      const prc = new Process();
      const data = [2,3,4,5];
      prc.data = 1;
      for(let i of data)
        prc.pushData(i);
      data.unshift(1);
      expect(prc.getData()).to.equal(data[data.length - 1]);
      for(let i = 0; i < data.length; i++)
      {
        expect(prc.getData(i)).to.equal(data[i]);
        prc.setData(-data[i], i);
        expect(prc.getData(i)).to.equal(-data[i]);
      }
      expect(prc.getData(100)).to.be.undefined;
      expect(prc.getData(-100)).to.be.undefined;
      expect(() => prc.setData(0, 100)).to.throw('out of bounds');
      expect(() => prc.setData(0, -100)).to.throw('out of bounds');
    });//getData|setData
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  });//Data Management
  describe('Message Management', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('get|set message', () => {
      const prc = new Process();
      let msg = prc.message;
      expect(msg).to.be.empty;
      prc.message.foo = 'bar';
      expect(msg).to.be.not.empty;
      prc.message = {foo: 'bar'};
      expect(prc.message).to.not.equal(msg);
      expect(prc.message).to.deep.equal(msg);
    });//get|set message
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('pushMessage|popMessage', () => {
      const prc = new Process();
      const msg = [1,2,3,4];
      prc.message = 0;
      for(let i of msg)
        prc.pushMessage(i);
      msg.reverse();
      msg.push(0);
      for(let i of msg)
        expect(prc.popMessage()).to.equal(i);
      expect(prc.message).to.be.empty;
    });//pushMessage|popMessage
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('getMessage|setMessage', () => {
      const prc = new Process();
      const msg = [2,3,4,5];
      prc.message = 1;
      for(let i of msg)
        prc.pushMessage(i);
      msg.unshift(1);
      expect(prc.getMessage()).to.equal(msg[msg.length - 1]);
      for(let i = 0; i < msg.length; i++)
      {
        expect(prc.getMessage(i)).to.equal(msg[i]);
        prc.setMessage(-msg[i], i);
        expect(prc.getMessage(i)).to.equal(-msg[i]);
      }
      expect(prc.getMessage(100)).to.be.undefined;
      expect(prc.getMessage(-100)).to.be.undefined;
      expect(() => prc.setMessage(0, 100)).to.throw('out of bounds');
      expect(() => prc.setMessage(0, -100)).to.throw('out of bounds');
    });//getMessage|setMessage
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  });//Message Management
  describe('Process Execution', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const prc = new Process();
    const p0 = new Pipe();
    const p1 = new Pipe();
    p0.addTail(new Handler({id:0}))
      .addTail(new Handler({id:1}))
      .addTail(new Handler({id:2}))
      .addTail(new ConfigurableHandler({id:3}))
      .addTail(new Handler({id:4}))
      .addTail(new Handler({id:5}))
      .addTail(new Handler({id:6}));
    p1.addTail(new Handler({id:0}))
      .addTail(new Handler({id:1}))
      .addTail(new Handler({id:2}))
      .addTail(p0)
      .addTail(new Handler({id:4}))
      .addTail(new Handler({id:5}))
      .addTail(new Handler({id:6}));
    const cfg = p0.getHandler(3).config;
    for(let h of p0.getHandlerArray())
    {
      sinon.spy(h, 'inbound');
      sinon.spy(h, 'outbound');
    }
    for(let h of p1.getHandlerArray())
    {
      sinon.spy(h, 'inbound');
      sinon.spy(h, 'outbound');
    }
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    beforeEach(() => {
      const arr = [
        ...p0.getHandlerArray(),
        ...p1.getHandlerArray(),
      ];
      for(let h of arr)
      {
        h.inbound.resetHistory();
        h.outbound.resetHistory();
      }
      delete cfg.inbound;
      delete cfg.outbound;
    });//beforeEach
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('run', () => {
      prc.begContext(p1);
      prc.inbound = true;
      expect(prc.alive).to.be.true;
      expect(prc.inbound).to.be.true;
      cfg.inbound = (p) => expect(p.running).to.be.true;
      cfg.outbound = (p) => expect(p.running).to.be.true;
      prc.run();
      expect(prc.alive).to.be.false;
      let order = p1.getHandlerArray();
      order.splice(4, 0, ...p0.getHandlerArray());
      for(let i = order.length; --i > 0;)
      {
        const cur = order[i];
        const prev = order[i - 1];
        expect(cur.inbound.calledOnce).to.be.true;
        expect(prev.inbound.calledOnce).to.be.true;
        expect(cur.inbound.calledAfter(prev.inbound)).to.be.true;
        expect(cur.outbound.notCalled).to.be.true;
        expect(prev.outbound.notCalled).to.be.true;
      }
      prc.begContext(p1);
      prc.inbound = false;
      expect(prc.alive).to.be.true;
      expect(prc.inbound).to.be.false;
      prc.run();
      order = p1.getHandlerArray();
      order.splice(3, 0, ...p0.getHandlerArray());
      for(let i = order.length; --i > 0;)
      {
        const cur = order[i];
        const prev = order[i - 1];
        expect(cur.inbound.calledOnce).to.be.true;
        expect(prev.inbound.calledOnce).to.be.true;
        expect(cur.outbound.calledBefore(prev.outbound)).to.be.true;
        expect(cur.outbound.calledOnce).to.be.true;
        expect(prev.outbound.calledOnce).to.be.true;
      }
    });//run
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('pause', () => {
      prc.begContext(p1);
      prc.inbound = true;
      expect(prc.alive).to.be.true;
      expect(prc.inbound).to.be.true;
      cfg.inbound = (p) => p.pause();
      prc.run();
      expect(prc.alive).to.be.true;
      expect(prc._cntxStack.length).to.equal(2);
      const before = [
        p1.getHandler(0),
        p1.getHandler(1),
        p1.getHandler(2),
        p1.getHandler(p0),
        p0.getHandler(0),
        p0.getHandler(1),
        p0.getHandler(2),
        p0.getHandler(3)
      ];
      const after = [
        p0.getHandler(4),
        p0.getHandler(5),
        p0.getHandler(6),
        p1.getHandler(4),
        p1.getHandler(5),
        p1.getHandler(6),
      ];
      for(let h of before)
      {
        expect(h.inbound.calledOnce).to.be.true;
      }
      for(let h of after)
      {
        expect(h.inbound.notCalled).to.be.true;
      }
      prc.run();
      expect(prc.alive).to.be.false;
      for(let h of before)
      {
        expect(h.inbound.calledOnce).to.be.true;
      }
    });//pause
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('terminate', () => {
      prc.begContext(p1);
      prc.inbound = true;
      expect(prc.alive).to.be.true;
      expect(prc.inbound).to.be.true;
      cfg.inbound = (p) => p.terminate();
      prc.run();
      expect(prc.alive).to.be.false;
      const before = [
        p1.getHandler(0),
        p1.getHandler(1),
        p1.getHandler(2),
        p1.getHandler(p0),
        p0.getHandler(0),
        p0.getHandler(1),
        p0.getHandler(2),
        p0.getHandler(3)
      ];
      const after = [
        p0.getHandler(4),
        p0.getHandler(5),
        p0.getHandler(6),
        p1.getHandler(4),
        p1.getHandler(5),
        p1.getHandler(6),
      ];
      for(let h of before)
      {
        expect(h.inbound.calledOnce).to.be.true;
      }
      for(let h of after)
      {
        expect(h.inbound.notCalled).to.be.true;
      }
    });//terminate
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('reverse direction', () => {
      prc.begContext(p1);
      prc.inbound = true;
      expect(prc.alive).to.be.true;
      expect(prc.inbound).to.be.true;
      cfg.inbound = (p) => p.inbound = false;
      prc.run();
      expect(prc.alive).to.be.false;
      const before = [
        p1.getHandler(0),
        p1.getHandler(1),
        p1.getHandler(2),
        p0.getHandler(0),
        p0.getHandler(1),
        p0.getHandler(2),
      ];
      const after = [
        p0.getHandler(4),
        p0.getHandler(5),
        p0.getHandler(6),
        p1.getHandler(4),
        p1.getHandler(5),
        p1.getHandler(6),
      ];
      for(let h of before)
      {
        expect(h.inbound.calledOnce).to.be.true;
        expect(h.outbound.calledOnce).to.be.true;
      }
      expect(p0.inbound.calledOnce).to.be.true;
      expect(p0.outbound.notCalled).to.be.true;
      expect(p0.getHandler(3).inbound.calledOnce).to.be.true;
      expect(p0.getHandler(3).outbound.notCalled).to.be.true;
      for(let h of after)
      {
        expect(h.inbound.notCalled).to.be.true;
        expect(h.outbound.notCalled).to.be.true;
      }
    });//reverse direction
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('endContext', () => {
      prc.begContext(p1);
      prc.inbound = true;
      expect(prc.alive).to.be.true;
      expect(prc.inbound).to.be.true;
      cfg.inbound = (p) => p.endContext();
      prc.run();
      expect(prc.alive).to.be.false;
      const before = [
        p0.getHandler(1),
        p0.getHandler(2),
        p0.getHandler(3),
      ];
      const after = [
        p0.getHandler(4),
        p0.getHandler(5),
        p0.getHandler(6),
      ];
      for(let h of p1.getHandlerArray())
      {
        expect(h.inbound.calledOnce).to.be.true;
        expect(h.outbound.notCalled).to.be.true;
      }
      for(let h of before)
      {
        expect(h.inbound.calledOnce).to.be.true;
        expect(h.outbound.notCalled).to.be.true;
      }
      for(let h of after)
      {
        expect(h.inbound.notCalled).to.be.true;
        expect(h.outbound.notCalled).to.be.true;
      }
    });//endContext
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  });//Process Execution
});//Process
//******************************************************************************
