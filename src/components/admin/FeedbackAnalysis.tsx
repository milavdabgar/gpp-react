import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../config/axios';

interface AnalyzeResponse {
    success: boolean;
    reportId: string;
    result: any;
}

const FeedbackAnalysis: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const response = await axios.post<AnalyzeResponse>('/api/feedback/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { reportId } = response.data;
            // Navigate to the report view
            console.log('Analysis response:', response.data); // For debugging
            window.location.href = `/admin/feedback-analysis/report/${reportId}`;

            toast.success('Feedback analysis completed successfully!');
        } catch (error) {
            console.error('Error analyzing feedback:', error);
            toast.error('Error analyzing feedback. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadSample = async () => {
        try {
            const response = await axios.get('/api/feedback/sample', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample_feedback.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading sample:', error);
            toast.error('Error downloading sample file. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Feedback Analysis</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Upload Feedback Data</h3>
                    <p className="text-gray-600 mb-4">
                        Upload a CSV file containing feedback responses. The file should follow the required format.
                        You can download a sample file to see the expected format.
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <button
                            onClick={downloadSample}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                            <Download size={20} />
                            Download Sample
                        </button>
                        
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                            <Upload size={20} />
                            {isUploading ? 'Analyzing...' : 'Upload & Analyze'}
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>The CSV file should contain feedback responses for all subjects</li>
                        <li>Required columns: Year, Term, Branch, Sem, Subject_Code, Subject_FullName, Faculty_Name, Q1-Q12</li>
                        <li>Each row represents a single feedback response</li>
                        <li>Questions (Q1-Q12) should have numeric ratings</li>
                        <li>The analysis will generate reports in both JSON and CSV formats</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FeedbackAnalysis;
