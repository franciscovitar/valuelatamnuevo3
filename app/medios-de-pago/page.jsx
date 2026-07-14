import { MarketingShell, PageBackLink, Payments } from '@/components/value-latam';
import { solutionPages } from '@/data/valueLatamContent';

export const metadata = {
  title: solutionPages.mediosDePago.title,
  description: solutionPages.mediosDePago.description,
};

export default function MediosDePagoPage() {
  return (
    <MarketingShell>
      <PageBackLink />
      <Payments />
    </MarketingShell>
  );
}
