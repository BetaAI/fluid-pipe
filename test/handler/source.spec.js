'use strict';

import chai from 'chai';
import sinon from 'sinon';

import { Source, Pipe } from 'src/index';

//******************************************************************************
const expect = chai.expect;

describe('Source', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  it('onAdd', () => {
    const h = new Source();
    const spy = sinon.spy(h, 'onAdd');
    const p0 = new Pipe();
    const p1 = new Pipe();
    p0.addTail(h);
    p1.addTail(h);
    expect(spy.calledTwice).to.be.true;
    expect(spy.getCall(0).args[0]).to.equal(p0);
    expect(spy.getCall(1).args[0]).to.equal(p1);
    expect([...h._pipes]).to.deep.equal([p0, p1]);
  });//onAdd
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  it('onRemove', () => {
    const h = new Source();
    const spy = sinon.spy(h, 'onRemove');
    const p0 = new Pipe();
    const p1 = new Pipe();
    p0.addTail(h);
    p1.addTail(h);
    p0.remove(h);
    expect(spy.calledOnce).to.be.true;
    expect(spy.getCall(0).args[0]).to.equal(p0);
    expect([...h._pipes]).to.deep.equal([p1]);
  });//onRemove
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
});//Source
//******************************************************************************