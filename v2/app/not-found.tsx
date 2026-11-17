import Link from 'next/link';
import { Empty, Page } from '@/components/ui';

export default function NotFound() {
  return (
    <Page>
      <div className="px-5 pt-16">
        <Empty title="Page introuvable" text="Ce plat ou cette page n’existe pas, ou n’est plus publié." action={<Link href="/" className="btn-violet h-11 text-sm">Retour à l’accueil</Link>} />
      </div>
    </Page>
  );
}
