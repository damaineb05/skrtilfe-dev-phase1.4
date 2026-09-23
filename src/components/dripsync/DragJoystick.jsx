import React, { useRef, useState, useCallback, useEffect } from 'react';

const DragJoystick = ({ onMove, onRunToggle, onJump }) => {
    const containerRef = useRef(null);
    const knobRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 80, y: window.innerHeight - 200 });
    const [isRunning, setIsRunning] = useState(false);
    
    const joystickSize = 120;
    const knobSize = 50;
    const maxDistance = (joystickSize - knobSize) / 2;

    const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

    const handleJoystickStart = useCallback((clientX, clientY) => {
        setIsActive(true);
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance <= maxDistance) {
            setKnobOffset({ x: deltaX, y: deltaY });
        }
    }, [maxDistance]);

    const handleJoystickMove = useCallback((clientX, clientY) => {
        if (!isActive || isDragging) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let finalX = deltaX;
        let finalY = deltaY;
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            finalX = Math.cos(angle) * maxDistance;
            finalY = Math.sin(angle) * maxDistance;
        }
        setKnobOffset({ x: finalX, y: finalY });
        const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
        const angle = Math.atan2(finalY, finalX);
        const angleDeg = angle * (180 / Math.PI);
        const keys = { w: false, a: false, s: false, d: false };
        if (normalizedDistance > 0.2) {
            if (angleDeg > -22.5 && angleDeg <= 22.5) { keys.d = true; }
            else if (angleDeg > 22.5 && angleDeg <= 67.5) { keys.w = true; keys.d = true; }
            else if (angleDeg > 67.5 && angleDeg <= 112.5) { keys.w = true; }
            else if (angleDeg > 112.5 && angleDeg <= 157.5) { keys.w = true; keys.a = true; }
            else if (angleDeg > 157.5 || angleDeg <= -157.5) { keys.a = true; }
            else if (angleDeg > -157.5 && angleDeg <= -112.5) { keys.s = true; keys.a = true; }
            else if (angleDeg > -112.5 && angleDeg <= -67.5) { keys.s = true; }
            else if (angleDeg > -67.5 && angleDeg <= -22.5) { keys.s = true; keys.d = true; }
        }
        onMove(keys);
    }, [isActive, isDragging, maxDistance, onMove]);

    const handleJoystickEnd = useCallback(() => {
        setIsActive(false);
        setKnobOffset({ x: 0, y: 0 });
        onMove({ w: false, a: false, s: false, d: false });
    }, [onMove]);

    const handleDragStart = useCallback(() => { setIsDragging(true); }, []);

    const handleDragMove = useCallback((clientX, clientY) => {
        if (!isDragging) return;
        const newX = Math.max(0, Math.min(window.innerWidth - joystickSize, clientX - joystickSize / 2));
        const newY = Math.max(0, Math.min(window.innerHeight - joystickSize, clientY - joystickSize / 2));
        setPosition({ x: newX, y: newY });
    }, [isDragging, joystickSize]);

    const handleDragEnd = useCallback(() => { setIsDragging(false); }, []);

    const handleTouchStart = useCallback((e) => {
        if (e.touches.length > 1) return;
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt((touch.clientX - centerX) ** 2 + (touch.clientY - centerY) ** 2);
        if (distance <= joystickSize / 2) {
            e.preventDefault();
            if (distance > maxDistance + 20) {
                handleDragStart(touch.clientX, touch.clientY);
            } else {
                handleJoystickStart(touch.clientX, touch.clientY);
            }
        }
    }, [handleDragStart, handleJoystickStart, maxDistance, joystickSize]);

    const handleTouchMove = useCallback((e) => {
        if (!isActive && !isDragging) return;
        if (e.touches.length > 1) return;
        e.preventDefault();
        const touch = e.touches[0];
        if (isDragging) {
            handleDragMove(touch.clientX, touch.clientY);
        } else {
            handleJoystickMove(touch.clientX, touch.clientY);
        }
    }, [isDragging, isActive, handleDragMove, handleJoystickMove]);

    const handleTouchEnd = useCallback((e) => {
        if (isActive || isDragging) {
            e.preventDefault();
            handleJoystickEnd();
            handleDragEnd();
        }
    }, [isActive, isDragging, handleJoystickEnd, handleDragEnd]);

    const handleRunToggle = () => {
        setIsRunning(prev => {
            const newState = !prev;
            onRunToggle(newState);
            return newState;
        });
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return (
        <>
            <div
                ref={containerRef}
                className="fixed z-30 select-none"
                style={{
                    left: position.x, top: position.y,
                    width: joystickSize, height: joystickSize,
                    background: isDragging ? 'rgba(var(--primary), 0.3)' : 'rgba(var(--surface-2), 0.6)',
                    border: '3px solid rgba(var(--primary), 0.8)',
                    borderRadius: '50%', backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(var(--primary), 0.2)',
                    transition: isDragging ? 'none' : 'all 0.2s ease',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
            >
                <div className="absolute inset-2 rounded-full border border-dashed border-primary/30">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary/50 rounded-full" />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary/50 rounded-full" />
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary/50 rounded-full" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary/50 rounded-full" />
                </div>
                <div
                    ref={knobRef}
                    className="absolute rounded-full"
                    style={{
                        width: knobSize, height: knobSize,
                        left: '50%', top: '50%',
                        transform: `translate(${-knobSize/2 + knobOffset.x}px, ${-knobSize/2 + knobOffset.y}px)`,
                        background: isActive
                            ? 'linear-gradient(135deg, rgba(var(--primary), 1), rgba(var(--primary), 0.8))'
                            : 'rgba(var(--primary), 0.7)',
                        border: '2px solid rgba(var(--primary), 1)',
                        boxShadow: isActive ? '0 0 20px rgba(var(--primary), 0.8)' : '0 4px 12px rgba(var(--primary), 0.4)',
                        transition: 'all 0.1s ease-out',
                    }}
                >
                    <div className="absolute inset-1 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ lineHeight: '1' }}>
                    ⋮⋮
                </div>
            </div>


        </>
    );
};

export default DragJoystick;