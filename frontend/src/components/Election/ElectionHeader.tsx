import React from 'react';

interface ElectionHeaderProps {
  isActive: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export const ElectionHeader: React.FC<ElectionHeaderProps> = ({
  isActive,
  timeLeft,
  formatTime,
}) => {
  return (
    <div className="election-header">
      <h1 className="election-title">Election Countdown</h1>
      <p className="countdown">
        {isActive ? formatTime(timeLeft) : 'Voting Closed'}
      </p>
    </div>
  );
};