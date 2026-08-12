import { redirect } from 'next/navigation';

export default function AddToCardRedirect() {
  redirect('/cart');
}
