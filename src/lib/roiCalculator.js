// src/lib/roiCalculator.js

/**
 * SHARED DATE COMPONENT
 * Calculates the number of full days passed since the plan started.
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

// Starter Plan: 20% Daily[cite: 2]
export const calculateStarterROI = (depositValue, days) => {
    return depositValue * 0.20 * days;
};

// Growth Plan: 40% Daily[cite: 2]
export const calculateGrowthROI = (depositValue, days) => {
    return depositValue * 0.40 * days;
};

// Elite Plan: 60% Daily[cite: 2]
export const calculateEliteROI = (depositValue, days) => {
    return depositValue * 0.60 * days;
};

// Supreme Plan: 80% Daily[cite: 2]
export const calculateSupremeROI = (depositValue, days) => {
    return depositValue * 0.80 * days;
};

/**
 * MASTER ROUTER
 * Routes the user to the correct calculation based on their active plan.
 */
export const calculateTotalROI = (depositValue, plan, startDate) => {
    const days = calculateDaysActive(startDate);
    
    switch (plan?.toLowerCase()) {
        case 'starter': return calculateStarterROI(depositValue, days);
        case 'growth': return calculateGrowthROI(depositValue, days);
        case 'elite': return calculateEliteROI(depositValue, days);
        case 'supreme': return calculateSupremeROI(depositValue, days);
        default: return 0;
    }
};