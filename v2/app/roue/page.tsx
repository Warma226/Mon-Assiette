import { redirect } from 'next/navigation';

// La roue (tirage au hasard) a été retirée : les suggestions suivent l'équilibre de la journée.
export default function Roue() {
  redirect('/');
}
