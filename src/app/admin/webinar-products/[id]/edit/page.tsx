'use client';

import { useParams } from 'next/navigation';
import WebinarForm from '../../components/WebinarForm';

export default function EditWebinarPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="pb-20">
      <WebinarForm webinarId={id} />
    </div>
  );
}
