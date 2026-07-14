import HomeScrollExperience from '@/components/scroll/HomeScrollExperience';
import {
  Contact,
  CoverStory,
  Footer,
  Header,
  Intro,
  Metrics,
  PartnerLogos,
  Process,
  Regulation,
  Solutions,
  SoundToggle,
  StructuredData,
  Team,
  ValueLatamRuntime,
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
        {/* <CoverStory /> */}
        <Intro />
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
