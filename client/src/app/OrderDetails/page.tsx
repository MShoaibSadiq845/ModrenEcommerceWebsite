import { redirect } from 'next/navigation';

export default function OrderDetailsRedirect() {
  redirect('/admin/orders');
}
