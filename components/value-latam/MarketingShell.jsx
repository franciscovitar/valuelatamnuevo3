import BackgroundCanvas from './BackgroundCanvas';
import Footer from './Footer';
import Header from './Header';
import SoundToggle from './SoundToggle';
import ValueLatamRuntime from './ValueLatamRuntime';

export default function MarketingShell({ children }) {
  return (
    <>
      <BackgroundCanvas />
      <Header />
      <main>{children}</main>
      <Footer />
      <SoundToggle />
      <ValueLatamRuntime />
    </>
  );
}
