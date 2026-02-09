import { useState, useEffect } from 'react';

/**
 * Hook for smooth count up animation
 * @param {number} end - The target number to count up to
 * @param {number} duration - Duration of animation in ms
 * @param {number} start - Starting number (default 0)
 * @returns {number} The current animated value
 */
export const useCountUp = (end, duration = 1000, start = 0) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
        let startTime = null;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = startTime === currentTime ? 0 : (currentTime - startTime) / duration;

            if (progress < 1) {
                // Ease out quart
                const easeOut = 1 - Math.pow(1 - progress, 4);
                setCount(start + (end - start) * easeOut);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, start]);

    return count;
};
