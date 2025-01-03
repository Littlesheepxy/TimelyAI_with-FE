import React from 'react';

function ScheduleCard({ schedule }) {
    return (
        <div>
            <h3>{schedule.title}</h3>
            <p>{schedule.time}</p>
        </div>
    );
}

export default ScheduleCard; 