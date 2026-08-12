import { redirect } from 'next/navigation';

export default function AllProductRedirect() {
  redirect('/admin/products');
}
