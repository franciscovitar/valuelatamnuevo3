import { Liquidity, MarketingShell, PageBackLink } from '@/components/value-latam';
import { solutionPages } from '@/data/valueLatamContent';

export const metadata = {
  title: solutionPages.liquidez.title,
  description: solutionPages.liquidez.description,
};

export default function LiquidezPage() {
  return (
    <MarketingShell>
      <PageBackLink />
      <Liquidity />
    </MarketingShell>
  );
}
