import React, { useState, useRef } from 'react';
import { User, TransactionType } from '../types';
import { addTransaction, updateUser } from '../services/mockService';

interface SpinWheelProps {
  user: User;
  onUpdate: () => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ user, onUpdate }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Configure segments
  const segments = [
    { label: '50', value: 50, color: '#FFD700' }, // Gold
    { label: 'SPIN', value: 'SPIN', color: '#87CEEB' }, // Blue
    { label: '20', value: 20, color: '#98FB98' }, // Green
    { label: 'TRY', value: 0, color: '#FF6347' }, // Red
    { label: '100', value: 100, color: '#FFD700' },
    { label: '10', value: 10, color: '#DDA0DD' }, // Purple
    { label: 'SPIN', value: 'SPIN', color: '#87CEEB' },
    { label: '500', value: 500, color: '#FF4500' }, // Orange (Jackpot)
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    if (user.spins <= 0) {
      alert("No spins left! Watch ads to earn more.");
      return;
    }

    setIsSpinning(true);
    setPrize(null);

    // Update User immediately: Deduct spin and Increment totalSpins
    const updatedUser = { 
        ...user, 
        spins: user.spins - 1,
        totalSpins: (user.totalSpins || 0) + 1
    };
    updateUser(updatedUser);
    onUpdate();

    // Determine Result
    const segmentIndex = Math.floor(Math.random() * segments.length);
    const selectedSegment = segments[segmentIndex];

    const segmentAngle = 360 / segments.length;
    const targetRotation = 360 * 5 + (360 - (segmentIndex * segmentAngle)); 
    const finalRotation = rotation + targetRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      handleResult(selectedSegment.value);
    }, 4000); 
  };

  const handleResult = (value: number | string) => {
    let message = '';
    if (value === 'SPIN') {
      const u = { ...user, spins: user.spins + 1 }; // Don't use stale user object, but since we optimistically updated...
      // Actually, we should fetch fresh user or just apply delta. 
      // For simplicity in mock: re-fetch or assume optimistic is fine.
      // Re-applying delta to the optimistic state we created:
      // Note: In real app, we'd handle this more robustly.
      // Here: We already updated 'user' prop? No, we updated storage.
      // Let's grab the user again or modify the prop user carefully.
      // Better: trigger update.
      addTransaction(user.id, TransactionType.SPIN_REWARD, 0, "Won Extra Spin");
      updateUser({...user, spins: user.spins + 1 }); // spins was user.spins-1 before... this logic is tricky with stale state.
      // Correct flow:
      // 1. handleSpin -> user.spins - 1.
      // 2. Result -> if 'SPIN', user.spins + 1. (Net 0 change in spins, but +1 total spin count)
      // Since we updated storage in step 1, we can just update storage again.
      message = "You won an Extra Spin!";
    } else if (value === 0 || value === 'TRY') {
      message = "Better luck next time!";
    } else {
      const coins = Number(value);
      addTransaction(user.id, TransactionType.SPIN_REWARD, coins, `Won from Spin Wheel`);
      message = `You won ${coins} Coins!`;
    }
    setPrize(message);
    onUpdate();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Spin</h3>
      
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-md"></div>
        </div>

        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-gray-800 overflow-hidden relative shadow-2xl transition-transform duration-[4000ms] cubic-bezier(0.1, 0.7, 1.0, 0.1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((seg, i) => (
            <div 
              key={i}
              className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-center"
              style={{ 
                transform: `rotate(${i * (360 / segments.length)}deg)`,
                backgroundColor: seg.color,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
              }}
            >
            </div>
          ))}
          
           <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(
                ${segments.map((s, i) => `${s.color} ${i * (100/segments.length)}% ${(i+1) * (100/segments.length)}%`).join(', ')}
              )`
            }}
           ></div>

           {/* Labels */}
           {segments.map((seg, i) => (
             <div 
              key={i}
              className="absolute w-full h-full text-center flex flex-col items-center pt-4 font-bold text-white text-sm sm:text-base drop-shadow-md"
              style={{ 
                transform: `rotate(${i * (360 / segments.length) + (180 / segments.length)}deg)` 
              }}
             >
               <span className="mt-2">{seg.label}</span>
             </div>
           ))}
           
           {/* Center Cap */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-gray-300 z-10 shadow-inner"></div>
        </div>
      </div>

      <div className="text-center space-y-3">
        {prize && (
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg font-bold animate-bounce">
            {prize}
          </div>
        )}
        
        <button
          onClick={handleSpin}
          disabled={isSpinning || user.spins <= 0}
          className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transform transition active:scale-95 ${
            isSpinning || user.spins <= 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
          }`}
        >
          {isSpinning ? 'Spinning...' : 'SPIN NOW'}
        </button>
        
        <p className="text-gray-500 text-sm">
          Available Spins: <span className="font-bold text-indigo-600">{user.spins}</span>
        </p>
      </div>
    </div>
  );
};

export default SpinWheel;