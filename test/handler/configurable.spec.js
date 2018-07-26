'use strict';

import chai from 'chai';
import sinon from 'sinon';

import { ConfigurableHandler, Process } from 'src/index';

//******************************************************************************
const expect = chai.expect;

describe('ConfigurableHandler', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  it('inbound|outbound', () => {
    const config = {
      inbound: sinon.spy(),
      outbound: sinon.spy(),
    };
    const h = new ConfigurableHandler(config);
    const prc = new Process();
    h.inbound(prc);
    h.outbound(prc);
    expect(config.inbound.calledOnce).to.be.true;
    expect(config.outbound.calledOnce).to.be.true;
    const callIn = config.inbound.getCall(0);
    const callOut = config.outbound.getCall(0);
    expect(callIn.calledOn(h)).to.be.true;
    expect(callIn.calledWithExactly(prc)).to.be.true;
    expect(callOut.calledOn(h)).to.be.true;
    expect(callOut.calledWithExactly(prc)).to.be.true;
  });//inbound|outbound
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
});//ConfigurableHandler
//******************************************************************************