import { redirect } from 'next/navigation';

export default function AdminProductsNewRedirect() {
  redirect('/admin/products/add');
}
