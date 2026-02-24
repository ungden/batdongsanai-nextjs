"use client";

import { useState, useMemo } from 'react';

export const useInvestmentCalculator = (initialValues = {}) => {
  const [pricePerSqm, setPricePerSqm] = useState(100000000);
  const [area, setArea] = useState(70);
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTerm, setLoanTerm] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [rentalYield, setRentalYield] = useState(4.5);
  const [appreciationRate, setAppreciationRate] = useState(5);
  const [maintenanceCost, setMaintenanceCost] = useState(1);

  const results = useMemo(() => {
    const totalPrice = pricePerSqm * area;
    const downPayment = totalPrice * (downPaymentPercent / 100);
    const loanAmount = totalPrice - downPayment;

    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
                          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    const annualRentalIncome = totalPrice * (rentalYield / 100);
    const monthlyRentalIncome = annualRentalIncome / 12;
    const annualMaintenanceCost = totalPrice * (maintenanceCost / 100);
    const monthlyMaintenanceCost = annualMaintenanceCost / 12;
    const netMonthlyRentalIncome = monthlyRentalIncome - monthlyMaintenanceCost;

    const monthlyCashFlow = netMonthlyRentalIncome - monthlyPayment;
    const isPositiveCashFlow = monthlyCashFlow > 0;

    const totalInvestment = downPayment;
    const annualNetIncome = (netMonthlyRentalIncome * 12) - (monthlyPayment * 12);
    const cashOnCashReturn = totalInvestment > 0 ? (annualNetIncome / totalInvestment) * 100 : 0;

    const futureValue5Years = totalPrice * Math.pow(1 + appreciationRate / 100, 5);
    const futureValue10Years = totalPrice * Math.pow(1 + appreciationRate / 100, 10);
    const futureValue20Years = totalPrice * Math.pow(1 + appreciationRate / 100, 20);

    const cashFlowProjection = Array.from({ length: 10 }, (_, i) => {
      const year = i + 1;
      const propertyValue = totalPrice * Math.pow(1 + appreciationRate / 100, year);
      const remainingBalance = year <= loanTerm ? loanAmount * Math.pow(1 + monthlyInterestRate, year * 12) -
                              monthlyPayment * (Math.pow(1 + monthlyInterestRate, year * 12) - 1) / monthlyInterestRate : 0;
      const equity = propertyValue - remainingBalance;
      const cumulativeRentalIncome = netMonthlyRentalIncome * 12 * year;
      const cumulativeLoanPayments = monthlyPayment * 12 * Math.min(year, loanTerm);

      return {
        year,
        propertyValue: Math.round(propertyValue),
        remainingBalance: Math.round(Math.max(0, remainingBalance)),
        equity: Math.round(equity),
        cumulativeCashFlow: Math.round(cumulativeRentalIncome - cumulativeLoanPayments),
      };
    });

    return {
      totalPrice,
      downPayment,
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalPayment,
      monthlyRentalIncome,
      monthlyMaintenanceCost,
      netMonthlyRentalIncome,
      monthlyCashFlow,
      isPositiveCashFlow,
      cashOnCashReturn,
      futureValue5Years,
      futureValue10Years,
      futureValue20Years,
      cashFlowProjection,
      numberOfPayments
    };
  }, [pricePerSqm, area, downPaymentPercent, loanTerm, interestRate, rentalYield, appreciationRate, maintenanceCost]);

  return {
    inputs: {
      pricePerSqm, setPricePerSqm,
      area, setArea,
      downPaymentPercent, setDownPaymentPercent,
      loanTerm, setLoanTerm,
      interestRate, setInterestRate,
      rentalYield, setRentalYield,
      appreciationRate, setAppreciationRate,
      maintenanceCost, setMaintenanceCost
    },
    results
  };
};