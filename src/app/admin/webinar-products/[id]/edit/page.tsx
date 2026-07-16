'use client';

import { useParams } from 'next/navigation';
import BookForm from '../../../books/components/BookForm';

export default function EditWebinarPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="pb-20">
      <BookForm bookId={id} isWebinar={true} />
    </div>
  );
}
