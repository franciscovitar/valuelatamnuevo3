import HomeScrollExperience from '@/components/scroll/HomeScrollExperience';
import {
  Contact,
  // Legacy Hero retained for rollback:
  // CoverStory,
  Footer,
  Header,
  Metrics,
  PartnerLogos,
  Process,
  Regulation,
  Solutions,
  SoundToggle,
  StructuredData,
  Team,
  ValueLatamRuntime,
  VideoHero,
  WhyUs,
  WorkWithUsTeaser,
  BackgroundCanvas,
} from '@/components/value-latam';

export default function Home() {
  return (
    <>
      <StructuredData />
      <BackgroundCanvas />
      <Header />
      <main>
        {/* Legacy Hero retained for rollback:
        <CoverStory />
        */}
        <VideoHero />
        <Metrics />
        <PartnerLogos />
        <Solutions />
        <WhyUs />
        <Process compact />
        <Regulation />
        <Team />
        <WorkWithUsTeaser />
        <Contact />
        <HomeScrollExperience />
      </main>
      <Footer />
      <SoundToggle />
      <ValueLatamRuntime />
    </>
  );
}
