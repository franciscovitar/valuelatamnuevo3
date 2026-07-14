import {
  AIProcesses,
  Financing,
  Liquidity,
  MarketingShell,
  PageBackLink,
  Payments,
  WorkWithUs,
} from '@/components/value-latam';
import { solutionPages } from '@/data/valueLatamContent';

export const metadata = {
  title: solutionPages.financiamiento.title,
  description: solutionPages.financiamiento.description,
};

export default function FinanciamientoPage() {
  return (
    <MarketingShell>
      <PageBackLink />
      <Financing />
    </MarketingShell>
  );
}
