'use client';

import dynamic from 'next/dynamic';

const PipelineBuilder = dynamic(() => import('../../components/pipeline-builder-wrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white">Loading Pipeline Builder...</div>
    </div>
  )
});

export default function PipelineBuilderPage() {
  return <PipelineBuilder />;
}