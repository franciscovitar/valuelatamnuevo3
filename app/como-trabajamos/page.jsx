import { MarketingShell, PageBackLink, Process } from '@/components/value-latam';
import { solutionPages } from '@/data/valueLatamContent';

export const metadata = {
  title: solutionPages.comoTrabajamos.title,
  description: solutionPages.comoTrabajamos.description,
};

export default function ComoTrabajamosPage() {
  return (
    <MarketingShell>
      <PageBackLink />
      <Process />
    </MarketingShell>
  );
}
