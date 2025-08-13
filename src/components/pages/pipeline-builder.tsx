import dynamic from 'next/dynamic';

// Dynamically import the PipelineBuilder to avoid SSR issues with ReactFlow
const PipelineBuilderComponent = dynamic(
  () => import('../pipeline-builder-client'),
  { ssr: false }
);

export default function PipelineBuilder() {
  return <PipelineBuilderComponent />;
}