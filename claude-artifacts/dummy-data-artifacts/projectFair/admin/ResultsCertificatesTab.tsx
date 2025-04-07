import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  Edit, 
  Mail, 
  Printer, 
  ExternalLink, 
  EyeOff, 
  Eye, 
  Check, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

const ResultsCertificatesTab = () => {
  const [publishedResults, setPublishedResults] = useState(false);
  const [activeTab, setActiveTab] = useState('department');
  
  // Sample department-level winners
  const departmentWinners = [
    {
      department: 'Computer Engineering',
      winners: [
        { rank: 1, projectId: 'NPNI-2025-0042', title: 'Smart Waste Management System', team: 'Team Innovate', score: 92 },
        { rank: 2, projectId: 'NPNI-2025-0018', title: 'AI-Based Attendance System', team: 'CodeCrafters', score: 89 },
        { rank: 3, projectId: 'NPNI-2025-0027', title: 'Student Performance Analytics', team: 'DataMinds', score: 85 }
      ]
    },
    {
      department: 'Electrical Engineering',
      winners: [
        { rank: 1, projectId: 'NPNI-2025-0056', title: 'Solar Powered Water Purifier', team: 'EcoSolutions', score: 94 },
        { rank: 2, projectId: 'NPNI-2025-0031', title: 'Smart Energy Monitor', team: 'PowerTech', score: 88 },
        { rank: 3, projectId: 'NPNI-2025-0047', title: 'Automatic Street Light System', team: 'LightWay', score: 83 }
      ]
    },
    {
      department: 'Civil Engineering',
      winners: [
        { rank: 1, projectId: 'NPNI-2025-0073', title: 'Structural Health Monitoring Device', team: 'BuildTech', score: 91 },
        { rank: 2, projectId: 'NPNI-2025-0081', title: 'Earthquake Resistant Model', team: 'StrongBase', score: 87 },
        { rank: 3, projectId: 'NPNI-2025-0092', title: 'Sustainable Building Materials', team: 'GreenBuilders', score: 82 }
      ]
    }
  ];

  // Sample central-level winners
  const centralWinners = [
    { rank: 1, projectId: 'NPNI-2025-0056', title: 'Solar Powered Water Purifier', team: 'EcoSolutions', department: 'Electrical Engineering', score: 96 },
    { rank: 2, projectId: 'NPNI-2025-0042', title: 'Smart Waste Management System', team: 'Team Innovate', department: 'Computer Engineering', score: 93 },
    { rank: 3, projectId: 'NPNI-2025-0073', title: 'Structural Health Monitoring Device', team: 'BuildTech', department: 'Civil Engineering', score: 89 }
  ];
  
  // Sample certificate stats
  const certificateStats = {
    participation: { total: 42, generated: 42, downloaded: 38, emailSent: 42 },
    departmentWinners: { total: 15, generated: 15, downloaded: 12, emailSent: 15 },
    instituteWinners: { total: 3, generated: 3, downloaded: 3, emailSent: 3 }
  };
  
  const toggleResultPublish = () => {
    setPublishedResults(!publishedResults);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Results & Certificates</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              publishedResults 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
            onClick={toggleResultPublish}
          >
            {publishedResults ? (
              <>
                <EyeOff size={16} className="mr-1" />
                Unpublish Results
              </>
            ) : (
              <>
                <Eye size={16} className="mr-1" />
                Publish Results
              </>
            )}
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center">
            <Mail size={16} className="mr-1" />
            Email Certificates
          </button>
          <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center">
            <Download size={16} className="mr-1" />
            Download All
          </button>
        </div>
      </div>
      
      {/* Publish Status */}
      <div className={`p-4 mb-6 rounded-lg flex items-center ${
        publishedResults ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        {publishedResults ? (
          <>
            <CheckCircle size={24} className="text-green-600 mr-3" />
            <div>
              <div className="font-medium text-green-800">Results Published</div>
              <div className="text-sm text-green-700">
                Results are now visible to all students and faculty members. They can view their standings and download certificates.
              </div>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle size={24} className="text-yellow-600 mr-3" />
            <div>
              <div className="font-medium text-yellow-800">Results Not Published</div>
              <div className="text-sm text-yellow-700">
                Results are currently visible only to administrators. Click "Publish Results" to make them visible to all participants.
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Results Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'department'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('department')}
            >
              Department-Level Results
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'central'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('central')}
            >
              Institute-Level Results
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'certificates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('certificates')}
            >
              Certificate Management
            </button>
          </nav>
        </div>
      </div>
      
      {/* Department Results Tab */}
      {activeTab === 'department' && (
        <div>
          {departmentWinners.map((dept, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <h4 className="text-md font-medium text-gray-800 mb-4">
                {dept.department} - Top Projects
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dept.winners.map((winner) => (
                  <div 
                    key={winner.rank}
                    className={`p-4 rounded-lg border ${
                      winner.rank === 1 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : winner.rank === 2 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        winner.rank === 1 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : winner.rank === 2 
                          ? 'bg-gray-200 text-gray-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Rank #{winner.rank}
                      </span>
                      <span className="font-bold text-lg">{winner.score}%</span>
                    </div>
                    <h5 className="font-medium mb-1">{winner.title}</h5>
                    <div className="text-sm text-gray-600 mb-2">
                      {winner.team} • {winner.projectId}
                    </div>
                    
                    <div className="flex justify-between mt-3">
                      <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                        <ExternalLink size={12} className="mr-1" />
                        View Project
                      </button>
                      <button className="text-xs text-green-600 hover:text-green-800 flex items-center">
                        <Download size={12} className="mr-1" />
                        Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Institute Results Tab */}
      {activeTab === 'central' && (
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">
            Institute-Level Winners
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {centralWinners.map((winner) => (
              <div 
                key={winner.rank}
                className={`p-6 rounded-lg border ${
                  winner.rank === 1 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : winner.rank === 2 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    winner.rank === 1 
                      ? 'bg-yellow-100' 
                      : winner.rank === 2 
                      ? 'bg-gray-200' 
                      : 'bg-amber-100'
                  }`}>
                    <Award size={32} className={
                      winner.rank === 1 
                        ? 'text-yellow-600' 
                        : winner.rank === 2 
                        ? 'text-gray-600' 
                        : 'text-amber-600'
                    } />
                  </div>
                </div>
                
                <div className="text-center mb-3">
                  <div className={`text-sm font-bold ${
                    winner.rank === 1 
                      ? 'text-yellow-800' 
                      : winner.rank === 2 
                      ? 'text-gray-800' 
                      : 'text-amber-800'
                  }`}>
                    {winner.rank === 1 ? '1st Prize' : winner.rank === 2 ? '2nd Prize' : '3rd Prize'}
                  </div>
                  <div className="font-bold text-xl mt-1">{winner.score}%</div>
                </div>
                
                <h5 className="font-medium text-center mb-1">{winner.title}</h5>
                <div className="text-sm text-gray-600 text-center mb-1">
                  {winner.team}
                </div>
                <div className="text-sm text-gray-500 text-center mb-4">
                  {winner.department}
                </div>
                
                <div className="flex justify-center space-x-2">
                  <button className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                    <ExternalLink size={12} className="mr-1" />
                    View
                  </button>
                  <button className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center">
                    <Download size={12} className="mr-1" />
                    Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <Info size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800">Prize Distribution Information</h5>
              <p className="text-sm text-blue-700 mt-1">
                Prize distribution will take place on April 15, 2025, at 3:00 PM in the Main Auditorium.
                All winners are requested to bring their ID cards and certificates.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Certificate Management Tab */}
      {activeTab === 'certificates' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">Participation Certificates</h5>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{certificateStats.participation.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-medium text-green-600">{certificateStats.participation.generated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Downloaded:</span>
                  <span className="font-medium">{certificateStats.participation.downloaded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email Sent:</span>
                  <span className="font-medium">{certificateStats.participation.emailSent}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                  <Mail size={12} className="mr-1" />
                  Email All
                </button>
                <button className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center">
                  <Download size={12} className="mr-1" />
                  Download All
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-3">Department Winner Certificates</h5>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Total:</span>
                  <span className="font-medium">{certificateStats.departmentWinners.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Generated:</span>
                  <span className="font-medium text-green-600">{certificateStats.departmentWinners.generated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Downloaded:</span>
                  <span className="font-medium">{certificateStats.departmentWinners.downloaded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Email Sent:</span>
                  <span className="font-medium">{certificateStats.departmentWinners.emailSent}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                  <Mail size={12} className="mr-1" />
                  Email All
                </button>
                <button className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center">
                  <Download size={12} className="mr-1" />
                  Download All
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-3">Institute Winner Certificates</h5>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Total:</span>
                  <span className="font-medium">{certificateStats.instituteWinners.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Generated:</span>
                  <span className="font-medium text-green-600">{certificateStats.instituteWinners.generated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Downloaded:</span>
                  <span className="font-medium">{certificateStats.instituteWinners.downloaded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Email Sent:</span>
                  <span className="font-medium">{certificateStats.instituteWinners.emailSent}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                  <Mail size={12} className="mr-1" />
                  Email All
                </button>
                <button className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center">
                  <Download size={12} className="mr-1" />
                  Download All
                </button>
              </div>
            </div>
          </div>
          
          {/* Certificate Template Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h4 className="font-medium text-lg mb-4">Certificate Template Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="bg-gray-100 h-40 mb-2 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Participation Certificate Preview</span>
                </div>
                <div className="flex justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Edit Template
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    Preview
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="bg-gray-100 h-40 mb-2 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Department Winner Certificate Preview</span>
                </div>
                <div className="flex justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Edit Template
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    Preview
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="bg-gray-100 h-40 mb-2 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Institute Winner Certificate Preview</span>
                </div>
                <div className="flex justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Edit Template
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Certificate Email Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-lg mb-4">Certificate Email Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  defaultValue="Your NPNI Project Fair 2025 Certificate"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  defaultValue="GP Palanpur Project Fair Team"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Template
                </label>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  defaultValue="Dear {participant_name},

Congratulations on your participation in the New Palanpur for New India Project Fair 2025! We are pleased to attach your {certificate_type} certificate.

Thank you for your contribution to making this event a success.

Best regards,
GP Palanpur Project Fair Team"
                ></textarea>
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Save Email Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsCertificatesTab;
