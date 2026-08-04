import TrionnLinesLab from '@/components/line-lab/TrionnLinesLab';
import '../styles/line-lab/_line-lab.scss';

export const metadata = {
  title: 'Line Lab — TRIONN prototype',
  robots: { index: false, follow: false },
};

export default function LineLabPage() {
  return <TrionnLinesLab />;
}
