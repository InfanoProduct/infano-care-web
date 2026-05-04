'use client';

import { useParams } from 'next/navigation';
import BookForm from '../../components/BookForm';

export default function EditBookPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="pb-20">
      <BookForm bookId={id} />
    </div>
  );
}
