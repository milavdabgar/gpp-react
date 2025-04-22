import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import type { AnalysisResult, BranchScore, FacultyScore, SubjectScore } from '../../@types/feedback';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FeedbackReportProps {
  analysisResult: AnalysisResult;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ analysisResult }) => {
  const downloadReport = async (type: string, retryCount = 0): Promise<void> => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      const response = await fetch(`/api/feedback/download/${type}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback_report_${type}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading report (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying download in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return downloadReport(type, retryCount + 1);
      }

      // Show error to user after all retries fail
      alert(`Failed to download report after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Student Feedback Analysis Report</h1>
        <h2 className="text-xl text-gray-600">EC Dept, Government Polytechnic Palanpur</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Branch-wise Performance</h3>
          <Bar
            data={{
              labels: analysisResult.branch_scores.map((b: BranchScore) => b.Branch),
              datasets: [{
                label: 'Overall Score',
                data: analysisResult.branch_scores.map((b: BranchScore) => b.Score),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 5
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Faculty Performance</h3>
          <Radar
            data={{
              labels: Array.from({length: 12}, (_, i) => `Q${i+1}`),
              datasets: analysisResult.faculty_scores.map((f: FacultyScore) => ({
                label: f.Faculty_Initial,
                data: Array.from({length: 12}, (_, i) => f[`Q${i+1}`]),
                fill: true,
                backgroundColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.2)`,
                borderColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 1)`
              }))
            }}
            options={{
              responsive: true,
              scales: {
                r: {
                  min: 0,
                  max: 5
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
          <Bar
            data={{
              labels: analysisResult.subject_scores.map((s: SubjectScore) => s.Subject_ShortForm || s.Subject_Code),
              datasets: [{
                label: 'Overall Score',
                data: analysisResult.subject_scores.map((s: SubjectScore) => s.Score),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 5
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Parameter-wise Analysis</h3>
          <Line
            data={{
              labels: Array.from({length: 12}, (_, i) => `Q${i+1}`),
              datasets: [{
                label: 'Average Score',
                data: Array.from({length: 12}, (_, i) => {
                  const scores = analysisResult.subject_scores.map((s: SubjectScore) => s[`Q${i+1}`] as number);
                  return scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
                }),
                fill: false,
                borderColor: 'rgba(153, 102, 255, 1)',
                tension: 0.1
              }]
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 5
                }
              }
            }}
          />
        </div>
      </div>

      <div className="mt-10 text-center">
        <h3 className="text-lg font-semibold mb-4">Download Reports</h3>
        <div className="space-x-4">
          <button
            onClick={() => downloadReport('wkhtml')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download PDF (wkhtmltopdf)
          </button>
          <button
            onClick={() => downloadReport('latex')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download PDF (LaTeX)
          </button>
          <button
            onClick={() => downloadReport('puppeteer')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download PDF (Puppeteer)
          </button>
          <button
            onClick={() => downloadReport('excel')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
