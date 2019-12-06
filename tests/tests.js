const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = 'chai'

const { beforeEach, afterEach, describe, it } = require('mocha')
const employee = require('./employee')
const products = require('./products')
const pricing = require('../pricing')

chai.use(sinonChai)
describe('pricing', () => {
  describe('formatPrice', () => {
    it('return the price with 2 decimal places', () => {
      const formatprice = pricing.formatPrice(33.323)
      expect(formatprice).to.equal(33.32)
    })

    it('returns 2 decimal places for a whole number', () => {
      const formatPrice = pricing.formatPrice(10)
      expect(formatPrice).to.equal(10.00)
    })
  })

  describe('getEmployerContribution', () => {
    it('return contribution amount when contribution type is dollars', () => {
      const contributionMode = products.longTermDisability.employerContribution
      const price = 43.75
      const contribution = pricing.getEmployerContribution(
        contributionMode,
        price
      )
      expect(contribution).to.equal(10)
    })
    it('returns the calulation of the price by taking the percentage of the price if the employerContribution mode is percentage', () => {
      const contributionMode = products.voluntaryLife.employerContribution
      const price = 43.75
      const contribution = pricing.getEmployerContribution(
        contributionMode,
        price
      )
      expect(contribution).to.equal(4.375)
    })
  })

  describe('calculateVolLifePrice', () => {
    it('return the price before employer contribution of the vol life product only employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }]
      }
      const price = pricing.calculateVolLifePrice(
        products.voluntaryLife,
        selectedOptions
      )
      expect(price).to.equal(43.75)
    })

    it('return the price before employer contribution of the vol life product for employee and spouse', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee', 'sp'],
        coverageLevel: [
          { role: 'ee', coverage: 200000 },
          { role: 'sp', coverage: 75000 }
        ]
      }
      const price = pricing.calculateVolLifePrice(
        products.voluntaryLife,
        selectedOptions
      )
      expect(price).to.equal(79)
    })

  })
  describe('calculateVolLifePricePerRole', () => {
    it('return the price for VolLife depending on the role', () => {
      const coverageLevel = [{ role: 'ee', coverage: 125000 }]
      const VolLifePrice = pricing.calculateVolLifePricePerRole(
        'ee',
        coverageLevel,
        products.voluntaryLife.costs
      )

      expect(VolLifePrice).to.equal(43.75)
    })
  })

  describe(' calculateLTDPrice', () => {
    it('return the price of ltd before employor contribution', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
      }
      const LTDPrice = pricing.calculateLTDPrice(
        products.longTermDisability,
        employee,
        selectedOptions
      )
      expect(LTDPrice).to.equal(32.04)
    })
  })
  describe('calculateProductPrice', () => {
    let calculateLTDPriceSpy, calculateVolLifePricePerRoleSpy, formatPriceSpy, calculateVolLifePriceSpy, getEmployerContributionSpy, sandbox

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      calculateVolLifePricePerRoleSpy = sandbox.spy(pricing, 'calculateVolLifePricePerRole')
      formatPriceSpy = sandbox.spy(pricing, 'formatPrice')
      calculateVolLifePriceSpy = sandbox.spy(pricing, 'calculateVolLifePrice')
      calculateLTDPriceSpy = sandbox.spy(pricing, 'calculateLTDPrice')
      getEmployerContributionSpy = sandbox.spy(pricing, 'getEmployerContribution')

    })
    afterEach(() => {
      sandbox.restore()
    })

    it('returns the price for a voluntary life product for a single employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }]
      }
      const price = pricing.calculateProductPrice(
        products.voluntaryLife,
        employee,
        selectedOptions
      )

      expect(price).to.equal(39.37)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(calculateVolLifePricePerRoleSpy).to.have.callCount(1)

    })

    it('returns the price for a voluntary life product for an employee with a spouse', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee', 'sp'],
        coverageLevel: [
          { role: 'ee', coverage: 200000 },
          { role: 'sp', coverage: 75000 }
        ]
      }
      const price = pricing.calculateProductPrice(
        products.voluntaryLife,
        employee,
        selectedOptions
      )

      expect(price).to.equal(71.09)
      expect(formatPriceSpy).to.have.callCount(1)
      expect(calculateVolLifePriceSpy).to.have.callCount(1)

      expect(getEmployerContributionSpy).to.have.callCount(1)
    })

    it('returns the price for a disability product for an employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee']
      }
      const price = pricing.calculateProductPrice(
        products.longTermDisability,
        employee,
        selectedOptions
      )

      expect(price).to.equal(22.04)
      expect(formatPriceSpy).to.have.callCount(1)
      expect(calculateLTDPriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
    })

    it('throws an error on unknown product type', () => {
      const unknownProduct = { type: 'vision' }

      expect(() =>
        pricing.calculateProductPrice(unknownProduct, {}, {})
      ).to.throw('Unknown product type: vision')
    })
  })
})
