import HomeScrollExperience from '@/components/scroll/HomeScrollExperience';
import {
  BackgroundCanvas,
  Contact,
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
} from '@/components/value-latam';

const SHOW_BACKGROUND_LINES = true;

export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <main>
        {SHOW_BACKGROUND_LINES && <BackgroundCanvas />}
        <VideoHero />
        <Metrics />
        <PartnerLogos />
        <Solutions />
        <WhyUs />
        <Process />
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
