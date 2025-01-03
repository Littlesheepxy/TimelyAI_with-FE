import React from 'react';
import { useTranslation } from 'react-i18next';

function SchedulePage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('scheduleOverview')}</h1>
            <div className="schedule-container">
                <button>周视图</button>
                <button>月视图</button>
                <div className="calendar-view">
                    {/* 日历视图 */}
                </div>
            </div>
        </div>
    );
}

export default SchedulePage; 