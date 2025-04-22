import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FeedbackReport from '../components/FeedbackReport';
import type { AnalysisResult } from '../@types/feedback';

const FeedbackReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/feedback/report/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Report data:', data); // For debugging
        if (!data) {
          throw new Error('No report data received');
        }
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading report...</div>
      </div>
    );
  }

  return <FeedbackReport analysisResult={report} />;
};

export default FeedbackReportPage;
