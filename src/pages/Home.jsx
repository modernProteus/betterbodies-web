import React, { useState } from "react";
import Navbar from "../components/homepage/Navbar";
import HeroSection from "../components/homepage/HeroSection";
import TrustStrip from "../components/homepage/TrustStrip";
import ServicesCards from "../components/homepage/ServicesCards";
import MovementStrip from "../components/homepage/MovementStrip";
import UpcomingClasses from "../components/homepage/UpcomingClasses";
import AboutSection from "../components/homepage/AboutSection";
import CertificationsSection from "../components/homepage/CertificationsSection";
import WhoWeServe from "../components/homepage/WhoWeServe";
import Testimonials from "../components/homepage/Testimonials";
import UrgencyCTA from "../components/homepage/UrgencyCTA";
import FAQSection from "../components/homepage/FAQSection";
import WellnessResources from "../components/homepage/WellnessResources";
import CommunityResource from "../components/homepage/CommunityResource";
import ContactForm from "../components/homepage/ContactForm";
import FooterCTA from "../components/homepage/FooterCTA";
import StickyBookingBar from "../components/homepage/StickyBookingBar";
import TrainingRequestModal from "../components/homepage/TrainingRequestModal";
import useScrollReveal from "../hooks/useScrollReveal";

const HERO_IMAGE = `${
  import.meta.env.BASE_URL
}assets/images/placeholders/cpr.jpg`;

export default function Home() {
  useScrollReveal();

  const [trainingRequest, setTrainingRequest] = useState({
    open: false,
    context: {},
  });

  const openTrainingRequest = (context = {}) => {
    setTrainingRequest({
      open: true,
      context,
    });
  };

  const closeTrainingRequest = () => {
    setTrainingRequest({
      open: false,
      context: {},
    });
  };

  return (
    <>
      <Navbar onRequestTraining={openTrainingRequest} />

      <HeroSection
        heroImage={HERO_IMAGE}
        onRequestTraining={openTrainingRequest}
      />

      <TrustStrip />

      <div id="services">
        <ServicesCards onRequestTraining={openTrainingRequest} />
      </div>

      <MovementStrip />

      <UpcomingClasses onRequestTraining={openTrainingRequest} />

      <AboutSection />

      <CertificationsSection />

      <WhoWeServe />

      <Testimonials />

      <UrgencyCTA onRequestTraining={openTrainingRequest} />

      <FAQSection />

      <WellnessResources onRequestTraining={openTrainingRequest} />

      <CommunityResource />

      <ContactForm />

      <FooterCTA onRequestTraining={openTrainingRequest} />

      <StickyBookingBar onRequestTraining={openTrainingRequest} />

      <TrainingRequestModal
        open={trainingRequest.open}
        context={trainingRequest.context}
        onClose={closeTrainingRequest}
      />
    </>
  );
}
