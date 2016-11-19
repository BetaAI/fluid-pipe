/**
 * Created by Dmitri on 11/18/2016.
 */
'use strict';

import chai from 'chai';
const expect = chai.expect;
chai.should();


describe('Pipe', function()
{
  describe('Handler management', function()
  {
    it('addition works');
    it('removal works');
  });
  describe('Message Propagation', function()
  {
    it('inbound propagation works');
    it('outbound propagation works');
    it('pipe modification during message propagation works');
    it('submit works');
    it('pipe acts as handler for another pipe');
  });
});