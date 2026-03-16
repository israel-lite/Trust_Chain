import React from 'react';
import { validatePassword, getPasswordStrengthClass } from '../utils/passwordValidator';

const PasswordStrengthBar = ({ password }) => {
  const validation = validatePassword(password);
  const strengthPercentage = (validation.score / 5) * 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">Password Strength</span>
        <span 
          className="text-sm font-medium"
          style={{ color: validation.color }}
        >
          {validation.strength}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthClass(validation.strength)}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      {validation.feedback.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          {validation.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center">
              <span className="text-red-500 mr-1">•</span>
              {feedback}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthBar;
