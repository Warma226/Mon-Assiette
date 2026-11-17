'use client';
import { Empty, Page } from '@/components/ui';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Page>
      <div className="px-5 pt-16">
        <Empty title="Un souci est survenu" text="Vérifie ta connexion puis réessaie." action={<button type="button" onClick={reset} className="btn-violet h-11 text-sm">Réessayer</button>} />
      </div>
    </Page>
  );
}
