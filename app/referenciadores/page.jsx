import { MarketingShell, PageBackLink, WorkWithUs } from '@/components/value-latam';
import { solutionPages } from '@/data/valueLatamContent';

export const metadata = {
  title: solutionPages.referenciadores.title,
  description: solutionPages.referenciadores.description,
};

export default function ReferenciadoresPage() {
  return (
    <MarketingShell>
      <PageBackLink />
      <WorkWithUs />
    </MarketingShell>
  );
}
