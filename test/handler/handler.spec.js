'use strict';

import chai from 'chai';

import { Handler } from 'src/index';

//******************************************************************************
const expect = chai.expect;

describe('Handler', () => {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  it('id', () => {
    const config = {id:0};
    const h = new Handler(config);
    expect(h.id).to.equal(config.id);
    config.id = 1;
    expect(h.id).to.not.equal(config.id);
  });//id
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
});//Handler
//******************************************************************************