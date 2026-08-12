import { redirect } from 'next/navigation';

export default function ProductUpdateRedirect() {
  redirect('/admin/products');
}
