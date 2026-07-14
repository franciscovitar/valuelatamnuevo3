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
        <CoverStory />
        <Intro />
        <Metrics />
        <PartnerLogos />
        <Solutions />
        <Process compact />
        <WhyUs />
        <Regulation />
        <Team />
        <WorkWithUsTeaser />
        <Contact />
      </main>
      <Footer />
      <SoundToggle />
      <ValueLatamRuntime />
    </>
  );
}
