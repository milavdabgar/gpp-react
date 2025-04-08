import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Plus, 
  Mail, 
  Download,
  X,
  Info
} from 'lucide-react';
import projectService from '../../../services/projectApi';
import { toast } from 'react-toastify';

interface ScheduleItem {
  time: string;
  activity: string;
  location: string;
  coordinator: {
    userId: string;
    name: string;
  };
  notes: string;
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
  schedule: ScheduleItem[];
}

const ScheduleTab: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const [eventSchedule, setEventSchedule] = useState<ScheduleItem[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    recipients: [] as string[],
    subject: 'Event Schedule - NPNI Project Fair',
    message: 'Please find attached the schedule for the upcoming project fair.'
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
            schedule: events[0].schedule || []
          } as Event;
          setActiveEvent(event);
          fetchEventSchedule(event._id);
        }
      } catch (err) {
        console.error('Error fetching active events:', err);
        toast.error('Failed to load active event');
      }
    };

    fetchActiveEvent();
  }, []);

  const fetchEventSchedule = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await projectService.getEventSchedule(eventId);
      if (data && data.schedule) {
        setEventSchedule(data.schedule);
      } else {
        setEventSchedule([]);
      }
    } catch (err) {
      console.error('Error fetching event schedule:', err);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheduleItem = () => {
    // Add a new empty schedule item
    setEventSchedule([
      ...eventSchedule,
      {
        time: '',
        activity: '',
        location: '',
        coordinator: {
          userId: 'TBA',
          name: 'TBA'
        },
        notes: ''
      }
    ]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updatedSchedule = [...eventSchedule];
    updatedSchedule.splice(index, 1);
    setEventSchedule(updatedSchedule);
  };

  const handleScheduleItemChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const updatedSchedule = [...eventSchedule];
    if (field === 'time' || field === 'activity' || field === 'location' || field === 'notes') {
      updatedSchedule[index][field] = value;
    } else if (field === 'coordinator') {
      // Special handling for coordinator name
      updatedSchedule[index].coordinator.name = value;
    }
    setEventSchedule(updatedSchedule);
  };

  const handleSaveSchedule = async () => {
    if (!activeEvent) return;

    try {
      setLoading(true);
      await projectService.updateEventSchedule(activeEvent._id, { schedule: eventSchedule });
      toast.success('Schedule saved successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSchedule = async () => {
    try {
      // This would connect to your email service in a real app
      // Here we just simulate a successful operation
      toast.success(`Schedule sent to ${emailSettings.recipients.length} recipients`);
    } catch (err) {
      console.error('Error sending schedule:', err);
      toast.error('Failed to send schedule');
    }
  };

  const handleExportPDF = () => {
    try {
      // In a real app, you would generate a PDF here
      // For now, we'll just show a success message
      toast.success('Schedule exported to PDF');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export PDF');
    }
  };

  const handleAddRecipient = (recipient: string) => {
    setEmailSettings({
      ...emailSettings,
      recipients: [...emailSettings.recipients, recipient]
    });
  };

  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = [...emailSettings.recipients];
    updatedRecipients.splice(index, 1);
    setEmailSettings({
      ...emailSettings,
      recipients: updatedRecipients
    });
  };

  // Calculate positions for timeline visualization
  const getPositionForTime = (timeString: string): { startPos: number, width: number } => {
    // Parse the time range (e.g., "08:30 AM - 09:30 AM")
    const timeMatch = timeString.match(/(\d+):(\d+)\s*([AP]M)\s*-\s*(\d+):(\d+)\s*([AP]M)/i);
    
    if (!timeMatch) return { startPos: 0, width: 8.33 }; // Default 1 hour width
    
    const startHour = parseInt(timeMatch[1]);
    const startMinute = parseInt(timeMatch[2]);
    const startPeriod = timeMatch[3].toUpperCase();
    const endHour = parseInt(timeMatch[4]);
    const endMinute = parseInt(timeMatch[5]);
    const endPeriod = timeMatch[6].toUpperCase();
    
    // Convert to 24-hour format
    let start24Hour = startHour;
    if (startPeriod === 'PM' && startHour < 12) start24Hour += 12;
    if (startPeriod === 'AM' && startHour === 12) start24Hour = 0;
    
    let end24Hour = endHour;
    if (endPeriod === 'PM' && endHour < 12) end24Hour += 12;
    if (endPeriod === 'AM' && endHour === 12) end24Hour = 0;
    
    // Calculate position and width (assuming 8 AM is the starting point of our timeline)
    const startTimeInMinutes = start24Hour * 60 + startMinute;
    const endTimeInMinutes = end24Hour * 60 + endMinute;
    const startOfDay = 8 * 60; // 8 AM
    const dayLength = 11 * 60; // 11 hours (8 AM to 7 PM)
    
    const startPos = ((startTimeInMinutes - startOfDay) / dayLength) * 100;
    const duration = endTimeInMinutes - startTimeInMinutes;
    const width = (duration / dayLength) * 100;
    
    return { startPos, width };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          Event Schedule - {activeEvent ? new Date(activeEvent.eventDate).toLocaleDateString() : ''}
        </h3>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm flex items-center"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Calendar size={16} className="mr-1" />
                View Mode
              </>
            ) : (
              <>
                <Edit size={16} className="mr-1" />
                Edit Schedule
              </>
            )}
          </button>
          <button 
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
            onClick={handleSendSchedule}
          >
            <Mail size={16} className="mr-1" />
            Send Schedule
          </button>
          <button 
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center"
            onClick={handleExportPDF}
          >
            <Download size={16} className="mr-1" />
            Export PDF
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading schedule data...</div>
      ) : (
        <>
          {/* Schedule Timeline */}
          {!editMode ? (
            <div className="relative">
              {/* Time indicators */}
              <div className="absolute top-0 bottom-0 left-0 w-16 border-r border-gray-200 bg-gray-50 z-10"></div>
              <div className="ml-16 relative">
                {['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'].map((time, index) => (
                  <div key={index} className="absolute text-xs text-gray-500" style={{ left: `${index * 8.33}%`, top: '-20px' }}>
                    {time}
                  </div>
                ))}
                
                {/* Time grid lines */}
                <div className="h-full grid grid-cols-12 absolute inset-0">
                  {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className="border-l border-gray-200 h-full"></div>
                  ))}
                </div>
                
                {/* Events */}
                <div className="relative pt-6 pb-12">
                  {eventSchedule.map((event, index) => {
                    const { startPos, width } = getPositionForTime(event.time);
                    
                    return (
                      <div
                        key={index}
                        className="absolute h-20 rounded-lg border border-blue-200 bg-blue-50 p-2 overflow-hidden text-xs"
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`,
                          top: `${index * 84 + 6}px`
                        }}
                      >
                        <div className="font-medium text-blue-800">{event.activity}</div>
                        <div className="flex items-center text-blue-600 mt-1">
                          <Clock size={12} className="mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin size={12} className="mr-1" />
                          {event.location}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventSchedule.map((event, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input 
                            type="text" 
                            value={event.time}
                            onChange={(e) => handleScheduleItemChange(index, 'time', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                            placeholder="e.g. 09:00 AM - 10:00 AM"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input 
                            type="text" 
                            value={event.activity}
                            onChange={(e) => handleScheduleItemChange(index, 'activity', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                            placeholder="Activity name"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input 
                            type="text" 
                            value={event.location}
                            onChange={(e) => handleScheduleItemChange(index, 'location', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                            placeholder="Location"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input 
                            type="text" 
                            value={event.coordinator.name}
                            onChange={(e) => handleScheduleItemChange(index, 'coordinator', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                            placeholder="Coordinator name"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input 
                            type="text" 
                            value={event.notes}
                            onChange={(e) => handleScheduleItemChange(index, 'notes', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                            placeholder="Notes"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleRemoveScheduleItem(index)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Add new row */}
                    <tr>
                      <td colSpan={6} className="px-6 py-4">
                        <button 
                          className="w-full text-blue-600 hover:text-blue-800 text-sm border border-dashed border-blue-300 rounded py-2 hover:bg-blue-50"
                          onClick={handleAddScheduleItem}
                        >
                          <Plus size={16} className="inline mr-1" />
                          Add New Event
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    // Reset to original schedule and exit edit mode
                    if (activeEvent) {
                      fetchEventSchedule(activeEvent._id);
                    }
                    setEditMode(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleSaveSchedule}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {/* Schedule Distribution */}
          <div className="mt-8">
            <h4 className="font-medium text-gray-700 mb-4">Schedule Distribution</h4>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients
                </label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md">
                  {emailSettings.recipients.map((recipient, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                      {recipient} <X size={14} className="ml-1 cursor-pointer" onClick={() => handleRemoveRecipient(index)} />
                    </div>
                  ))}
                  {/* Quick add buttons for groups */}
                  {emailSettings.recipients.length === 0 && (
                    <>
                      <button 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        onClick={() => handleAddRecipient('All Students')}
                      >
                        + All Students
                      </button>
                      <button 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        onClick={() => handleAddRecipient('All Faculty')}
                      >
                        + All Faculty
                      </button>
                      <button 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        onClick={() => handleAddRecipient('All Jury Members')}
                      >
                        + All Jury Members
                      </button>
                      <button 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        onClick={() => handleAddRecipient('External Guests')}
                      >
                        + External Guests
                      </button>
                    </>
                  )}
                  <input 
                    type="text" 
                    placeholder="Add more recipients..." 
                    className="border-0 outline-none text-sm flex-grow min-w-[200px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleAddRecipient(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={emailSettings.message}
                  onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Optional message to include with the schedule"
                ></textarea>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  onClick={handleSendSchedule}
                  disabled={emailSettings.recipients.length === 0}
                >
                  Send Schedule
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  onClick={() => {
                    // Preview email modal would go here
                    toast.info('Email preview feature coming soon');
                  }}
                >
                  Preview Email
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional information section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <Info size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800">Important Information</h5>
              <p className="text-sm text-blue-700 mt-1">
                The schedule is subject to change. Any updates will be communicated to all participants via email and the portal. 
                Please ensure all activities start and end on time to maintain the event flow.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleTab;
