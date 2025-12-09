import React, { useState } from 'react';

function ParticipantSelector({ onParticipantsChange }) {
  const [numParticipants, setNumParticipants] = useState(2);
  const [participantNames, setParticipantNames] = useState(['You', 'Participant 2']);

  const handleNumParticipantsChange = (event) => {
    const newNum = parseInt(event.target.value, 10);
    setNumParticipants(newNum);

    // Adjust participant names array based on new number
    setParticipantNames((prevNames) => {
      const newNames = [...prevNames];
      while (newNames.length < newNum) {
        newNames.push(`Participant ${newNames.length + 1}`);
      }
      return newNames.slice(0, newNum);
    });
  };

  const handleNameChange = (index, event) => {
    const newNames = [...participantNames];
    newNames[index] = event.target.value;
    setParticipantNames(newNames);
  };

  // Notify parent component of changes (e.g., App.jsx)
  React.useEffect(() => {
    onParticipantsChange(participantNames);
  }, [participantNames, onParticipantsChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-3">Participants</h2>

      <div className="mb-4">
        <label htmlFor="numParticipants" className="block text-gray-700 text-sm font-bold mb-2">
          Number of Participants:
        </label>
        <select
          id="numParticipants"
          value={numParticipants}
          onChange={handleNumParticipantsChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {[2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {participantNames.map((name, index) => (
        <div key={index} className="mb-3">
          <label htmlFor={`participantName-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
            Participant {index + 1} Name:
          </label>
          <input
            type="text"
            id={`participantName-${index}`}
            value={name}
            onChange={(e) => handleNameChange(index, e)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={`Enter name for participant ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

export default ParticipantSelector;
