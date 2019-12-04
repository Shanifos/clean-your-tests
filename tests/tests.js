const { expect } = require('chai')
const { describe, it } = require('mocha')
const employee = require('./employee')
const products = require('./products')
const pricing = require('../pricing')

describe('pricing', () => {
  describe('formatPrice', () => {
    it('return the price with 2 decimal places', () => {})
    let formatprice = pricing.formatPrice(33.323443)
    expect(formatprice).to.equal(33.32)
  })

  describe('getEmployerContribution', () => {
    it('return contribution if employee has contributed ', () => {
      const contributionMode = products.longTermDisability.employerContribution
      const price = 43.75
      const contribution = pricing.getEmployerContribution(
        contributionMode,
        price
      )
      expect(contribution).to.equal(10)
    })
    it('return contribution if employee has not contributed', () => {
      const contributionMode = products.voluntaryLife.employerContribution
      const price = 43.75
      const contribution = pricing.getEmployerContribution(
        contributionMode,
        price
      )
      expect(contribution).to.equal(4.375)
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
    it('return false if the role is not ee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ro'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }]
      }
      const LTDPrice = pricing.calculateLTDPrice(
        products.longTermDisability,
        employee,
        selectedOptions
      )
      expect(LTDPrice).to.equal(0)
    })
    it('return the price of ltd if the person role is ee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }]
      }
      const LTDPrice = pricing.calculateLTDPrice(
        products.longTermDisability,
        employee,
        selectedOptions
      )
      // console.log(products.voluntaryLife)

      expect(LTDPrice).to.equal(32.04)
    })
  })
  describe('calculateProductPrice', () => {
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
    })

    it('throws an error on unknown product type', () => {
      const unknownProduct = { type: 'vision' }

      expect(() =>
        pricing.calculateProductPrice(unknownProduct, {}, {})
      ).to.throw('Unknown product type: vision')
    })
  })
})
