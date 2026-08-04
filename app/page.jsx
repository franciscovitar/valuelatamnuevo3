import HomeScrollExperience from '@/components/scroll/HomeScrollExperience';
import {
  BackgroundCanvas,
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
  CityVideo,
  // ImageHero retained for rollback:
  // ImageHero,
  WhyUs,
  WorkWithUsTeaser,
} from '@/components/value-latam';

export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <main>
        <BackgroundCanvas />
        {/* Legacy Hero retained for rollback:
        <CoverStory />
        */}
        <VideoHero />
        <Metrics />
        {/* <CityVideo /> */}
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
