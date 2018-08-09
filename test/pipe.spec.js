'use strict';

import chai from 'chai';
import sinon from 'sinon';

import { Pipe } from 'core/pipe';
import { Handler } from 'handler/handler';

//******************************************************************************
const expect = chai.expect;

describe('Pipe', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  describe('Handler manipulation', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('addHead', () => {
      const pipe = new Pipe();
      const handlers = [
        new Handler(),
        new Handler(),
        new Handler()
      ]
      for(let h of handlers)
        pipe.addHead(h);
      const actual = pipe.getHandlerArray().reverse();
      expect(actual).to.deep.equal(handlers);
    });//addHead
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('addTail', () => {
      const pipe = new Pipe();
      const handlers = [
        new Handler(),
        new Handler(),
        new Handler()
      ]
      for(let h of handlers)
        pipe.addTail(h);
      const actual = pipe.getHandlerArray();
      expect(actual).to.deep.equal(handlers);
    });//addTail
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('addBefore', () => {
      const pipe = new Pipe();
      const ref = new Handler();
      const h1 = new Handler();
      const h2 = new Handler();
      const expected = [h1, h2, ref];
      pipe.addHead(ref)
        .addBefore(h1, ref)
        .addBefore(h2, ref);
      const actual = pipe.getHandlerArray();
      expect(actual).to.deep.equal(expected);
    });//addBefore
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('addAfter', () => {
      const pipe = new Pipe();
      const ref = new Handler();
      const h1 = new Handler();
      const h2 = new Handler();
      const expected = [ref, h2, h1];
      pipe.addHead(ref)
        .addAfter(h1, ref)
        .addAfter(h2, ref);
      const actual = pipe.getHandlerArray();
      expect(actual).to.deep.equal(expected);
    });//addAfter
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('removeHead', () => {
      const pipe = new Pipe();
      const head = new Handler();
      const handlers = [
        new Handler(),
        new Handler(),
      ]
      pipe.addHead(head);
      for(let h of handlers)
      {
        pipe.addTail(h);
      }
      expect(pipe.getHandlerArray()).to.not.deep.equal(handlers);
      pipe.removeHead();
      expect(pipe.getHandlerArray()).to.deep.equal(handlers);
    });//removeHead
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('removeTail', () => {
      const pipe = new Pipe();
      const tail = new Handler();
      const handlers = [
        new Handler(),
        new Handler(),
      ]
      for(let h of handlers)
      {
        pipe.addTail(h);
      }
      pipe.addTail(tail);
      expect(pipe.getHandlerArray()).to.not.deep.equal(handlers);
      pipe.removeTail();
      expect(pipe.getHandlerArray()).to.deep.equal(handlers);
    });//removeTail
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('remove', () => {
      const pipe = new Pipe();
      const ref = new Handler();
      const h1 = new Handler();
      const h2 = new Handler();
      const expected = [h1, h2];
      pipe.addTail(h1)
        .addTail(ref)
        .addTail(h2);
      expect(pipe.getHandlerArray()).to.not.deep.equal(expected);
      pipe.remove(ref.id);
      expect(pipe.getHandlerArray()).to.deep.equal(expected);
    });//remove
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('removeBefore', () => {
      const pipe = new Pipe();
      const rem = new Handler();
      const h1 = new Handler();
      const h2 = new Handler();
      const expected = [h1, h2];
      pipe.addTail(h1)
        .addTail(rem)
        .addTail(h2);
      expect(pipe.getHandlerArray()).to.not.deep.equal(expected);
      pipe.removeBefore(h2.id);
      expect(pipe.getHandlerArray()).to.deep.equal(expected);
      pipe.removeBefore(h1.id);
      expect(pipe.getHandlerArray()).to.deep.equal(expected);
    });//removeBefore
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('removeAfter', () => {
      const pipe = new Pipe();
      const rem = new Handler();
      const h1 = new Handler();
      const h2 = new Handler();
      const expected = [h1, h2];
      pipe.addTail(h1)
        .addTail(rem)
        .addTail(h2);
      expect(pipe.getHandlerArray()).to.not.deep.equal(expected);
      pipe.removeAfter(h1.id);
      expect(pipe.getHandlerArray()).to.deep.equal(expected);
      pipe.removeAfter(h2.id);
      expect(pipe.getHandlerArray()).to.deep.equal(expected);
    });//removeAfter
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('getHandler', () => {
      const pipe = new Pipe();
      const handlers = [
        new Handler(),
        new Handler(),
        new Handler()
      ]
      for(let h of handlers)
        pipe.addTail(h);
      for(let h of handlers)
        expect(pipe.getHandler(h.id)).to.equal(h);
    });//getHandler
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('getHandlerBefore', () => {
      const pipe = new Pipe();
      const handlers = [
        new Handler(),
        new Handler(),
        new Handler(),
        new Handler()
      ]
      for(let h of handlers)
        pipe.addTail(h);
      handlers.reverse();
      const ref = handlers[0]; 
      for(let i = 1; i < handlers.length; i++)
        expect(pipe.getHandlerBefore(ref, i - 1)).to.equal(handlers[i]);
      expect(pipe.getHandlerBefore(ref, handlers.length)).to.be.undefined;
      expect(pipe.getHandlerBefore(ref)).to.equal(handlers[1]);
      expect(pipe.getHandlerBefore(ref, -1)).to.equal(handlers[1]);
    });//getHandlerBefore
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('getHandlerAfter', () => {
      const pipe = new Pipe();
      const handlers = [
        new Handler(),
        new Handler(),
        new Handler(),
        new Handler()
      ]
      for(let h of handlers)
        pipe.addTail(h);
      const ref = handlers[0]; 
      for(let i = 1; i < handlers.length; i++)
        expect(pipe.getHandlerAfter(ref, i - 1)).to.equal(handlers[i]);
      expect(pipe.getHandlerAfter(ref, handlers.length)).to.be.undefined;
      expect(pipe.getHandlerAfter(ref)).to.equal(handlers[1]);
      expect(pipe.getHandlerAfter(ref, -1)).to.equal(handlers[1]);
    });//getHandlerAfter
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    it('getHandlerIterator', () => {
      const pipe = new Pipe();
      const h0 = new Handler();
      const h1 = new Handler();
      const h2 = new Handler();
      const h3 = new Handler();
      const handlers = [h0, h1, h2, h3];
      for(let h of handlers)
        pipe.addTail(h);
      const itr = pipe.getHandlerIterator();
      expect([...itr]).to.deep.equal([pipe._head.handler, ... handlers, pipe._tail.handler]);
    });//getHandlerIterator
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  });//Handler Manipulation
});//Pipe
//******************************************************************************