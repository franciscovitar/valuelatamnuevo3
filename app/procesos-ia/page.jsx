import { AIProcesses, MarketingShell, PageBackLink } from '@/components/value-latam';
import { solutionPages } from '@/data/valueLatamContent';

export const metadata = {
  title: solutionPages.procesosIa.title,
  description: solutionPages.procesosIa.description,
};

export default function ProcesosIaPage() {
  return (
    <MarketingShell>
      <PageBackLink />
      <AIProcesses />
    </MarketingShell>
  );
}
