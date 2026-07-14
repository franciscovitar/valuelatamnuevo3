import BackgroundCanvas from './BackgroundCanvas';
import Footer from './Footer';
import Header from './Header';
import InternalScrollExperience from '../scroll/InternalScrollExperience';
import SoundToggle from './SoundToggle';
import ValueLatamRuntime from './ValueLatamRuntime';

export default function MarketingShell({ children }) {
  return (
    <>
      <BackgroundCanvas />
      <Header />
      <main>{children}</main>
      <InternalScrollExperience />
      <Footer />
      <SoundToggle />
      <ValueLatamRuntime />
    </>
  );
}
