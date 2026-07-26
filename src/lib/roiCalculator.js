// src/lib/roiCalculator.js

/**
 * SHARED DATE COMPONENT
 * Calculates the number of full days passed since the current plan started.
 */
export const calculateDaysActive = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    
    // Calculate the difference in milliseconds
    const diffTime = today.getTime() - start.getTime();
    
    // Convert to full days (ignoring partial days)
    const daysPassed = Math.floor(diffTime / (1000 * 3600 * 24));
    return daysPassed > 0 ? daysPassed : 0;
};

/**
 * 4 PLAN FUNCTIONS
 * Each function takes the total approved deposit and the days passed, 
 * returning the accrued ROI based on InvestmentPlans.jsx percentages.
 */

// Starter Plan: 20% Daily
export const calculateStarterROI = (depositValue, days) => {
    return depositValue * 0.20 * days;
};

// Growth Plan: 40% Daily
export const calculateGrowthROI = (depositValue, days) => {
    return depositValue * 0.40 * days;
};

// Elite Plan: 60% Daily
export const calculateEliteROI = (depositValue, days) => {
    return depositValue * 0.60 * days;
};

// Supreme Plan: 80% Daily
export const calculateSupremeROI = (depositValue, days) => {
    return depositValue * 0.80 * days;
};

/**
 * MASTER ROUTER
 * Routes the user to the correct calculation based on their active plan.
 * Now adds previously accumulated ROI and Days.
 */
export const calculateTotalROI = (depositValue, plan, startDate, accumulatedROI = 0) => {
    const currentDays = calculateDaysActive(startDate);
    
    let currentROI = 0;
    switch (plan?.toLowerCase()) {
        case 'starter': currentROI = calculateStarterROI(depositValue, currentDays); break;
        case 'growth': currentROI = calculateGrowthROI(depositValue, currentDays); break;
        case 'elite': currentROI = calculateEliteROI(depositValue, currentDays); break;
        case 'supreme': currentROI = calculateSupremeROI(depositValue, currentDays); break;
        default: currentROI = 0;
    }

    // Add historical ROI to the newly accruing ROI
    return currentROI + Number(accumulatedROI);
};

/**
 * HELPER: TOTAL DAYS
 * Returns the total days active across all historical plans.
 */
export const calculateTotalDaysActive = (startDate, accumulatedDays = 0) => {
    return calculateDaysActive(startDate) + Number(accumulatedDays);
};