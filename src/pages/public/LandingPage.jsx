import React from 'react';
import HeroSection from '../../components/sections/HeroSection';
import CryptoMarquee from '../../components/sections/CryptoMarquee';
import InvestmentPhilosophy from '../../components/sections/InvestmentPhilosophy';
import SecuritySection from '../../components/sections/SecuritySection';
import InvestmentPlans from '../../components/sections/InvestmentPlans';
import TrackRecord from '../../components/sections/TrackRecord';
import Testimonials from '../../components/sections/Testimonials';
import CTASection from '../../components/sections/CTASection';

const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <CryptoMarquee />
      <InvestmentPhilosophy />
      <SecuritySection />
      <InvestmentPlans />
      <TrackRecord />
      <Testimonials />
      <CTASection />
    </>
  );
};

export default LandingPage;