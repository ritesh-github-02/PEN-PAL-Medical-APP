import QuestionnaireEngine from '@/components/questionnaire/QuestionnaireEngine';

export default function InterventionFlowPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <QuestionnaireEngine />
      </div>
    </div>
  );
}
