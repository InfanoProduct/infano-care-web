'use client';

import BookForm from '../../books/components/BookForm';

export default function NewWebinarPage() {
  return (
    <div className="pb-20">
      <BookForm isWebinar={true} />
    </div>
  );
}
