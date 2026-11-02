import TrainingRegistrationForm from './registration-form';

export default async function TrainingRegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const params = await searchParams;
  return <TrainingRegistrationForm courseId={params.course} />;
}
