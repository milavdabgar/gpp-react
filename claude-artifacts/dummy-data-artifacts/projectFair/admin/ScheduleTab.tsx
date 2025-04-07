import React, { useState } from 'react';
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

const ScheduleTab = () => {
  const [editMode, setEditMode] = useState(false);
  
  // Sample event schedule
  const eventSchedule = [
    { time: '08:30 AM - 09:30 AM', activity: 'Setup and Registration', location: 'Main Hall Entrance', coordinator: 'Prof. Mehta', notes: 'Ensure all registration materials are ready' },
    { time: '09:30 AM - 10:00 AM', activity: 'Inauguration Ceremony', location: 'Auditorium', coordinator: 'Principal Sharma', notes: 'Chief Guest: Dr. Patel from Industry' },
    { time: '10:00 AM - 12:00 PM', activity: 'Department Jury Evaluation', location: 'Project Stalls', coordinator: 'Dr. Rajesh', notes: 'All department jury members to report by 9:45 AM' },
    { time: '12:00 PM - 01:00 PM', activity: 'Lunch Break', location: 'Cafeteria', coordinator: 'Mrs. Shah', notes: 'Special arrangements for jury members and guests' },
    { time: '01:00 PM - 02:00 PM', activity: 'Open Viewing for Visitors', location: 'Project Stalls', coordinator: 'Mr. Dave', notes: 'Student volunteers to guide visitors' },
    { time: '02:00 PM - 04:00 PM', activity: 'Central Expert Jury Evaluation', location: 'Project Stalls', coordinator: 'Dr. Patel', notes: 'Expert jury to focus on department winners' },
    { time: '04:30 PM - 05:30 PM', activity: 'Award Ceremony and Closing', location: 'Auditorium', coordinator: 'Prof. Singh', notes: 'Certificates to be ready by 4:00 PM' }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Event Schedule - April 9, 2025</h3>
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
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center">
            <Mail size={16} className="mr-1" />
            Send Schedule
          </button>
          <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center">
            <Download size={16} className="mr-1" />
            Export PDF
          </button>
        </div>
      </div>
      
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
                // Calculate position and width based on time
                // This is simplified, in a real app you'd parse the times properly
                let startTime, endTime;
                const [timeRange] = event.time.split(' - ');
                const [startHour, startMinute] = timeRange.split(':');
                const hourOffset = parseInt(startHour) - 8; // 8 AM is our starting point
                
                // Rough estimate of position and width
                const startPos = hourOffset * 8.33 + (parseInt(startMinute) / 60) * 8.33;
                const durationMatch = event.time.match(/(\d+):(\d+) [AP]M - (\d+):(\d+) [AP]M/);
                let width = 8.33; // default 1 hour
                
                if (durationMatch) {
                  const startH = parseInt(durationMatch[1]);
                  const startM = parseInt(durationMatch[2]);
                  const endH = parseInt(durationMatch[3]);
                  const endM = parseInt(durationMatch[4]);
                  
                  let startTimeMinutes = startH * 60 + startM;
                  let endTimeMinutes = endH * 60 + endM;
                  
                  // Convert to 24-hour format if needed
                  if (event.time.includes('PM') && startH < 12) startTimeMinutes += 12 * 60;
                  if (event.time.includes('PM') && endH < 12) endTimeMinutes += 12 * 60;
                  
                  const durationMinutes = endTimeMinutes - startTimeMinutes;
                  width = (durationMinutes / 60) * 8.33;
                }
                
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
                        defaultValue={event.time}
                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input 
                        type="text" 
                        defaultValue={event.activity}
                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input 
                        type="text" 
                        defaultValue={event.location}
                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input 
                        type="text" 
                        defaultValue={event.coordinator}
                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input 
                        type="text" 
                        defaultValue={event.notes}
                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Add new row */}
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <button className="w-full text-blue-600 hover:text-blue-800 text-sm border border-dashed border-blue-300 rounded py-2 hover:bg-blue-50">
                      <Plus size={16} className="inline mr-1" />
                      Add New Event
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                All Students <X size={14} className="ml-1 cursor-pointer" />
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                All Faculty <X size={14} className="ml-1 cursor-pointer" />
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                All Jury Members <X size={14} className="ml-1 cursor-pointer" />
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                External Guests <X size={14} className="ml-1 cursor-pointer" />
              </div>
              <input 
                type="text" 
                placeholder="Add more recipients..." 
                className="border-0 outline-none text-sm flex-grow min-w-[200px]" 
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Optional message to include with the schedule"
            ></textarea>
          </div>
          
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Send Schedule
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
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
    </div>
  );
};

export default ScheduleTab;
