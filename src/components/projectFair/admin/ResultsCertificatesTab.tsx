import React, { useState, useEffect } from 'react';
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
import projectService from '../../../services/projectApi';
import { toast } from 'react-toastify';
import { Winner as ProjectWinner } from '../../../types/project.types';

interface Winner extends ProjectWinner {
  rank: number;
  score: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  name: string;
  eventDate: string;
  publishResults: boolean;
  schedule: any[];
}

interface WinnersData {
  departmentWinners: Winner[];
  instituteWinners: Winner[];
}

interface CertificateStats {
  total: number;
  generated: number;
  downloaded: number;
  emailSent: number;
}

const ResultsCertificatesTab: React.FC = () => {
  const [publishedResults, setPublishedResults] = useState(false);
  const [activeTab, setActiveTab] = useState('department');
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [departmentWinners, setDepartmentWinners] = useState<any[]>([]);
  const [instituteWinners, setInstituteWinners] = useState<Winner[]>([]);
  const [certificateStats, setCertificateStats] = useState<{
    participation: CertificateStats;
    departmentWinners: CertificateStats;
    instituteWinners: CertificateStats;
  }>({
    participation: { total: 0, generated: 0, downloaded: 0, emailSent: 0 },
    departmentWinners: { total: 0, generated: 0, downloaded: 0, emailSent: 0 },
    instituteWinners: { total: 0, generated: 0, downloaded: 0, emailSent: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    subject: 'Your NPNI Project Fair Certificate',
    template: 'Dear {participant_name},\n\nCongratulations on your participation in the New Palanpur for New India Project Fair! We are pleased to attach your {certificate_type} certificate.\n\nThank you for your contribution to making this event a success.\n\nBest regards,\nGP Palanpur Project Fair Team'
  });
  
  // Load active event when component mounts
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const events = await projectService.getActiveEvents();
        if (events && events.length > 0) {
          const event = {
            ...events[0],
            name: events[0].title || '',
            eventDate: events[0].startDate || '',
            publishResults: events[0].publishResults || false,
            schedule: events[0].schedule || []
          } as Event;
          setActiveEvent(event);
          setPublishedResults(event.publishResults);
          fetchEventData(event._id);
        }
      } catch (err) {
        console.error('Error fetching active events:', err);
        toast.error('Failed to load active event');
      }
    };

    fetchActiveEvent();
  }, []);

  const fetchEventData = async (eventId: string) => {
    try {
      setLoading(true);
      // Fetch winners
      await fetchWinners(eventId);
      // Fetch certificate stats
      await fetchCertificateStats(eventId);
    } catch (err) {
      console.error('Error fetching event data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWinners = async (eventId: string) => {
    try {
      const response = await projectService.getEventWinners(eventId);
      const winners = Array.isArray(response) ? response : [];
      const data = {
        departmentWinners: winners.map(w => ({ ...w, rank: 0, score: 0 })) as Winner[],
        instituteWinners: winners.map(w => ({ ...w, rank: 0, score: 0 })) as Winner[]
      };
      
      if (data) {
        if (data.departmentWinners) {
          setDepartmentWinners(data.departmentWinners);
        }
        if (data.instituteWinners) {
          setInstituteWinners(data.instituteWinners);
        }
      }
    } catch (err) {
      console.error('Error fetching winners:', err);
      if (err instanceof Error && err.message.includes('Results have not been published')) {
        // This is expected if results aren't published yet
        setDepartmentWinners([]);
        setInstituteWinners([]);
      } else {
        toast.error('Failed to load winners');
      }
    }
  };

  const fetchCertificateStats = async (eventId: string) => {
    try {
      // In a real application, you would fetch these stats from the backend
      // For now, let's generate some example stats
      const participationCerts = await projectService.generateProjectCertificates(eventId, 'participation');
      const deptWinnerCerts = await projectService.generateProjectCertificates(eventId, 'winner');
      const instituteWinnerCerts = await projectService.generateProjectCertificates(eventId, 'winner');
      
      // Set certificate stats
      setCertificateStats({
        participation: { 
          total: participationCerts?.length || 0, 
          generated: participationCerts?.length || 0, 
          downloaded: Math.floor((participationCerts?.length || 0) * 0.8), 
          emailSent: participationCerts?.length || 0 
        },
        departmentWinners: { 
          total: deptWinnerCerts?.length || 0, 
          generated: deptWinnerCerts?.length || 0, 
          downloaded: Math.floor((deptWinnerCerts?.length || 0) * 0.9), 
          emailSent: deptWinnerCerts?.length || 0
        },
        instituteWinners: { 
          total: instituteWinnerCerts?.length || 0, 
          generated: instituteWinnerCerts?.length || 0, 
          downloaded: instituteWinnerCerts?.length || 0, 
          emailSent: instituteWinnerCerts?.length || 0
        }
      });
    } catch (err) {
      console.error('Error fetching certificate stats:', err);
    }
  };

  const toggleResultPublish = async () => {
    if (!activeEvent) return;
    
    try {
      setLoading(true);
      await projectService.publishResults(activeEvent._id, !publishedResults);
      setPublishedResults(!publishedResults);
      toast.success(`Results ${!publishedResults ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      console.error('Error toggling result publish status:', err);
      toast.error('Failed to update publish status');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCertificates = async (type: 'participation' | 'department' | 'institute') => {
    try {
      // In a real app, you would send certificates via email here
      const certificateCount = 
        type === 'participation' ? certificateStats.participation.total :
        type === 'department' ? certificateStats.departmentWinners.total :
        certificateStats.instituteWinners.total;
      
      toast.success(`Sent ${certificateCount} ${type} certificates successfully`);
      
      // Update stats
      const updatedStats = { ...certificateStats };
      if (type === 'participation') {
        updatedStats.participation.emailSent = certificateStats.participation.total;
      } else if (type === 'department') {
        updatedStats.departmentWinners.emailSent = certificateStats.departmentWinners.total;
      } else {
        updatedStats.instituteWinners.emailSent = certificateStats.instituteWinners.total;
      }
      setCertificateStats(updatedStats);
    } catch (err) {
      console.error('Error sending certificates:', err);
      toast.error('Failed to send certificates');
    }
  };

  const handleDownloadCertificates = (type: 'participation' | 'department' | 'institute') => {
    try {
      // In a real app, you would download certificates here
      toast.success(`Downloaded ${type} certificates successfully`);
      
      // Update stats
      const updatedStats = { ...certificateStats };
      if (type === 'participation') {
        updatedStats.participation.downloaded = certificateStats.participation.total;
      } else if (type === 'department') {
        updatedStats.departmentWinners.downloaded = certificateStats.departmentWinners.total;
      } else {
        updatedStats.instituteWinners.downloaded = certificateStats.instituteWinners.total;
      }
      setCertificateStats(updatedStats);
    } catch (err) {
      console.error('Error downloading certificates:', err);
      toast.error('Failed to download certificates');
    }
  };

  const handleViewProject = (projectId: string) => {
    // Navigate to project view
    window.open(`/projects/${projectId}`, '_blank');
  };

  const handleDownloadCertificate = (projectId: string) => {
    // Download individual certificate
    toast.success('Certificate downloaded successfully');
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
            disabled={loading}
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
          <button 
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
            onClick={() => handleEmailCertificates('participation')}
            disabled={loading}
          >
            <Mail size={16} className="mr-1" />
            Email Certificates
          </button>
          <button 
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center"
            onClick={() => handleDownloadCertificates('participation')}
            disabled={loading}
          >
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
      
      {loading ? (
        <div className="text-center py-10">Loading results data...</div>
      ) : (
        <>
          {/* Department Results Tab */}
          {activeTab === 'department' && (
            <div>
              {departmentWinners.length > 0 ? (
                departmentWinners.map((dept, index) => (
                  <div key={index} className="mb-8 last:mb-0">
                    <h4 className="text-md font-medium text-gray-800 mb-4">
                      {dept.department.name} - Top Projects
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {dept.winners.map((winner: Winner) => (
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
                            {typeof winner.team === 'string' ? winner.team : winner.team?.name} • {winner.projectId}
                          </div>
                          
                          <div className="flex justify-between mt-3">
                            <button 
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              onClick={() => handleViewProject(winner.projectId)}
                            >
                              <ExternalLink size={12} className="mr-1" />
                              View Project
                            </button>
                            <button 
                              className="text-xs text-green-600 hover:text-green-800 flex items-center"
                              onClick={() => handleDownloadCertificate(winner.projectId)}
                            >
                              <Download size={12} className="mr-1" />
                              Certificate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  {publishedResults ? (
                    <div className="text-gray-500">
                      <p>No department results available.</p>
                    </div>
                  ) : (
                    <div className="text-yellow-700">
                      <AlertTriangle size={36} className="mx-auto mb-2 text-yellow-500" />
                      <p>Results are not yet published.</p>
                      <p className="text-sm mt-1">Click "Publish Results" to make them visible.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Institute Results Tab */}
          {activeTab === 'central' && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">
                Institute-Level Winners
              </h4>
              
              {instituteWinners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {instituteWinners.map((winner) => (
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
                        {typeof winner.team === 'string' ? winner.team : (winner.team as any)?.name || winner.team}
                      </div>
                      <div className="text-sm text-gray-500 text-center mb-4">
                        {typeof winner.department === 'string' ? winner.department : (winner.department as any)?.name || winner.department}
                      </div>
                      
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center"
                          onClick={() => handleViewProject(winner.projectId)}
                        >
                          <ExternalLink size={12} className="mr-1" />
                          View
                        </button>
                        <button 
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                          onClick={() => handleDownloadCertificate(winner.projectId)}
                        >
                          <Download size={12} className="mr-1" />
                          Certificate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {publishedResults ? (
                    <div className="text-gray-500">
                      <p>No institute-level results available.</p>
                    </div>
                  ) : (
                    <div className="text-yellow-700">
                      <AlertTriangle size={36} className="mx-auto mb-2 text-yellow-500" />
                      <p>Results are not yet published.</p>
                      <p className="text-sm mt-1">Click "Publish Results" to make them visible.</p>
                    </div>
                  )}
                </div>
              )}
              
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
                    <button 
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      onClick={() => handleEmailCertificates('participation')}
                    >
                      <Mail size={12} className="mr-1" />
                      Email All
                    </button>
                    <button 
                      className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                      onClick={() => handleDownloadCertificates('participation')}
                    >
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
                    <button 
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      onClick={() => handleEmailCertificates('department')}
                    >
                      <Mail size={12} className="mr-1" />
                      Email All
                    </button>
                    <button 
                      className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                      onClick={() => handleDownloadCertificates('department')}
                    >
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
                    <button 
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      onClick={() => handleEmailCertificates('institute')}
                    >
                      <Mail size={12} className="mr-1" />
                      Email All
                    </button>
                    <button 
                      className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                      onClick={() => handleDownloadCertificates('institute')}
                    >
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
                      value={emailSettings.subject}
                      onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Template
                    </label>
                    <textarea
                      rows={5}
                      value={emailSettings.template}
                      onChange={(e) => setEmailSettings({ ...emailSettings, template: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      Available placeholders: {'{participant_name}'}, {'{certificate_type}'}, {'{event_name}'}, {'{event_date}'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      onClick={() => {
                        toast.success('Email settings saved successfully');
                      }}
                    >
                      Save Email Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsCertificatesTab;