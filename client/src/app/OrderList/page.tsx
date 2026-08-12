import { redirect } from 'next/navigation';

export default function OrderListRedirect() {
  redirect('/admin/orders');
}
